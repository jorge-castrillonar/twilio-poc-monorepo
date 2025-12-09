package com.allcode.core.listener

import com.allcode.core.service.UserOrchestrationService
import com.allcode.core.service.AuthOrchestrationService
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component
import org.slf4j.LoggerFactory

@Component
class OrchestrationResponseListener(
    private val userOrchestrationService: UserOrchestrationService,
    private val authOrchestrationService: AuthOrchestrationService
) {
    private val logger = LoggerFactory.getLogger(OrchestrationResponseListener::class.java)
    
    @JmsListener(destination = "user.operations.response")
    fun handleUserResponse(message: String) {
        logger.debug("Received user response from JMS: $message")
        try {
            userOrchestrationService.handleResponse(message)
        } catch (e: Exception) {
            logger.error("Error processing user response: ${e.message}", e)
        }
    }
    
    @JmsListener(destination = "auth.operations.response")
    fun handleAuthResponse(message: String) {
        logger.debug("Received auth response from JMS: $message")
        try {
            authOrchestrationService.handleResponse(message)
        } catch (e: Exception) {
            logger.error("Error processing auth response: ${e.message}", e)
        }
    }
}
