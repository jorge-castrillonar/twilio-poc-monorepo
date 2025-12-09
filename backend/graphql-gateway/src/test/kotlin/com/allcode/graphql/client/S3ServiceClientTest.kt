package com.allcode.graphql.client

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class S3ServiceClientTest {

    @Test
    fun `should handle getStorageInfo error gracefully`() = runBlocking {
        val client = S3ServiceClient("http://localhost:8080")
        val result = client.getStorageInfo("file123")
        assertNull(result)
    }

    @Test
    fun `should handle generateDownloadUrl error gracefully`() = runBlocking {
        val client = S3ServiceClient("http://localhost:8080")
        val result = client.generateDownloadUrl("file123", 3600)
        assertNull(result)
    }
}