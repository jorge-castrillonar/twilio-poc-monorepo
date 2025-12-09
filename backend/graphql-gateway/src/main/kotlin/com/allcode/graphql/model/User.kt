package com.allcode.graphql.model

import java.time.Instant

// Enums
enum class UserRole {
    ADMIN, USER, MANAGER, AGENT
}

enum class UserStatus {
    ACTIVE, INACTIVE, SUSPENDED, DELETED
}

// User Model
data class User(
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

// Input Types
data class CreateUserInput(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val roles: Set<UserRole> = setOf(UserRole.USER)
)

data class UpdateUserInput(
    val firstName: String? = null,
    val lastName: String? = null,
    val status: UserStatus? = null
)
