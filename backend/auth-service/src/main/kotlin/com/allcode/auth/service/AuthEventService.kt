package com.allcode.auth.service

import com.allcode.auth.dto.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class AuthEventService(
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(AuthEventService::class.java)

    companion object {
        const val LOGIN_TOPIC = "auth.login"
        const val LOGOUT_TOPIC = "auth.logout"
        const val TOKEN_REFRESHED_TOPIC = "auth.token.refreshed"
        const val MFA_ENABLED_TOPIC = "auth.mfa.enabled"
        const val MFA_DISABLED_TOPIC = "auth.mfa.disabled"
        const val PASSWORD_CHANGED_TOPIC = "auth.password.changed"
    }

    fun publishLoginEvent(
        userId: UUID?,
        email: String,
        ipAddress: String?,
        userAgent: String?,
        success: Boolean,
        failureReason: String? = null,
        mfaUsed: Boolean = false
    ) {
        try {
            val event = LoginEvent(
                userId = userId ?: UUID.randomUUID(), // Use random UUID for failed attempts
                email = email,
                ipAddress = ipAddress,
                userAgent = userAgent,
                success = success,
                failureReason = failureReason,
                mfaUsed = mfaUsed,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(LOGIN_TOPIC, message)

            logger.info("Published login event for: $email, success: $success")
        } catch (e: Exception) {
            logger.error("Failed to publish login event", e)
        }
    }

    fun publishLogoutEvent(userId: UUID, email: String) {
        try {
            val event = LogoutEvent(
                userId = userId,
                email = email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(LOGOUT_TOPIC, message)

            logger.info("Published logout event for user: $userId")
        } catch (e: Exception) {
            logger.error("Failed to publish logout event", e)
        }
    }

    fun publishTokenRefreshedEvent(userId: UUID, email: String) {
        try {
            val event = TokenRefreshedEvent(
                userId = userId,
                email = email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(TOKEN_REFRESHED_TOPIC, message)

            logger.info("Published token refreshed event for user: $userId")
        } catch (e: Exception) {
            logger.error("Failed to publish token refreshed event", e)
        }
    }

    fun publishMfaEnabledEvent(userId: UUID, email: String) {
        try {
            val event = MfaEnabledEvent(
                userId = userId,
                email = email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(MFA_ENABLED_TOPIC, message)

            logger.info("Published MFA enabled event for user: $userId")
        } catch (e: Exception) {
            logger.error("Failed to publish MFA enabled event", e)
        }
    }

    fun publishMfaDisabledEvent(userId: UUID, email: String) {
        try {
            val event = MfaDisabledEvent(
                userId = userId,
                email = email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(MFA_DISABLED_TOPIC, message)

            logger.info("Published MFA disabled event for user: $userId")
        } catch (e: Exception) {
            logger.error("Failed to publish MFA disabled event", e)
        }
    }

    fun publishPasswordChangedEvent(userId: UUID, email: String) {
        try {
            val event = PasswordChangedEvent(
                userId = userId,
                email = email,
                timestamp = Instant.now()
            )

            val message = objectMapper.writeValueAsString(event)
            jmsTemplate.convertAndSend(PASSWORD_CHANGED_TOPIC, message)

            logger.info("Published password changed event for user: $userId")
        } catch (e: Exception) {
            logger.error("Failed to publish password changed event", e)
        }
    }
}
