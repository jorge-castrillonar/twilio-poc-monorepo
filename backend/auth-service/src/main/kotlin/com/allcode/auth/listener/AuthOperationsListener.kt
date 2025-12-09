package com.allcode.auth.listener

import com.allcode.auth.dto.*
import com.allcode.auth.service.AuthService
import com.allcode.auth.service.MfaService
import com.allcode.auth.service.RefreshTokenService
import com.allcode.auth.security.JwtTokenProvider
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.jms.annotation.JmsListener
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Component
import org.slf4j.LoggerFactory
import java.util.UUID

@Component
class AuthOperationsListener(
    private val authService: AuthService,
    private val mfaService: MfaService,
    private val refreshTokenService: RefreshTokenService,
    private val jwtTokenProvider: JwtTokenProvider,
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper
) {
    companion object {
        private val logger = LoggerFactory.getLogger(AuthOperationsListener::class.java)
        private const val RESPONSE_QUEUE = "auth.operations.response"
    }

    @JmsListener(destination = "auth.operations.request")
    fun handleAuthOperation(message: String) {
        logger.debug("Received auth operation message: $message")
        
        try {
            val request = objectMapper.readValue<AuthOperationMessage>(message)
            logger.info("Processing auth operation: ${request.operation} with correlation ID: ${request.correlationId}")
            
            val response = when (request.operation.uppercase()) {
                "LOGIN" -> handleLogin(request)
                "REFRESH_TOKEN" -> handleRefreshToken(request)
                "LOGOUT" -> handleLogout(request)
                "SETUP_MFA" -> handleSetupMfa(request)
                "ENABLE_MFA" -> handleEnableMfa(request)
                "DISABLE_MFA" -> handleDisableMfa(request)
                "VERIFY_TOKEN" -> handleVerifyToken(request)
                else -> AuthOperationResponse(
                    success = false,
                    error = "Unknown operation: ${request.operation}",
                    correlationId = request.correlationId
                )
            }
            
            logger.debug("Sending response for correlation ID: ${request.correlationId}")
            jmsTemplate.convertAndSend(RESPONSE_QUEUE, objectMapper.writeValueAsString(response))
            
        } catch (e: Exception) {
            logger.error("Error processing auth operation: ${e.message}", e)
            try {
                val errorResponse = AuthOperationResponse(
                    success = false,
                    error = "Internal error: ${e.message}",
                    correlationId = "unknown"
                )
                jmsTemplate.convertAndSend(RESPONSE_QUEUE, objectMapper.writeValueAsString(errorResponse))
            } catch (ex: Exception) {
                logger.error("Failed to send error response: ${ex.message}", ex)
            }
        }
    }
    
    private fun handleLogin(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            val loginRequest = objectMapper.convertValue(request.data, LoginRequest::class.java)
            val loginResponse = authService.login(loginRequest, ipAddress = null, userAgent = null)
            
            val responseData = mapOf(
                "accessToken" to loginResponse.accessToken,
                "refreshToken" to loginResponse.refreshToken,
                "tokenType" to loginResponse.tokenType,
                "expiresIn" to loginResponse.expiresIn,
                "user" to mapOf(
                    "id" to loginResponse.userId.toString(),
                    "email" to loginResponse.email,
                    "firstName" to loginResponse.firstName,
                    "lastName" to loginResponse.lastName,
                    "roles" to loginResponse.roles.toList()
                ),
                "mfaRequired" to loginResponse.mfaRequired
            )
            
            AuthOperationResponse(
                success = true,
                data = responseData,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error during login: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "Login failed",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleRefreshToken(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            val refreshRequest = objectMapper.convertValue(request.data, RefreshTokenRequest::class.java)
            val refreshResponse = authService.refreshToken(refreshRequest.refreshToken, ipAddress = null)
            
            val responseData = mapOf(
                "accessToken" to refreshResponse.accessToken,
                "refreshToken" to refreshResponse.refreshToken,
                "tokenType" to refreshResponse.tokenType,
                "expiresIn" to refreshResponse.expiresIn,
                "user" to mapOf(
                    "id" to refreshResponse.userId.toString(),
                    "email" to refreshResponse.email,
                    "firstName" to refreshResponse.firstName,
                    "lastName" to refreshResponse.lastName,
                    "roles" to refreshResponse.roles.toList()
                ),
                "mfaRequired" to false
            )
            
            AuthOperationResponse(
                success = true,
                data = responseData,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error during token refresh: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "Token refresh failed",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleLogout(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            val logoutRequest = objectMapper.convertValue(request.data, LogoutRequest::class.java)
            authService.logout(logoutRequest.refreshToken)
            
            AuthOperationResponse(
                success = true,
                data = true,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error during logout: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "Logout failed",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleSetupMfa(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val email = data["email"] as? String ?: throw IllegalArgumentException("email is required")
            val userId = UUID.fromString(userIdStr)
            
            val mfaSetup = mfaService.setupMfa(userId, email)
            
            val responseData = mapOf(
                "secret" to mfaSetup.secret,
                "qrCodeUrl" to mfaSetup.qrCodeUrl,
                "backupCodes" to mfaSetup.backupCodes
            )
            
            AuthOperationResponse(
                success = true,
                data = responseData,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error setting up MFA: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "MFA setup failed",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleEnableMfa(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            val totpCode = data["totpCode"] as? String ?: throw IllegalArgumentException("totpCode is required")
            
            mfaService.enableMfa(userId, totpCode)
            
            AuthOperationResponse(
                success = true,
                data = true,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error enabling MFA: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "MFA enable failed",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleDisableMfa(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            
            mfaService.disableMfa(userId)
            
            AuthOperationResponse(
                success = true,
                data = true,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error disabling MFA: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "MFA disable failed",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleVerifyToken(request: AuthOperationMessage): AuthOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val token = data["token"] as? String ?: throw IllegalArgumentException("token is required")
            
            val claims = jwtTokenProvider.validateToken(token)
            
            if (claims != null) {
                val responseData = mapOf(
                    "valid" to true,
                    "userId" to claims.userId.toString(),
                    "email" to claims.email,
                    "roles" to claims.roles.toList(),
                    "exp" to claims.expiresAt.toEpochMilli()
                )
                
                AuthOperationResponse(
                    success = true,
                    data = responseData,
                    correlationId = request.correlationId
                )
            } else {
                AuthOperationResponse(
                    success = false,
                    error = "Invalid token",
                    correlationId = request.correlationId
                )
            }
        } catch (e: Exception) {
            logger.error("Error verifying token: ${e.message}", e)
            AuthOperationResponse(
                success = false,
                error = e.message ?: "Token verification failed",
                correlationId = request.correlationId
            )
        }
    }
}
