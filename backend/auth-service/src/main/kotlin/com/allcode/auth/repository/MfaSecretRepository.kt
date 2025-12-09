package com.allcode.auth.repository

import com.allcode.auth.entity.MfaSecret
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface MfaSecretRepository : JpaRepository<MfaSecret, UUID> {

    /**
     * Find MFA secret by user ID
     */
    fun findByUserId(userId: UUID): MfaSecret?

    /**
     * Check if MFA is enabled for a user
     */
    fun existsByUserIdAndEnabledTrue(userId: UUID): Boolean

    /**
     * Delete MFA secret for a user
     */
    fun deleteByUserId(userId: UUID)
}
