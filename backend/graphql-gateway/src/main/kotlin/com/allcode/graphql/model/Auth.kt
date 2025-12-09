package com.allcode.graphql.model

// Authentication Models
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Int,
    val user: User,
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

data class TokenVerificationResult(
    val valid: Boolean,
    val userId: String? = null,
    val email: String? = null,
    val roles: Set<UserRole>? = null,
    val expiresAt: java.time.Instant? = null,
    val message: String? = null
)

// Input Types
data class LoginInput(
    val email: String,
    val password: String,
    val mfaCode: String? = null
)

data class RefreshTokenInput(
    val refreshToken: String
)

data class LogoutInput(
    val refreshToken: String
)

data class EnableMfaInput(
    val totpCode: String
)
