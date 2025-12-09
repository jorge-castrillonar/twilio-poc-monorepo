package com.allcode.users.service

import com.allcode.users.dto.*
import com.allcode.users.entity.User
import com.allcode.users.entity.UserRole
import com.allcode.users.entity.UserStatus
import com.allcode.users.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val userEventService: UserEventService
) {
    private val logger = LoggerFactory.getLogger(UserService::class.java)

    /**
     * Create a new user
     */
    fun createUser(request: CreateUserRequest): UserResponse {
        logger.info("Creating new user with email: ${request.email}")

        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("User with email ${request.email} already exists")
        }

        val user = User(
            email = request.email,
            firstName = request.firstName,
            lastName = request.lastName,
            passwordHash = passwordEncoder.encode(request.password),
            roles = request.roles.toMutableSet(),
            status = UserStatus.ACTIVE
        )

        val savedUser = userRepository.save(user)
        
        // Publish user created event
        userEventService.publishUserCreatedEvent(savedUser)
        
        logger.info("Successfully created user with id: ${savedUser.id}")
        return savedUser.toResponse()
    }

    /**
     * Get a user by ID
     */
    @Transactional(readOnly = true)
    fun getUserById(userId: UUID): UserResponse {
        val user = findUserByIdOrThrow(userId)
        return user.toResponse()
    }

    /**
     * Get a user by email
     */
    @Transactional(readOnly = true)
    fun getUserByEmail(email: String): UserResponse {
        val user = userRepository.findByEmail(email)
            ?: throw NoSuchElementException("User not found with email: $email")
        return user.toResponse()
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().map { it.toResponse() }
    }

    /**
     * Get users by status
     */
    @Transactional(readOnly = true)
    fun getUsersByStatus(status: UserStatus): List<UserResponse> {
        return userRepository.findByStatus(status).map { it.toResponse() }
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    fun getUsersByRole(role: UserRole): List<UserResponse> {
        return userRepository.findByRole(role).map { it.toResponse() }
    }

    /**
     * Search users by email
     */
    @Transactional(readOnly = true)
    fun searchUsersByEmail(emailPart: String): List<UserResponse> {
        return userRepository.findByEmailContaining(emailPart).map { it.toResponse() }
    }

    /**
     * Search users by name
     */
    @Transactional(readOnly = true)
    fun searchUsersByName(namePart: String): List<UserResponse> {
        return userRepository.findByNameContaining(namePart).map { it.toResponse() }
    }

    /**
     * Update a user
     */
    fun updateUser(userId: UUID, request: UpdateUserRequest): UserResponse {
        logger.info("Updating user with id: $userId")

        val user = findUserByIdOrThrow(userId)

        request.firstName?.let { user.firstName = it }
        request.lastName?.let { user.lastName = it }
        request.password?.let { user.passwordHash = passwordEncoder.encode(it) }

        val updatedUser = userRepository.save(user)
        
        // Publish user updated event
        userEventService.publishUserUpdatedEvent(updatedUser)
        
        logger.info("Successfully updated user with id: $userId")
        return updatedUser.toResponse()
    }

    /**
     * Change user status
     */
    fun changeUserStatus(userId: UUID, status: UserStatus): UserResponse {
        logger.info("Changing status for user $userId to $status")

        val user = findUserByIdOrThrow(userId)
        user.status = status

        val updatedUser = userRepository.save(user)
        
        // Publish user updated event
        userEventService.publishUserUpdatedEvent(updatedUser)
        
        logger.info("Successfully changed status for user $userId")
        return updatedUser.toResponse()
    }

    /**
     * Assign a role to a user
     */
    fun assignRole(userId: UUID, role: UserRole): UserResponse {
        logger.info("Assigning role $role to user $userId")

        val user = findUserByIdOrThrow(userId)
        
        if (user.hasRole(role)) {
            throw IllegalArgumentException("User already has role: $role")
        }

        user.roles.add(role)
        val updatedUser = userRepository.save(user)
        
        // Publish role assigned event
        userEventService.publishRoleAssignedEvent(updatedUser.id ?: userId, role)
        
        logger.info("Successfully assigned role $role to user $userId")
        return updatedUser.toResponse()
    }

    /**
     * Revoke a role from a user
     */
    fun revokeRole(userId: UUID, role: UserRole): UserResponse {
        logger.info("Revoking role $role from user $userId")

        val user = findUserByIdOrThrow(userId)
        
        if (!user.hasRole(role)) {
            throw IllegalArgumentException("User does not have role: $role")
        }

        if (user.roles.size == 1) {
            throw IllegalArgumentException("Cannot revoke the last role from a user")
        }

        user.roles.remove(role)
        val updatedUser = userRepository.save(user)
        
        // Publish role revoked event
        userEventService.publishRoleRevokedEvent(updatedUser.id ?: userId, role)
        
        logger.info("Successfully revoked role $role from user $userId")
        return updatedUser.toResponse()
    }

    /**
     * Delete a user (soft delete by setting status to DELETED)
     */
    fun deleteUser(userId: UUID) {
        logger.info("Deleting user with id: $userId")

        val user = findUserByIdOrThrow(userId)
        user.status = UserStatus.DELETED

        userRepository.save(user)
        
        // Publish user deleted event
        userEventService.publishUserDeletedEvent(user)
        
        logger.info("Successfully deleted user with id: $userId")
    }

    /**
     * Validate user credentials
     */
    @Transactional(readOnly = true)
    fun validateCredentials(request: CredentialValidationRequest): CredentialValidationResponse {
        logger.info("Validating credentials for email: ${request.email}")
        
        val user = userRepository.findByEmail(request.email)
        if (user == null) {
            logger.warn("User not found: ${request.email}")
            return CredentialValidationResponse(
                valid = false,
                userId = null,
                email = null,
                firstName = null,
                lastName = null,
                roles = null
            )
        }

        logger.info("User found: ${user.email}, status: ${user.status}")

        if (!user.isActive()) {
            logger.warn("User is not active: ${user.email}")
            return CredentialValidationResponse(
                valid = false,
                userId = null,
                email = null,
                firstName = null,
                lastName = null,
                roles = null
            )
        }

        val passwordMatches = passwordEncoder.matches(request.password, user.passwordHash)
        logger.info("Password match result: $passwordMatches for user: ${user.email}")

        return if (passwordMatches) {
            logger.info("Credentials valid for user: ${user.email}")
            CredentialValidationResponse(
                valid = true,
                userId = user.id,
                email = user.email,
                firstName = user.firstName,
                lastName = user.lastName,
                roles = user.roles
            )
        } else {
            logger.warn("Password does not match for user: ${user.email}")
            CredentialValidationResponse(
                valid = false,
                userId = null,
                email = null,
                firstName = null,
                lastName = null,
                roles = null
            )
        }
    }

    /**
     * Check if a user exists by email
     */
    @Transactional(readOnly = true)
    fun userExistsByEmail(email: String): Boolean {
        return userRepository.existsByEmail(email)
    }

    /**
     * Get user count by status
     */
    @Transactional(readOnly = true)
    fun getUserCountByStatus(status: UserStatus): Long {
        return userRepository.countByStatus(status)
    }

    // Helper methods

    private fun findUserByIdOrThrow(userId: UUID): User {
        return userRepository.findById(userId).orElseThrow {
            NoSuchElementException("User not found with id: $userId")
        }
    }

    private fun User.toResponse() = UserResponse(
        id = this.id ?: UUID.randomUUID(), // Should never be null at this point
        email = this.email,
        firstName = this.firstName,
        lastName = this.lastName,
        fullName = this.fullName(),
        roles = this.roles,
        status = this.status,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}
