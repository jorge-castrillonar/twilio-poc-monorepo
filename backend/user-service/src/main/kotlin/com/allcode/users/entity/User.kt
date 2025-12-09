package com.allcode.users.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "users",
    indexes = [
        Index(name = "idx_users_email", columnList = "email"),
        Index(name = "idx_users_status", columnList = "status")
    ]
)
@EntityListeners(AuditingEntityListener::class)
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, unique = true, length = 255)
    val email: String,

    @Column(nullable = false, length = 100)
    var firstName: String,

    @Column(nullable = false, length = 100)
    var lastName: String,

    @Column(nullable = false, length = 255)
    var passwordHash: String,

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = [JoinColumn(name = "user_id")])
    @Column(name = "role", length = 50)
    @Enumerated(EnumType.STRING)
    var roles: MutableSet<UserRole> = mutableSetOf(UserRole.USER),

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: UserStatus = UserStatus.ACTIVE,

    @CreatedDate
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    fun hasRole(role: UserRole): Boolean {
        return roles.contains(role)
    }

    fun isActive(): Boolean {
        return status == UserStatus.ACTIVE
    }

    fun fullName(): String {
        return "$firstName $lastName"
    }
}
