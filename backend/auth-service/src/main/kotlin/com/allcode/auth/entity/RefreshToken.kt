package com.allcode.auth.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "refresh_tokens",
    indexes = [
        Index(name = "idx_refresh_token", columnList = "token"),
        Index(name = "idx_user_id", columnList = "user_id"),
        Index(name = "idx_expires_at", columnList = "expires_at")
    ]
)
@EntityListeners(AuditingEntityListener::class)
data class RefreshToken(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true, length = 500)
    val token: String,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "expires_at", nullable = false)
    val expiresAt: Instant,

    @Column(nullable = false)
    var revoked: Boolean = false,

    @Column(name = "revoked_at")
    var revokedAt: Instant? = null,

    @Column(name = "user_agent", length = 500)
    val userAgent: String? = null,

    @Column(name = "ip_address", length = 45)
    val ipAddress: String? = null,

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
) {
    fun isExpired(): Boolean = Instant.now().isAfter(expiresAt)

    fun isValid(): Boolean = !revoked && !isExpired()

    fun revoke() {
        revoked = true
        revokedAt = Instant.now()
    }
}
