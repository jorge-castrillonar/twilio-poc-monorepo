package com.allcode.users.dto

import com.allcode.users.entity.UserRole
import com.allcode.users.entity.UserStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

// Request DTOs
data class CreateUserRequest(
    @field:Email(message = "Email must be valid")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "First name is required")
    @field:Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    val firstName: String,

    @field:NotBlank(message = "Last name is required")
    @field:Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    val lastName: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    val password: String,

    val roles: Set<UserRole> = setOf(UserRole.USER)
)

data class UpdateUserRequest(
    @field:Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    val firstName: String?,

    @field:Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    val lastName: String?,

    @field:Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    val password: String?
)

data class RoleAssignmentRequest(
    val role: UserRole
)

data class CredentialValidationRequest(
    @field:Email(message = "Email must be valid")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

// Response DTOs
data class UserResponse(
    val id: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val fullName: String,
    val roles: Set<UserRole>,
    val status: UserStatus,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class CredentialValidationResponse(
    val valid: Boolean,
    val userId: UUID?,
    val email: String?,
    val firstName: String?,
    val lastName: String?,
    val roles: Set<UserRole>?
)

data class UserCreatedEvent(
    val userId: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val roles: Set<UserRole>,
    val timestamp: Instant
)

data class UserUpdatedEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant
)

data class UserDeletedEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant
)

data class RoleAssignedEvent(
    val userId: UUID,
    val role: UserRole,
    val timestamp: Instant
)

data class RoleRevokedEvent(
    val userId: UUID,
    val role: UserRole,
    val timestamp: Instant
)
