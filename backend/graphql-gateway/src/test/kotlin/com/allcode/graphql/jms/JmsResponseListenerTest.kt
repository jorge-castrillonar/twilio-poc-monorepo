package com.allcode.graphql.jms

import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import javax.jms.TextMessage

class JmsResponseListenerTest {

    private val listener = JmsResponseListener()

    @Test
    fun `should register request successfully`() {
        val correlationId = "test-correlation-id"
        val future = listener.registerRequest(correlationId)
        
        assertNotNull(future)
        assertFalse(future.isDone)
    }

    @Test
    fun `should handle response message`() {
        val correlationId = "test-correlation-id"
        val future = listener.registerRequest(correlationId)
        
        val message = mockk<TextMessage>()
        every { message.jmsCorrelationID } returns correlationId
        every { message.text } returns "test response"
        
        listener.handleResponse(message)
        
        assertTrue(future.isDone)
        assertEquals("test response", future.get())
    }

    @Test
    fun `should cleanup expired requests`() {
        listener.cleanupExpiredRequests()
        // Should not throw exception
    }
}