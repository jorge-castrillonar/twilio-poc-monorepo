package com.allcode.graphql.client

import com.allcode.graphql.model.*
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.slf4j.LoggerFactory

@Component
class UserServiceClient(
    @Value("\${services.core.url:http://localhost:8081}")
    private val coreServiceUrl: String,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(UserServiceClient::class.java)
    private val webClient: WebClient = WebClient.builder().baseUrl(coreServiceUrl).build()
    
    suspend fun createUser(input: CreateUserInput): User {
        logger.info("Creating user via Core Service: ${input.email}")
        
        val response = webClient.post()
            .uri("/api/v1/users")
            .bodyValue(mapOf(
                "email" to input.email,
                "password" to input.password,
                "firstName" to input.firstName,
                "lastName" to input.lastName,
                "roles" to input.roles.map { it.name }
            ))
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        return parseUserResponse(response)
    }
    
    suspend fun getUserById(userId: String): User? {
        return try {
            logger.info("Getting user by ID via Core Service: $userId")
            val response = webClient.get()
                .uri("/api/v1/users/{userId}", userId)
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            parseUserResponse(response)
        } catch (e: Exception) {
            logger.error("Error getting user by ID: ${e.message}")
            null
        }
    }
    
    suspend fun getUserByEmail(email: String): User? {
        return try {
            logger.info("Getting user by email via Core Service: $email")
            val response = webClient.get()
                .uri("/api/v1/users/email/{email}", email)
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            parseUserResponse(response)
        } catch (e: Exception) {
            logger.error("Error getting user by email: ${e.message}")
            null
        }
    }
    
    suspend fun getUsers(status: UserStatus? = null, role: UserRole? = null): List<User> {
        return try {
            logger.info("Getting users via Core Service - status: $status, role: $role")
            
            var uri = "/api/v1/users"
            val params = mutableListOf<String>()
            if (status != null) params.add("status=$status")
            if (role != null) params.add("role=$role")
            if (params.isNotEmpty()) {
                uri += "?" + params.joinToString("&")
            }
            
            val response = webClient.get()
                .uri(uri)
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            val data = response["data"] as? List<Map<String, Any>> ?: emptyList()
            data.map { parseUserFromData(it) }
        } catch (e: Exception) {
            logger.error("Error getting users: ${e.message}")
            emptyList()
        }
    }
    
    suspend fun updateUser(userId: String, input: UpdateUserInput): User {
        logger.info("Updating user via Core Service: $userId")
        
        val body = mutableMapOf<String, Any?>()
        input.firstName?.let { body["firstName"] = it }
        input.lastName?.let { body["lastName"] = it }
        input.status?.let { body["status"] = it.name }
        
        val response = webClient.put()
            .uri("/api/v1/users/{userId}", userId)
            .bodyValue(body)
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        return parseUserResponse(response)
    }
    
    suspend fun deleteUser(userId: String): Boolean {
        return try {
            logger.info("Deleting user via Core Service: $userId")
            val response = webClient.delete()
                .uri("/api/v1/users/{userId}", userId)
                .retrieve()
                .awaitBody<Map<String, Any>>()
            
            response["success"] as? Boolean ?: false
        } catch (e: Exception) {
            logger.error("Error deleting user: ${e.message}")
            false
        }
    }
    
    suspend fun assignRole(userId: String, role: UserRole): User {
        logger.info("Assigning role $role to user via Core Service: $userId")
        
        val response = webClient.post()
            .uri("/api/v1/users/{userId}/roles", userId)
            .bodyValue(mapOf("role" to role.name))
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        return parseUserResponse(response)
    }
    
    suspend fun revokeRole(userId: String, role: UserRole): User {
        logger.info("Revoking role $role from user via Core Service: $userId")
        
        val response = webClient.delete()
            .uri("/api/v1/users/{userId}/roles/{role}", userId, role.name)
            .retrieve()
            .awaitBody<Map<String, Any>>()
        
        return parseUserResponse(response)
    }
    
    private fun parseUserResponse(response: Map<String, Any>): User {
        val data = response["data"] as? Map<String, Any> 
            ?: throw RuntimeException("Invalid response format")
        return parseUserFromData(data)
    }
    
    private fun parseUserFromData(data: Map<String, Any>): User {
        @Suppress("UNCHECKED_CAST")
        val rolesData = data["roles"] as? List<String> ?: emptyList()
        val roles = rolesData.mapNotNull {
            try { UserRole.valueOf(it) } catch (e: Exception) { null }
        }.toSet()
        
        val statusStr = data["status"] as? String ?: "ACTIVE"
        val status = try { UserStatus.valueOf(statusStr) } catch (e: Exception) { UserStatus.ACTIVE }
        
        return User(
            id = data["id"].toString(),
            email = data["email"] as String,
            firstName = data["firstName"] as String,
            lastName = data["lastName"] as String,
            fullName = data["fullName"] as? String ?: "${data["firstName"]} ${data["lastName"]}",
            roles = roles,
            status = status,
            mfaEnabled = data["mfaEnabled"] as? Boolean ?: false,
            createdAt = parseDateTime(data["createdAt"]),
            updatedAt = parseDateTime(data["updatedAt"])
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
