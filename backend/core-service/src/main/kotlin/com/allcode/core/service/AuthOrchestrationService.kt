package com.allcode.core.service

import com.allcode.core.dto.*
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Service
import org.slf4j.LoggerFactory
import java.util.UUID
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

@Service
class AuthOrchestrationService(
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper,
    private val userOrchestrationService: UserOrchestrationService
) {
    private val logger = LoggerFactory.getLogger(AuthOrchestrationService::class.java)
    private val pendingRequests = ConcurrentHashMap<String, CompletableFuture<AuthOperationResponse>>()
    
    companion object {
        const val AUTH_REQUEST_QUEUE = "auth.operations.request"
        const val AUTH_RESPONSE_QUEUE = "auth.operations.response"
        const val TIMEOUT_SECONDS = 30L
    }
    
    fun login(request: LoginRequest): AuthResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Login via JMS. CorrelationId: $correlationId, email: ${request.email}")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.LOGIN,
            data = request,
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Login failed")
        }
        
        return objectMapper.convertValue(response.data, AuthResponse::class.java)
    }
    
    fun refreshToken(request: RefreshTokenRequest): AuthResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Refresh token via JMS. CorrelationId: $correlationId")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.REFRESH_TOKEN,
            data = request,
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Token refresh failed")
        }
        
        return objectMapper.convertValue(response.data, AuthResponse::class.java)
    }
    
    fun logout(request: LogoutRequest): Boolean {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Logout via JMS. CorrelationId: $correlationId")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.LOGOUT,
            data = request,
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        return response.success
    }
    
    fun setupMfa(userId: String): MfaSetupResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Setup MFA via JMS. CorrelationId: $correlationId, userId: $userId")
        
        // Fetch user email from user-service
        val user = userOrchestrationService.getUserById(userId)
            ?: throw RuntimeException("User not found: $userId")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.SETUP_MFA,
            data = mapOf(
                "userId" to userId,
                "email" to user.email  // Include email as required by auth-service
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "MFA setup failed")
        }
        
        return objectMapper.convertValue(response.data, MfaSetupResponse::class.java)
    }
    
    fun enableMfa(userId: String, request: EnableMfaRequest): Boolean {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Enable MFA via JMS. CorrelationId: $correlationId, userId: $userId")
        
        // Fetch user email from user-service
        val user = userOrchestrationService.getUserById(userId)
            ?: throw RuntimeException("User not found: $userId")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.ENABLE_MFA,
            data = mapOf(
                "userId" to userId,
                "email" to user.email,  // Include email as required by auth-service
                "totpCode" to request.totpCode
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        return response.success
    }
    
    fun disableMfa(userId: String): Boolean {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Disable MFA via JMS. CorrelationId: $correlationId, userId: $userId")
        
        // Fetch user email from user-service
        val user = userOrchestrationService.getUserById(userId)
            ?: throw RuntimeException("User not found: $userId")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.DISABLE_MFA,
            data = mapOf(
                "userId" to userId,
                "email" to user.email  // Include email as required by auth-service
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        return response.success
    }
    
    fun verifyToken(token: String): Map<String, Any>? {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Verify token via JMS. CorrelationId: $correlationId")
        
        val message = AuthOperationMessage(
            operation = AuthOperation.VERIFY_TOKEN,
            data = mapOf("token" to token),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            return null
        }
        
        @Suppress("UNCHECKED_CAST")
        return response.data as? Map<String, Any>
    }
    
    private fun sendAndWaitForResponse(message: AuthOperationMessage, correlationId: String): AuthOperationResponse {
        val future = CompletableFuture<AuthOperationResponse>()
        pendingRequests[correlationId] = future
        
        try {
            // Send message to auth service
            jmsTemplate.convertAndSend(AUTH_REQUEST_QUEUE, objectMapper.writeValueAsString(message))
            logger.debug("Sent JMS message to $AUTH_REQUEST_QUEUE: $message")
            
            // Wait for response
            val response = future.get(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            logger.debug("Received response for correlationId: $correlationId")
            return response
            
        } catch (e: Exception) {
            logger.error("Error processing auth operation: ${e.message}", e)
            throw RuntimeException("Auth operation failed: ${e.message}", e)
        } finally {
            pendingRequests.remove(correlationId)
        }
    }
    
    fun handleResponse(responseJson: String) {
        try {
            val response: AuthOperationResponse = objectMapper.readValue(responseJson)
            logger.debug("Received auth response: ${response.correlationId}")
            
            val future = pendingRequests[response.correlationId]
            if (future != null) {
                future.complete(response)
            } else {
                logger.warn("No pending request found for correlationId: ${response.correlationId}")
            }
        } catch (e: Exception) {
            logger.error("Error handling auth response: ${e.message}", e)
        }
    }
}
