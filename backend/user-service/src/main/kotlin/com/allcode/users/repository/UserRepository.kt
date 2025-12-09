package com.allcode.users.repository

import com.allcode.users.entity.User
import com.allcode.users.entity.UserRole
import com.allcode.users.entity.UserStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {

    /**
     * Find a user by their email address
     */
    fun findByEmail(email: String): User?

    /**
     * Check if a user exists with the given email
     */
    fun existsByEmail(email: String): Boolean

    /**
     * Find all users with a specific status
     */
    fun findByStatus(status: UserStatus): List<User>

    /**
     * Find all users with a specific role
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    fun findByRole(@Param("role") role: UserRole): List<User>

    /**
     * Find all active users with a specific role
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role AND u.status = :status")
    fun findByRoleAndStatus(
        @Param("role") role: UserRole,
        @Param("status") status: UserStatus
    ): List<User>

    /**
     * Count users by status
     */
    fun countByStatus(status: UserStatus): Long

    /**
     * Find users by partial email match (case-insensitive)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :emailPart, '%'))")
    fun findByEmailContaining(@Param("emailPart") emailPart: String): List<User>

    /**
     * Find users by partial name match (case-insensitive)
     */
    @Query("""
        SELECT u FROM User u 
        WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :namePart, '%'))
        OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :namePart, '%'))
    """)
    fun findByNameContaining(@Param("namePart") namePart: String): List<User>
}
