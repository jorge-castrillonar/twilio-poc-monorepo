package com.allcode.graphql.client

import com.allcode.graphql.model.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.slf4j.LoggerFactory

@Component
class AuthServiceClient(
    @Value("\${services.core.url:http://localhost:8081}")
    private val coreServiceUrl: String,
    private val objectMapper: ObjectMapper,
    private val userServiceClient: UserServiceClient
) {
    private val logger = LoggerFactory.getLogger(AuthServiceClient::class.java)
    private val webClient: WebClient = WebClient.builder().baseUrl(coreServiceUrl).build()
    
    suspend fun login(input: LoginInput): AuthResponse {
        logger.info("Login via Core Service: ${input.email}")
        
        val response = webClient.post()
            .uri("/api/v1/auth/login")
            .bodyValue(mapOf(
                "email" to input.email,
                "password" to input.password,
                "mfaCode" to input.mfaCode
            ))
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        return parseAuthResponse(response)
    }
    
    suspend fun refreshToken(input: RefreshTokenInput): AuthResponse {
        logger.info("Refreshing token via Core Service")
        
        val response = webClient.post()
            .uri("/api/v1/auth/refresh")
            .bodyValue(mapOf("refreshToken" to input.refreshToken))
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        return parseAuthResponse(response)
    }
    
    suspend fun logout(input: LogoutInput): Boolean {
        return try {
            logger.info("Logout via Core Service")
            val response = webClient.post()
                .uri("/api/v1/auth/logout")
                .bodyValue(mapOf("refreshToken" to input.refreshToken))
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            response["success"] as? Boolean ?: false
        } catch (e: Exception) {
            logger.error("Error during logout: ${e.message}")
            false
        }
    }
    
    suspend fun setupMfa(userId: String): MfaSetupResponse {
        logger.info("Setting up MFA via Core Service for user: $userId")
        
        val response = webClient.post()
            .uri("/api/v1/auth/mfa/setup")
            .header("X-User-Id", userId)
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        val data = response["data"] as? Map<String, Any> 
            ?: throw RuntimeException("Invalid MFA setup response")
        
        @Suppress("UNCHECKED_CAST")
        return MfaSetupResponse(
            secret = data["secret"] as String,
            qrCodeUrl = data["qrCodeUrl"] as String,
            backupCodes = data["backupCodes"] as? List<String> ?: emptyList()
        )
    }
    
    suspend fun enableMfa(userId: String, input: EnableMfaInput): Boolean {
        return try {
            logger.info("Enabling MFA via Core Service for user: $userId")
            val response = webClient.post()
                .uri("/api/v1/auth/mfa/enable")
                .header("X-User-Id", userId)
                .bodyValue(mapOf("totpCode" to input.totpCode))
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            response["success"] as? Boolean ?: false
        } catch (e: Exception) {
            logger.error("Error enabling MFA: ${e.message}")
            false
        }
    }
    
    suspend fun disableMfa(userId: String): Boolean {
        return try {
            logger.info("Disabling MFA via Core Service for user: $userId")
            val response = webClient.post()
                .uri("/api/v1/auth/mfa/disable")
                .header("X-User-Id", userId)
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            response["success"] as? Boolean ?: false
        } catch (e: Exception) {
            logger.error("Error disabling MFA: ${e.message}")
            false
        }
    }
    
    suspend fun verifyToken(token: String): TokenVerificationResult {
        return try {
            logger.info("Verifying token via Core Service")
            val response = webClient.post()
                .uri("/api/v1/auth/verify")
                .bodyValue(mapOf("token" to token))
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            val data = response["data"] as? Map<String, Any>
            if (data == null) {
                return TokenVerificationResult(
                    valid = false,
                    message = "Invalid token verification response"
                )
            }
            
            // Parse user claims if present
            @Suppress("UNCHECKED_CAST")
            val rolesData = data["roles"] as? List<Any>
            val roles = rolesData?.mapNotNull {
                val roleStr = it.toString()
                try { UserRole.valueOf(roleStr) } catch (e: Exception) { null }
            }?.toSet()
            
            TokenVerificationResult(
                valid = true,
                userId = data["userId"]?.toString(),
                email = data["email"] as? String,
                roles = roles,
                expiresAt = data["exp"]?.let { parseDateTime(it) },
                message = "Token is valid"
            )
        } catch (e: Exception) {
            logger.error("Error verifying token: ${e.message}")
            TokenVerificationResult(
                valid = false,
                message = e.message ?: "Token verification failed"
            )
        }
    }
    
    private suspend fun parseAuthResponse(response: Map<String, Any>): AuthResponse {
        val data = response["data"] as? Map<String, Any> 
            ?: throw RuntimeException("Invalid auth response format")
        
        // Extract user data
        @Suppress("UNCHECKED_CAST")
        val userData = data["user"] as? Map<String, Any> 
            ?: throw RuntimeException("User data not found in auth response")
        
        val user = parseUser(userData)
        
        return AuthResponse(
            accessToken = data["accessToken"] as String,
            refreshToken = data["refreshToken"] as String,
            tokenType = data["tokenType"] as? String ?: "Bearer",
            expiresIn = (data["expiresIn"] as? Number)?.toInt() ?: 3600,
            user = user,
            mfaRequired = data["mfaRequired"] as? Boolean ?: false
        )
    }
    
    private fun parseUser(userData: Map<String, Any>): User {
        @Suppress("UNCHECKED_CAST")
        val rolesData = userData["roles"] as? List<Any> ?: emptyList()
        val roles = rolesData.mapNotNull {
            val roleStr = it.toString()
            try { UserRole.valueOf(roleStr) } catch (e: Exception) { null }
        }.toSet()
        
        val statusStr = userData["status"] as? String ?: "ACTIVE"
        val status = try { UserStatus.valueOf(statusStr) } catch (e: Exception) { UserStatus.ACTIVE }
        
        return User(
            id = userData["id"].toString(),
            email = userData["email"] as String,
            firstName = userData["firstName"] as? String ?: "",
            lastName = userData["lastName"] as? String ?: "",
            fullName = userData["fullName"] as? String ?: userData["email"] as String,
            roles = roles,
            status = status,
            mfaEnabled = userData["mfaEnabled"] as? Boolean ?: false,
            createdAt = parseDateTime(userData["createdAt"]),
            updatedAt = parseDateTime(userData["updatedAt"])
        )
    }
    
    private fun parseDateTime(value: Any?): java.time.Instant {
        return try {
            when (value) {
                is String -> java.time.Instant.parse(value)
                is Number -> java.time.Instant.ofEpochMilli(value.toLong())
                else -> java.time.Instant.now()
            }
        } catch (e: Exception) {
            java.time.Instant.now()
        }
    }
}
