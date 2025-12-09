package com.allcode.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

// ============ Request DTOs ============

data class LoginRequest(
    @field:Email(message = "Email must be valid")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String,

    val mfaCode: String? = null
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

data class LogoutRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

data class MfaEnableRequest(
    @field:NotBlank(message = "TOTP code is required")
    @field:Size(min = 6, max = 6, message = "TOTP code must be 6 digits")
    val totpCode: String
)

data class MfaVerifyRequest(
    @field:NotBlank(message = "TOTP code is required")
    @field:Size(min = 6, max = 6, message = "TOTP code must be 6 digits")
    val totpCode: String
)

data class MfaDisableRequest(
    @field:NotBlank(message = "Password is required")
    val password: String
)

data class BackupCodeVerifyRequest(
    @field:NotBlank(message = "Backup code is required")
    val backupCode: String
)

data class ChangePasswordRequest(
    @field:NotBlank(message = "Current password is required")
    val currentPassword: String,

    @field:NotBlank(message = "New password is required")
    @field:Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    val newPassword: String
)

// ============ Response DTOs ============

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long, // seconds
    val userId: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val roles: Set<String>,
    val mfaRequired: Boolean = false
)

data class RefreshTokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val userId: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val roles: Set<String>
)

data class MfaSetupResponse(
    val secret: String,
    val qrCodeUrl: String,
    val backupCodes: List<String>,
    val issuer: String,
    val accountName: String
)

data class MfaStatusResponse(
    val enabled: Boolean,
    val enabledAt: Instant? = null,
    val backupCodesRemaining: Int = 0
)

data class TokenValidationResponse(
    val valid: Boolean,
    val userId: UUID? = null,
    val email: String? = null,
    val roles: Set<String>? = null,
    val expiresAt: Instant? = null
)

// ============ Internal DTOs ============

data class UserCredentials(
    val userId: UUID,
    val email: String,
    val roles: Set<String>,
    val mfaEnabled: Boolean = false
)

data class JwtClaims(
    val userId: UUID,
    val email: String,
    val roles: Set<String>,
    val issuer: String,
    val issuedAt: Instant,
    val expiresAt: Instant
)

// ============ Event DTOs ============

data class LoginEvent(
    val userId: UUID,
    val email: String,
    val ipAddress: String?,
    val userAgent: String?,
    val success: Boolean,
    val failureReason: String? = null,
    val mfaUsed: Boolean = false,
    val timestamp: Instant = Instant.now()
)

data class LogoutEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant = Instant.now()
)

data class TokenRefreshedEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant = Instant.now()
)

data class MfaEnabledEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant = Instant.now()
)

data class MfaDisabledEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant = Instant.now()
)

data class PasswordChangedEvent(
    val userId: UUID,
    val email: String,
    val timestamp: Instant = Instant.now()
)

// ============ JMS Operation DTOs ============

data class AuthOperationMessage(
    val operation: String,
    val data: Any,
    val correlationId: String
)

data class AuthOperationResponse(
    val success: Boolean,
    val data: Any? = null,
    val error: String? = null,
    val correlationId: String
)

enum class AuthOperation {
    LOGIN,
    REFRESH_TOKEN,
    LOGOUT,
    SETUP_MFA,
    ENABLE_MFA,
    DISABLE_MFA,
    VERIFY_TOKEN
}
