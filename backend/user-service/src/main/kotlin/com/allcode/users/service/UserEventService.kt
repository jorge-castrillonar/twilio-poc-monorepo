package com.allcode.users.service

import com.allcode.users.dto.*
import com.allcode.users.entity.User
import com.allcode.users.entity.UserRole
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class UserEventService(
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(UserEventService::class.java)

    companion object {
        const val USER_CREATED_TOPIC = "user.created"
        const val USER_UPDATED_TOPIC = "user.updated"
        const val USER_DELETED_TOPIC = "user.deleted"
        const val ROLE_ASSIGNED_TOPIC = "user.role.assigned"
        const val ROLE_REVOKED_TOPIC = "user.role.revoked"
    }

    fun publishUserCreatedEvent(user: User) {
        try {
            val event = UserCreatedEvent(
                userId = user.id ?: return, // Skip if ID is null
                email = user.email,
                firstName = user.firstName,
                lastName = user.lastName,
                roles = user.roles,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(USER_CREATED_TOPIC, message)

            logger.info("Published user created event for user: ${user.id}")
        } catch (e: Exception) {
            logger.error("Failed to publish user created event for user: ${user.id}", e)
        }
    }

    fun publishUserUpdatedEvent(user: User) {
        try {
            val event = UserUpdatedEvent(
                userId = user.id ?: return,
                email = user.email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(USER_UPDATED_TOPIC, message)

            logger.info("Published user updated event for user: ${user.id}")
        } catch (e: Exception) {
            logger.error("Failed to publish user updated event for user: ${user.id}", e)
        }
    }

    fun publishUserDeletedEvent(user: User) {
        try {
            val event = UserDeletedEvent(
                userId = user.id ?: return,
                email = user.email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(USER_DELETED_TOPIC, message)

            logger.info("Published user deleted event for user: ${user.id}")
        } catch (e: Exception) {
            logger.error("Failed to publish user deleted event for user: ${user.id}", e)
        }
    }

    fun publishRoleAssignedEvent(userId: UUID, role: UserRole) {
        try {
            val event = RoleAssignedEvent(
                userId = userId,
                role = role,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(ROLE_ASSIGNED_TOPIC, message)

            logger.info("Published role assigned event for user: $userId, role: $role")
        } catch (e: Exception) {
            logger.error("Failed to publish role assigned event for user: $userId", e)
        }
    }

    fun publishRoleRevokedEvent(userId: UUID, role: UserRole) {
        try {
            val event = RoleRevokedEvent(
                userId = userId,
                role = role,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(ROLE_REVOKED_TOPIC, message)

            logger.info("Published role revoked event for user: $userId, role: $role")
        } catch (e: Exception) {
            logger.error("Failed to publish role revoked event for user: $userId", e)
        }
    }
}
