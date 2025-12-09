package com.allcode.graphql.exception

import graphql.schema.DataFetchingEnvironment
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.springframework.graphql.execution.ErrorType

class GraphQLExceptionHandlerTest {

    private val handler = GraphQLExceptionHandler()
    private val env = mockk<DataFetchingEnvironment>()

    @Test
    fun `should handle IllegalArgumentException`() {
        every { env.executionStepInfo.path } returns mockk()
        every { env.field.sourceLocation } returns mockk()
        
        val exception = IllegalArgumentException("Invalid input")
        val result = handler.resolveToSingleError(exception, env)
        
        assertNotNull(result)
        assertEquals(ErrorType.BAD_REQUEST, result?.errorType)
        assertTrue(result?.message?.contains("Invalid input") == true)
    }

    @Test
    fun `should handle SecurityException`() {
        every { env.executionStepInfo.path } returns mockk()
        every { env.field.sourceLocation } returns mockk()
        
        val exception = SecurityException("Access denied")
        val result = handler.resolveToSingleError(exception, env)
        
        assertNotNull(result)
        assertEquals(ErrorType.UNAUTHORIZED, result?.errorType)
        assertEquals("Access denied", result?.message)
    }

    @Test
    fun `should handle unknown exceptions`() {
        every { env.executionStepInfo.path } returns mockk()
        every { env.field.sourceLocation } returns mockk()
        
        val exception = RuntimeException("Unknown error")
        val result = handler.resolveToSingleError(exception, env)
        
        assertNotNull(result)
        assertEquals(ErrorType.INTERNAL_ERROR, result?.errorType)
        assertEquals("Internal server error", result?.message)
    }
}