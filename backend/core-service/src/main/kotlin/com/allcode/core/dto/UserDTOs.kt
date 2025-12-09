package com.allcode.core.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

// Enums
enum class UserRole {
    ADMIN, USER, MANAGER, AGENT
}

enum class UserStatus {
    ACTIVE, INACTIVE, SUSPENDED, DELETED
}

// Request DTOs
data class CreateUserRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,
    
    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val password: String,
    
    @field:NotBlank(message = "First name is required")
    val firstName: String,
    
    @field:NotBlank(message = "Last name is required")
    val lastName: String,
    
    val roles: Set<UserRole> = setOf(UserRole.USER)
)

data class UpdateUserRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val status: UserStatus? = null
)

data class AssignRoleRequest(
    @field:NotBlank(message = "User ID is required")
    val userId: String,
    val role: UserRole
)

data class RevokeRoleRequest(
    @field:NotBlank(message = "User ID is required")
    val userId: String,
    val role: UserRole
)

// Response DTOs
data class UserResponse(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val fullName: String,
    val roles: Set<UserRole>,
    val status: UserStatus,
    val mfaEnabled: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class UserListResponse(
    val users: List<UserResponse>,
    val total: Int
)

// JMS Message DTOs
data class UserOperationMessage(
    val operation: UserOperation,
    val data: Any,
    val correlationId: String
)

enum class UserOperation {
    CREATE_USER,
    GET_USER_BY_ID,
    GET_USER_BY_EMAIL,
    GET_USERS,
    UPDATE_USER,
    DELETE_USER,
    ASSIGN_ROLE,
    REVOKE_ROLE
}

data class UserOperationResponse(
    val success: Boolean,
    val data: Any? = null,
    val error: String? = null,
    val correlationId: String
)
