package com.allcode.auth.service

import com.allcode.auth.client.UserServiceClient
import com.allcode.auth.dto.LoginRequest
import com.allcode.auth.dto.LoginResponse
import com.allcode.auth.dto.RefreshTokenResponse
import com.allcode.auth.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class AuthService(
    private val userServiceClient: UserServiceClient,
    private val jwtTokenProvider: JwtTokenProvider,
    private val refreshTokenService: RefreshTokenService,
    private val mfaService: MfaService,
    private val rateLimitService: RateLimitService,
    private val authEventService: AuthEventService
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    /**
     * Authenticate user and return tokens
     */
    fun login(
        request: LoginRequest,
        ipAddress: String?,
        userAgent: String?
    ): LoginResponse {
        logger.info("Login attempt for email: ${request.email}")

        // Check rate limiting
        if (!rateLimitService.isLoginAllowed(request.email)) {
            rateLimitService.recordLoginAttempt(request.email)
            authEventService.publishLoginEvent(
                userId = null,
                email = request.email,
                ipAddress = ipAddress,
                userAgent = userAgent,
                success = false,
                failureReason = "Rate limit exceeded"
            )
            throw IllegalStateException("Too many login attempts. Please try again later.")
        }

        // Validate credentials with user-service
        val validationResponse = userServiceClient.validateCredentials(
            request.email,
            request.password
        )

        if (!validationResponse.valid || validationResponse.userId == null) {
            rateLimitService.recordLoginAttempt(request.email)
            authEventService.publishLoginEvent(
                userId = null,
                email = request.email,
                ipAddress = ipAddress,
                userAgent = userAgent,
                success = false,
                failureReason = "Invalid credentials"
            )
            throw IllegalArgumentException("Invalid email or password")
        }

        val userId = validationResponse.userId!!
        val roles = validationResponse.roles ?: emptySet()
        val firstName = validationResponse.firstName ?: ""
        val lastName = validationResponse.lastName ?: ""

        // Check if MFA is enabled
        val mfaEnabled = mfaService.isMfaEnabled(userId)
        
        if (mfaEnabled) {
            // MFA is enabled, verify code
            if (request.mfaCode.isNullOrBlank()) {
                // MFA required but code not provided
                return LoginResponse(
                    accessToken = "",
                    refreshToken = "",
                    expiresIn = 0,
                    userId = userId,
                    email = request.email,
                    firstName = firstName,
                    lastName = lastName,
                    roles = roles,
                    mfaRequired = true
                )
            }

            // Verify MFA code (TOTP or backup code)
            val mfaValid = mfaService.verifyTotp(userId, request.mfaCode) ||
                          mfaService.verifyBackupCode(userId, request.mfaCode)

            if (!mfaValid) {
                rateLimitService.recordLoginAttempt(request.email)
                authEventService.publishLoginEvent(
                    userId = userId,
                    email = request.email,
                    ipAddress = ipAddress,
                    userAgent = userAgent,
                    success = false,
                    failureReason = "Invalid MFA code"
                )
                throw IllegalArgumentException("Invalid MFA code")
            }
        }

        // Generate tokens
        val accessToken = jwtTokenProvider.generateAccessToken(
            userId = userId,
            email = request.email,
            roles = roles
        )

        val refreshToken = refreshTokenService.createRefreshToken(
            userId = userId,
            userAgent = userAgent,
            ipAddress = ipAddress
        )

        // Clear rate limiting on successful login
        rateLimitService.clearLoginAttempts(request.email)

        // Publish login event
        authEventService.publishLoginEvent(
            userId = userId,
            email = request.email,
            ipAddress = ipAddress,
            userAgent = userAgent,
            success = true,
            mfaUsed = mfaEnabled
        )

        logger.info("Successful login for user: $userId")

        return LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken.token,
            expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds(),
            userId = userId,
            email = request.email,
            firstName = firstName,
            lastName = lastName,
            roles = roles,
            mfaRequired = false
        )
    }

    /**
     * Refresh access token using refresh token
     */
    fun refreshToken(
        refreshTokenString: String,
        ipAddress: String?
    ): RefreshTokenResponse {
        logger.info("Token refresh attempt")

        // Check rate limiting
        val rateLimitKey = ipAddress ?: "unknown"
        if (!rateLimitService.isRefreshAllowed(rateLimitKey)) {
            rateLimitService.recordRefreshAttempt(rateLimitKey)
            throw IllegalStateException("Too many refresh attempts. Please try again later.")
        }

        // Validate refresh token
        val refreshToken = refreshTokenService.validateRefreshToken(refreshTokenString)
            ?: throw IllegalArgumentException("Invalid or expired refresh token")

        val userId = refreshToken.userId

        // Get fresh user data from user-service
        val userData = userServiceClient.getUserById(userId)

        // Generate new tokens
        val newAccessToken = jwtTokenProvider.generateAccessToken(
            userId = userId,
            email = userData.email,
            roles = userData.roles
        )

        val newRefreshToken = refreshTokenService.createRefreshToken(
            userId = userId,
            userAgent = refreshToken.userAgent,
            ipAddress = refreshToken.ipAddress
        )

        // Revoke old refresh token
        refreshTokenService.revokeToken(refreshTokenString)

        // Publish event
        authEventService.publishTokenRefreshedEvent(
            userId = userId,
            email = userData.email
        )

        logger.info("Successfully refreshed token for user: $userId")

        return RefreshTokenResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken.token,
            expiresIn = jwtTokenProvider.getAccessTokenExpirationSeconds(),
            userId = userId,
            email = userData.email,
            firstName = userData.firstName,
            lastName = userData.lastName,
            roles = userData.roles
        )
    }

    /**
     * Logout user by revoking refresh token
     */
    fun logout(refreshTokenString: String) {
        logger.info("Logout attempt")

        try {
            val refreshToken = refreshTokenService.findByToken(refreshTokenString)
            
            if (refreshToken != null) {
                // Revoke the token
                refreshTokenService.revokeToken(refreshTokenString)

                // Get user info
                val jwtClaims = jwtTokenProvider.validateToken(refreshToken.token)

                if (jwtClaims != null) {
                    // Publish logout event
                    authEventService.publishLogoutEvent(
                        userId = jwtClaims.userId,
                        email = jwtClaims.email
                    )
                    
                    logger.info("User logged out: ${jwtClaims.userId}")
                }
            }
        } catch (e: Exception) {
            logger.error("Error during logout", e)
            // Don't throw exception on logout failure
        }
    }

    /**
     * Logout from all devices (revoke all refresh tokens)
     */
    fun logoutAllDevices(userId: UUID) {
        logger.info("Logout all devices for user: $userId")
        refreshTokenService.revokeAllTokensForUser(userId)
    }
}
