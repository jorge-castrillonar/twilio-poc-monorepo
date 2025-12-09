package com.allcode.auth.repository

import com.allcode.auth.entity.RefreshToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface RefreshTokenRepository : JpaRepository<RefreshToken, UUID> {

    /**
     * Find a refresh token by its token string
     */
    fun findByToken(token: String): RefreshToken?

    /**
     * Find all refresh tokens for a user
     */
    fun findByUserId(userId: UUID): List<RefreshToken>

    /**
     * Find all valid (non-revoked, non-expired) tokens for a user
     */
    @Query("""
        SELECT rt FROM RefreshToken rt 
        WHERE rt.userId = :userId 
        AND rt.revoked = false 
        AND rt.expiresAt > :now
    """)
    fun findValidTokensByUserId(
        @Param("userId") userId: UUID,
        @Param("now") now: Instant = Instant.now()
    ): List<RefreshToken>

    /**
     * Revoke all tokens for a user
     */
    @Modifying
    @Query("""
        UPDATE RefreshToken rt 
        SET rt.revoked = true, rt.revokedAt = :now 
        WHERE rt.userId = :userId 
        AND rt.revoked = false
    """)
    fun revokeAllTokensForUser(
        @Param("userId") userId: UUID,
        @Param("now") now: Instant = Instant.now()
    )

    /**
     * Delete expired tokens
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    fun deleteExpiredTokens(@Param("now") now: Instant = Instant.now())

    /**
     * Delete revoked tokens older than a certain date
     */
    @Modifying
    @Query("""
        DELETE FROM RefreshToken rt 
        WHERE rt.revoked = true 
        AND rt.revokedAt < :cutoffDate
    """)
    fun deleteRevokedTokensOlderThan(@Param("cutoffDate") cutoffDate: Instant)

    /**
     * Count active tokens for a user
     */
    @Query("""
        SELECT COUNT(rt) FROM RefreshToken rt 
        WHERE rt.userId = :userId 
        AND rt.revoked = false 
        AND rt.expiresAt > :now
    """)
    fun countActiveTokensForUser(
        @Param("userId") userId: UUID,
        @Param("now") now: Instant = Instant.now()
    ): Long
}
