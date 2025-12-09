package com.allcode.graphql.jms

import org.slf4j.LoggerFactory
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CompletableFuture
import jakarta.jms.Message
import jakarta.jms.TextMessage

@Component
class JmsResponseListener {
    
    private val logger = LoggerFactory.getLogger(JmsResponseListener::class.java)
    private val pendingRequests = ConcurrentHashMap<String, CompletableFuture<String>>()

    fun registerRequest(correlationId: String): CompletableFuture<String> {
        val future = CompletableFuture<String>()
        pendingRequests[correlationId] = future
        return future
    }

    @JmsListener(destination = "graphql.response.queue")
    fun handleResponse(message: Message) {
        try {
            val correlationId = message.jmsCorrelationID
            if (correlationId != null) {
                val future = pendingRequests.remove(correlationId)
                if (future != null) {
                    val response = when (message) {
                        is TextMessage -> message.text
                        else -> message.toString()
                    }
                    future.complete(response)
                    logger.debug("Completed request with correlation ID: $correlationId")
                } else {
                    logger.warn("No pending request found for correlation ID: $correlationId")
                }
            } else {
                logger.warn("Received message without correlation ID")
            }
        } catch (e: Exception) {
            logger.error("Error processing JMS response", e)
        }
    }

    fun cleanupExpiredRequests() {
        // This could be called periodically to clean up expired requests
        val expiredKeys = pendingRequests.entries
            .filter { it.value.isDone || it.value.isCancelled }
            .map { it.key }
        
        expiredKeys.forEach { pendingRequests.remove(it) }
        
        if (expiredKeys.isNotEmpty()) {
            logger.debug("Cleaned up ${expiredKeys.size} expired requests")
        }
    }
}