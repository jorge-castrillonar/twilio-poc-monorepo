package com.allcode.auth.client

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.UUID

data class CredentialValidationRequest(
    val email: String,
    val password: String
)

data class CredentialValidationResponse(
    val valid: Boolean,
    val userId: UUID?,
    val email: String?,
    val firstName: String?,
    val lastName: String?,
    val roles: Set<String>?
)

data class UserResponse(
    val id: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val roles: Set<String>
)

@Component
class UserServiceClient(
    private val userServiceWebClient: WebClient
) {
    private val logger = LoggerFactory.getLogger(UserServiceClient::class.java)

    @Value("\${user-service.endpoints.validate-credentials}")
    private lateinit var validateCredentialsEndpoint: String

    @Value("\${user-service.base-url}")
    private lateinit var userServiceBaseUrl: String

    /**
     * Validate user credentials against user-service
     */
    fun validateCredentials(email: String, password: String): CredentialValidationResponse {
        return try {
            val request = CredentialValidationRequest(email, password)
            
            userServiceWebClient.post()
                .uri(validateCredentialsEndpoint)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(CredentialValidationResponse::class.java)
                .block() ?: CredentialValidationResponse(
                    valid = false,
                    userId = null,
                    email = null,
                    firstName = null,
                    lastName = null,
                    roles = null
                )
        } catch (e: Exception) {
            logger.error("Failed to validate credentials with user-service", e)
            CredentialValidationResponse(
                valid = false,
                userId = null,
                email = null,
                firstName = null,
                lastName = null,
                roles = null
            )
        }
    }

    /**
     * Get user by ID from user-service
     */
    fun getUserById(userId: UUID): UserResponse {
        return try {
            val response = userServiceWebClient.get()
                .uri("/api/users/$userId")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block()

            if (response != null) {
                return UserResponse(
                    id = UUID.fromString(response["id"] as String),
                    email = response["email"] as String,
                    firstName = response["firstName"] as String,
                    lastName = response["lastName"] as String,
                    roles = (response["roles"] as? List<*>)?.mapNotNull { it as? String }?.toSet() ?: emptySet()
                )
            }
            
            throw IllegalStateException("Failed to get user by ID")
        } catch (e: Exception) {
            logger.error("Failed to get user by ID from user-service", e)
            throw IllegalStateException("Failed to get user by ID: ${e.message}")
        }
    }
}
