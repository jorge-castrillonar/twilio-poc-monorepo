package com.allcode.auth.service

import com.allcode.auth.entity.RefreshToken
import com.allcode.auth.repository.RefreshTokenRepository
import com.allcode.auth.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class RefreshTokenService(
    private val refreshTokenRepository: RefreshTokenRepository,
    private val jwtTokenProvider: JwtTokenProvider
) {
    private val logger = LoggerFactory.getLogger(RefreshTokenService::class.java)

    /**
     * Create and store a refresh token
     */
    fun createRefreshToken(
        userId: UUID,
        userAgent: String?,
        ipAddress: String?
    ): RefreshToken {
        val tokenString = jwtTokenProvider.generateRefreshToken(userId)
        val expiresAt = jwtTokenProvider.getRefreshTokenExpirationInstant()

        val refreshToken = RefreshToken(
            token = tokenString,
            userId = userId,
            expiresAt = expiresAt,
            userAgent = userAgent,
            ipAddress = ipAddress
        )

        val saved = refreshTokenRepository.save(refreshToken)
        logger.info("Created refresh token for user: $userId")
        
        return saved
    }

    /**
     * Find a refresh token by token string
     */
    @Transactional(readOnly = true)
    fun findByToken(token: String): RefreshToken? {
        return refreshTokenRepository.findByToken(token)
    }

    /**
     * Validate a refresh token
     */
    @Transactional(readOnly = true)
    fun validateRefreshToken(token: String): RefreshToken? {
        val refreshToken = refreshTokenRepository.findByToken(token)
            ?: return null

        if (!refreshToken.isValid()) {
            logger.warn("Invalid refresh token: revoked=${refreshToken.revoked}, expired=${refreshToken.isExpired()}")
            return null
        }

        return refreshToken
    }

    /**
     * Revoke a refresh token
     */
    fun revokeToken(token: String) {
        val refreshToken = refreshTokenRepository.findByToken(token)
            ?: throw NoSuchElementException("Refresh token not found")

        refreshToken.revoke()
        refreshTokenRepository.save(refreshToken)
        
        logger.info("Revoked refresh token for user: ${refreshToken.userId}")
    }

    /**
     * Revoke all tokens for a user
     */
    fun revokeAllTokensForUser(userId: UUID) {
        refreshTokenRepository.revokeAllTokensForUser(userId)
        logger.info("Revoked all refresh tokens for user: $userId")
    }

    /**
     * Clean up expired and old revoked tokens
     */
    fun cleanupTokens() {
        try {
            // Delete expired tokens
            refreshTokenRepository.deleteExpiredTokens()
            
            // Delete revoked tokens older than 30 days
            val cutoffDate = Instant.now().minusSeconds(30 * 24 * 60 * 60)
            refreshTokenRepository.deleteRevokedTokensOlderThan(cutoffDate)
            
            logger.info("Successfully cleaned up old refresh tokens")
        } catch (e: Exception) {
            logger.error("Failed to cleanup refresh tokens", e)
        }
    }

    /**
     * Get active token count for a user
     */
    @Transactional(readOnly = true)
    fun getActiveTokenCount(userId: UUID): Long {
        return refreshTokenRepository.countActiveTokensForUser(userId)
    }
}
