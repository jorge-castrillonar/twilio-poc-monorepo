package com.allcode.auth.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "mfa_secrets",
    indexes = [
        Index(name = "idx_mfa_user_id", columnList = "user_id", unique = true)
    ]
)
@EntityListeners(AuditingEntityListener::class)
data class MfaSecret(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false, unique = true)
    val userId: UUID,

    @Column(nullable = false, length = 500)
    var secret: String,

    @Column(nullable = false)
    var enabled: Boolean = false,

    @Column(name = "enabled_at")
    var enabledAt: Instant? = null,

    @Column(name = "backup_codes", length = 1000)
    var backupCodes: String? = null, // Comma-separated encrypted backup codes

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    fun enable() {
        enabled = true
        enabledAt = Instant.now()
    }

    fun disable() {
        enabled = false
        enabledAt = null
    }

    fun getBackupCodesList(): List<String> {
        return backupCodes?.split(",")?.filter { it.isNotBlank() } ?: emptyList()
    }

    fun setBackupCodesList(codes: List<String>) {
        backupCodes = codes.joinToString(",")
    }

    fun removeBackupCode(code: String) {
        val codes = getBackupCodesList().toMutableList()
        codes.remove(code)
        setBackupCodesList(codes)
    }
}
