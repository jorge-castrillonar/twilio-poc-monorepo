package com.allcode.core.listener

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CompletableFuture

@Component
class ResponseListener(private val objectMapper: ObjectMapper) {
    
    private val logger = LoggerFactory.getLogger(ResponseListener::class.java)
    private val pendingRequests = ConcurrentHashMap<String, CompletableFuture<Map<String, Any>>>()

    @JmsListener(destination = "core.response")
    fun handleResponse(message: String) {
        try {
            val response = objectMapper.readValue(message, Map::class.java)
            val correlationId = response["correlationId"] as String
            val responseData = response["response"] as Map<String, Any>
            
            pendingRequests[correlationId]?.complete(responseData)
            pendingRequests.remove(correlationId)
            
        } catch (e: Exception) {
            logger.error("Error processing response message", e)
        }
    }
    
    fun registerRequest(correlationId: String): CompletableFuture<Map<String, Any>> {
        val future = CompletableFuture<Map<String, Any>>()
        pendingRequests[correlationId] = future
        return future
    }
}