package com.allcode.users.entity

enum class UserRole {
    ADMIN,
    USER,
    MANAGER,
    AGENT;

    companion object {
        fun fromString(role: String): UserRole {
            return valueOf(role.uppercase())
        }
    }
}
