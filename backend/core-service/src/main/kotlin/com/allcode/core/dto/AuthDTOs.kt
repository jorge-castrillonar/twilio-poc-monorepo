package com.allcode.core.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// Request DTOs
data class LoginRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
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

data class EnableMfaRequest(
    @field:NotBlank(message = "TOTP code is required")
    @field:Size(min = 6, max = 6, message = "TOTP code must be 6 digits")
    val totpCode: String
)

// Response DTOs
data class AuthUserResponse(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val roles: List<String>
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Int,
    val user: AuthUserResponse,
    val mfaRequired: Boolean = false
)

data class MfaSetupResponse(
    val secret: String,
    val qrCodeUrl: String,
    val backupCodes: List<String>
)

data class MfaStatusResponse(
    val enabled: Boolean,
    val setupComplete: Boolean
)

// JMS Message DTOs
data class AuthOperationMessage(
    val operation: AuthOperation,
    val data: Any,
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

data class AuthOperationResponse(
    val success: Boolean,
    val data: Any? = null,
    val error: String? = null,
    val correlationId: String
)
