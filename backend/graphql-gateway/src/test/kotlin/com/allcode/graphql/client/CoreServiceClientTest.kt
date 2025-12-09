package com.allcode.graphql.client

import com.allcode.graphql.model.*
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.springframework.web.reactive.function.client.WebClient
import java.time.LocalDateTime

class CoreServiceClientTest {

    @Test
    fun `should handle getUserFiles error gracefully`() = runBlocking {
        val client = CoreServiceClient("http://localhost:8081")
        val result = client.getUserFiles("user123")
        assertEquals(emptyList<File>(), result)
    }

    @Test
    fun `should handle getFileById error gracefully`() = runBlocking {
        val client = CoreServiceClient("http://localhost:8081")
        val result = client.getFileById("file123")
        assertNull(result)
    }
}