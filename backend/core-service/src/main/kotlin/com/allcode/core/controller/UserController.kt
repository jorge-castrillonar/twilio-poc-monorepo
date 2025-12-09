package com.allcode.core.controller

import com.allcode.core.dto.*
import com.allcode.core.service.UserOrchestrationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = ["*"])
class UserController(
    private val userOrchestrationService: UserOrchestrationService
) {
    private val logger = LoggerFactory.getLogger(UserController::class.java)
    
    @PostMapping
    fun createUser(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<ServiceResponse<UserResponse>> {
        return try {
            logger.info("Creating user: ${request.email}")
            val user = userOrchestrationService.createUser(request)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ServiceResponse(success = true, data = user, message = "User created successfully"))
        } catch (e: Exception) {
            logger.error("Error creating user: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to create user"))
        }
    }
    
    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: String): ResponseEntity<ServiceResponse<UserResponse>> {
        return try {
            logger.info("Getting user by ID: $userId")
            val user = userOrchestrationService.getUserById(userId)
            if (user != null) {
                ResponseEntity.ok(ServiceResponse(success = true, data = user))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ServiceResponse(success = false, message = "User not found"))
            }
        } catch (e: Exception) {
            logger.error("Error getting user: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to get user"))
        }
    }
    
    @GetMapping("/email/{email}")
    fun getUserByEmail(@PathVariable email: String): ResponseEntity<ServiceResponse<UserResponse>> {
        return try {
            logger.info("Getting user by email: $email")
            val user = userOrchestrationService.getUserByEmail(email)
            if (user != null) {
                ResponseEntity.ok(ServiceResponse(success = true, data = user))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ServiceResponse(success = false, message = "User not found"))
            }
        } catch (e: Exception) {
            logger.error("Error getting user by email: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to get user"))
        }
    }
    
    @GetMapping
    fun getUsers(
        @RequestParam(required = false) status: UserStatus?,
        @RequestParam(required = false) role: UserRole?
    ): ResponseEntity<ServiceResponse<List<UserResponse>>> {
        return try {
            logger.info("Getting users - status: $status, role: $role")
            val users = userOrchestrationService.getUsers(status, role)
            ResponseEntity.ok(ServiceResponse(success = true, data = users))
        } catch (e: Exception) {
            logger.error("Error getting users: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to get users"))
        }
    }
    
    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: String,
        @Valid @RequestBody request: UpdateUserRequest
    ): ResponseEntity<ServiceResponse<UserResponse>> {
        return try {
            logger.info("Updating user: $userId")
            val user = userOrchestrationService.updateUser(userId, request)
            ResponseEntity.ok(ServiceResponse(success = true, data = user, message = "User updated successfully"))
        } catch (e: Exception) {
            logger.error("Error updating user: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to update user"))
        }
    }
    
    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: String): ResponseEntity<ServiceResponse<Boolean>> {
        return try {
            logger.info("Deleting user: $userId")
            val success = userOrchestrationService.deleteUser(userId)
            if (success) {
                ResponseEntity.ok(ServiceResponse(success = true, data = true, message = "User deleted successfully"))
            } else {
                ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ServiceResponse(success = false, message = "Failed to delete user"))
            }
        } catch (e: Exception) {
            logger.error("Error deleting user: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to delete user"))
        }
    }
    
    @PostMapping("/{userId}/roles")
    fun assignRole(
        @PathVariable userId: String,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<ServiceResponse<UserResponse>> {
        return try {
            val roleStr = request["role"] ?: throw IllegalArgumentException("Role is required")
            val role = UserRole.valueOf(roleStr.uppercase())
            logger.info("Assigning role $role to user: $userId")
            val user = userOrchestrationService.assignRole(userId, role)
            ResponseEntity.ok(ServiceResponse(success = true, data = user, message = "Role assigned successfully"))
        } catch (e: IllegalArgumentException) {
            logger.error("Invalid role: ${e.message}")
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Invalid role"))
        } catch (e: Exception) {
            logger.error("Error assigning role: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to assign role"))
        }
    }
    
    @DeleteMapping("/{userId}/roles/{role}")
    fun revokeRole(
        @PathVariable userId: String,
        @PathVariable role: String
    ): ResponseEntity<ServiceResponse<UserResponse>> {
        return try {
            val userRole = UserRole.valueOf(role.uppercase())
            logger.info("Revoking role $userRole from user: $userId")
            val user = userOrchestrationService.revokeRole(userId, userRole)
            ResponseEntity.ok(ServiceResponse(success = true, data = user, message = "Role revoked successfully"))
        } catch (e: IllegalArgumentException) {
            logger.error("Invalid role: ${e.message}")
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Invalid role"))
        } catch (e: Exception) {
            logger.error("Error revoking role: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Failed to revoke role"))
        }
    }
}
