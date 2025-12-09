package com.allcode.users.listener

import com.allcode.users.dto.*
import com.allcode.users.entity.UserRole
import com.allcode.users.entity.UserStatus
import com.allcode.users.service.UserService
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.jms.annotation.JmsListener
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Component
import org.slf4j.LoggerFactory
import java.util.UUID

@Component
class UserOperationsListener(
    private val userService: UserService,
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(UserOperationsListener::class.java)
    
    companion object {
        const val RESPONSE_QUEUE = "user.operations.response"
    }
    
    @JmsListener(destination = "user.operations.request")
    fun handleUserOperation(message: String) {
        logger.debug("Received user operation request: $message")
        
        try {
            val request: UserOperationMessage = objectMapper.readValue(message)
            logger.info("Processing operation: ${request.operation}, correlationId: ${request.correlationId}")
            
            val response = when (request.operation) {
                "CREATE_USER" -> handleCreateUser(request)
                "GET_USER_BY_ID" -> handleGetUserById(request)
                "GET_USER_BY_EMAIL" -> handleGetUserByEmail(request)
                "GET_USERS" -> handleGetUsers(request)
                "UPDATE_USER" -> handleUpdateUser(request)
                "DELETE_USER" -> handleDeleteUser(request)
                "ASSIGN_ROLE" -> handleAssignRole(request)
                "REVOKE_ROLE" -> handleRevokeRole(request)
                else -> UserOperationResponse(
                    success = false,
                    error = "Unknown operation: ${request.operation}",
                    correlationId = request.correlationId
                )
            }
            
            // Send response back
            val responseJson = objectMapper.writeValueAsString(response)
            jmsTemplate.convertAndSend(RESPONSE_QUEUE, responseJson)
            logger.debug("Sent response for correlationId: ${request.correlationId}")
            
        } catch (e: Exception) {
            logger.error("Error processing user operation: ${e.message}", e)
            // Send error response if we can extract correlationId
            try {
                val errorRequest: Map<String, Any> = objectMapper.readValue(message)
                val correlationId = errorRequest["correlationId"] as? String ?: "unknown"
                val errorResponse = UserOperationResponse(
                    success = false,
                    error = e.message ?: "Internal error",
                    correlationId = correlationId
                )
                jmsTemplate.convertAndSend(RESPONSE_QUEUE, objectMapper.writeValueAsString(errorResponse))
            } catch (ex: Exception) {
                logger.error("Failed to send error response: ${ex.message}", ex)
            }
        }
    }
    
    private fun handleCreateUser(request: UserOperationMessage): UserOperationResponse {
        return try {
            val createRequest = objectMapper.convertValue(request.data, CreateUserRequest::class.java)
            val user = userService.createUser(createRequest)
            
            UserOperationResponse(
                success = true,
                data = UserResponse(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    fullName = "${user.firstName} ${user.lastName}",
                    roles = user.roles,
                    status = user.status,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt
                ),
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error creating user: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "Failed to create user",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleGetUserById(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            
            val user = userService.getUserById(userId)
            
            UserOperationResponse(
                success = true,
                data = UserResponse(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    fullName = "${user.firstName} ${user.lastName}",
                    roles = user.roles,
                    status = user.status,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt
                ),
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error getting user by ID: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "User not found",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleGetUserByEmail(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val email = data["email"] as? String ?: throw IllegalArgumentException("email is required")
            
            val user = userService.getUserByEmail(email)
            
            UserOperationResponse(
                success = true,
                data = UserResponse(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    fullName = "${user.firstName} ${user.lastName}",
                    roles = user.roles,
                    status = user.status,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt
                ),
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error getting user by email: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "User not found",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleGetUsers(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any?> ?: emptyMap()
            val statusStr = data["status"] as? String
            val roleStr = data["role"] as? String
            
            val status = statusStr?.let { UserStatus.valueOf(it) }
            val role = roleStr?.let { UserRole.valueOf(it) }
            
            val users = userService.getAllUsers() // You may want to add filtering in UserService
                .filter { user ->
                    (status == null || user.status == status) &&
                    (role == null || user.roles.contains(role))
                }
                .map { user ->
                    UserResponse(
                        id = user.id,
                        email = user.email,
                        firstName = user.firstName,
                        lastName = user.lastName,
                        fullName = "${user.firstName} ${user.lastName}",
                        roles = user.roles,
                        status = user.status,
                        createdAt = user.createdAt,
                        updatedAt = user.updatedAt
                    )
                }
            
            UserOperationResponse(
                success = true,
                data = users,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error getting users: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "Failed to get users",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleUpdateUser(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            
            @Suppress("UNCHECKED_CAST")
            val updates = data["updates"] as? Map<String, Any> ?: emptyMap()
            val updateRequest = objectMapper.convertValue(updates, UpdateUserRequest::class.java)
            
            val user = userService.updateUser(userId, updateRequest)
            
            UserOperationResponse(
                success = true,
                data = UserResponse(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    fullName = "${user.firstName} ${user.lastName}",
                    roles = user.roles,
                    status = user.status,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt
                ),
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error updating user: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "Failed to update user",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleDeleteUser(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            
            userService.deleteUser(userId)
            
            UserOperationResponse(
                success = true,
                data = true,
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error deleting user: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "Failed to delete user",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleAssignRole(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            val roleStr = data["role"] as? String ?: throw IllegalArgumentException("role is required")
            val role = UserRole.valueOf(roleStr)
            
            val user = userService.assignRole(userId, role)
            
            UserOperationResponse(
                success = true,
                data = UserResponse(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    fullName = "${user.firstName} ${user.lastName}",
                    roles = user.roles,
                    status = user.status,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt
                ),
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error assigning role: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "Failed to assign role",
                correlationId = request.correlationId
            )
        }
    }
    
    private fun handleRevokeRole(request: UserOperationMessage): UserOperationResponse {
        return try {
            @Suppress("UNCHECKED_CAST")
            val data = request.data as? Map<String, Any> ?: throw IllegalArgumentException("Invalid data format")
            val userIdStr = data["userId"] as? String ?: throw IllegalArgumentException("userId is required")
            val userId = UUID.fromString(userIdStr)
            val roleStr = data["role"] as? String ?: throw IllegalArgumentException("role is required")
            val role = UserRole.valueOf(roleStr)
            
            val user = userService.revokeRole(userId, role)
            
            UserOperationResponse(
                success = true,
                data = UserResponse(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    fullName = "${user.firstName} ${user.lastName}",
                    roles = user.roles,
                    status = user.status,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt
                ),
                correlationId = request.correlationId
            )
        } catch (e: Exception) {
            logger.error("Error revoking role: ${e.message}", e)
            UserOperationResponse(
                success = false,
                error = e.message ?: "Failed to revoke role",
                correlationId = request.correlationId
            )
        }
    }
}

// DTOs for JMS operations (matching core-service DTOs)
data class UserOperationMessage(
    val operation: String,
    val data: Any,
    val correlationId: String
)

data class UserOperationResponse(
    val success: Boolean,
    val data: Any? = null,
    val error: String? = null,
    val correlationId: String
)
