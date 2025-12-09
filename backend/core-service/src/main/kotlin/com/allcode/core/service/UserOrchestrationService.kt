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
class UserOrchestrationService(
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(UserOrchestrationService::class.java)
    private val pendingRequests = ConcurrentHashMap<String, CompletableFuture<UserOperationResponse>>()
    
    companion object {
        const val USER_REQUEST_QUEUE = "user.operations.request"
        const val USER_RESPONSE_QUEUE = "user.operations.response"
        const val TIMEOUT_SECONDS = 30L
    }
    
    fun createUser(request: CreateUserRequest): UserResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Creating user via JMS. CorrelationId: $correlationId, email: ${request.email}")
        
        val message = UserOperationMessage(
            operation = UserOperation.CREATE_USER,
            data = request,
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Failed to create user")
        }
        
        return objectMapper.convertValue(response.data, UserResponse::class.java)
    }
    
    fun getUserById(userId: String): UserResponse? {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Getting user by ID via JMS. CorrelationId: $correlationId, userId: $userId")
        
        val message = UserOperationMessage(
            operation = UserOperation.GET_USER_BY_ID,
            data = mapOf("userId" to userId),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            return null
        }
        
        return objectMapper.convertValue(response.data, UserResponse::class.java)
    }
    
    fun getUserByEmail(email: String): UserResponse? {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Getting user by email via JMS. CorrelationId: $correlationId, email: $email")
        
        val message = UserOperationMessage(
            operation = UserOperation.GET_USER_BY_EMAIL,
            data = mapOf("email" to email),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            return null
        }
        
        return objectMapper.convertValue(response.data, UserResponse::class.java)
    }
    
    fun getUsers(status: UserStatus? = null, role: UserRole? = null): List<UserResponse> {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Getting users via JMS. CorrelationId: $correlationId")
        
        val message = UserOperationMessage(
            operation = UserOperation.GET_USERS,
            data = mapOf(
                "status" to status,
                "role" to role
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Failed to get users")
        }
        
        @Suppress("UNCHECKED_CAST")
        val usersList = response.data as? List<Map<String, Any>> ?: emptyList()
        return usersList.map { objectMapper.convertValue(it, UserResponse::class.java) }
    }
    
    fun updateUser(userId: String, request: UpdateUserRequest): UserResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Updating user via JMS. CorrelationId: $correlationId, userId: $userId")
        
        val message = UserOperationMessage(
            operation = UserOperation.UPDATE_USER,
            data = mapOf(
                "userId" to userId,
                "updates" to request
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Failed to update user")
        }
        
        return objectMapper.convertValue(response.data, UserResponse::class.java)
    }
    
    fun deleteUser(userId: String): Boolean {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Deleting user via JMS. CorrelationId: $correlationId, userId: $userId")
        
        val message = UserOperationMessage(
            operation = UserOperation.DELETE_USER,
            data = mapOf("userId" to userId),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        return response.success
    }
    
    fun assignRole(userId: String, role: UserRole): UserResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Assigning role via JMS. CorrelationId: $correlationId, userId: $userId, role: $role")
        
        val message = UserOperationMessage(
            operation = UserOperation.ASSIGN_ROLE,
            data = mapOf(
                "userId" to userId,
                "role" to role
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Failed to assign role")
        }
        
        return objectMapper.convertValue(response.data, UserResponse::class.java)
    }
    
    fun revokeRole(userId: String, role: UserRole): UserResponse {
        val correlationId = UUID.randomUUID().toString()
        logger.info("Revoking role via JMS. CorrelationId: $correlationId, userId: $userId, role: $role")
        
        val message = UserOperationMessage(
            operation = UserOperation.REVOKE_ROLE,
            data = mapOf(
                "userId" to userId,
                "role" to role
            ),
            correlationId = correlationId
        )
        
        val response = sendAndWaitForResponse(message, correlationId)
        
        if (!response.success) {
            throw RuntimeException(response.error ?: "Failed to revoke role")
        }
        
        return objectMapper.convertValue(response.data, UserResponse::class.java)
    }
    
    private fun sendAndWaitForResponse(message: UserOperationMessage, correlationId: String): UserOperationResponse {
        val future = CompletableFuture<UserOperationResponse>()
        pendingRequests[correlationId] = future
        
        try {
            // Send message to user service
            jmsTemplate.convertAndSend(USER_REQUEST_QUEUE, objectMapper.writeValueAsString(message))
            logger.debug("Sent JMS message to $USER_REQUEST_QUEUE: $message")
            
            // Wait for response
            val response = future.get(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            logger.debug("Received response for correlationId: $correlationId")
            return response
            
        } catch (e: Exception) {
            logger.error("Error processing user operation: ${e.message}", e)
            throw RuntimeException("User operation failed: ${e.message}", e)
        } finally {
            pendingRequests.remove(correlationId)
        }
    }
    
    fun handleResponse(responseJson: String) {
        try {
            val response: UserOperationResponse = objectMapper.readValue(responseJson)
            logger.debug("Received user response: ${response.correlationId}")
            
            val future = pendingRequests[response.correlationId]
            if (future != null) {
                future.complete(response)
            } else {
                logger.warn("No pending request found for correlationId: ${response.correlationId}")
            }
        } catch (e: Exception) {
            logger.error("Error handling user response: ${e.message}", e)
        }
    }
}
