package com.allcode.graphql.jms

import com.allcode.graphql.model.UploadRequest
import com.allcode.graphql.model.UploadUrlResponse
import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.coroutines.CompletableDeferred
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Component
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@Component
class JmsMessageSender(
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper
) {
    private val pendingRequests = ConcurrentHashMap<String, CompletableDeferred<Any>>()

    suspend fun requestUploadUrl(request: UploadRequest): UploadUrlResponse {
        val correlationId = UUID.randomUUID().toString()
        val deferred = CompletableDeferred<Any>()
        pendingRequests[correlationId] = deferred

        val message = mapOf(
            "type" to "UPLOAD_URL_REQUEST",
            "correlationId" to correlationId,
            "data" to request
        )

        jmsTemplate.convertAndSend("upload.request.queue", objectMapper.writeValueAsString(message))
        
        return deferred.await() as UploadUrlResponse
    }

    fun handleResponse(correlationId: String, response: Any) {
        pendingRequests.remove(correlationId)?.complete(response)
    }
}