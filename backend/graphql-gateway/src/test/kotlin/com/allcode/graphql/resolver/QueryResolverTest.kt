package com.allcode.graphql.resolver

import com.allcode.graphql.client.CoreServiceClient
import com.allcode.graphql.client.S3ServiceClient
import com.allcode.graphql.model.*
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.time.LocalDateTime

class QueryResolverTest {

    private val coreServiceClient = mockk<CoreServiceClient>()
    private val s3ServiceClient = mockk<S3ServiceClient>()
    private val queryResolver = QueryResolver(coreServiceClient, s3ServiceClient)

    @Test
    fun `should return file by id`() = runBlocking {
        // Given
        val fileId = "test-file-id"
        val expectedFile = File(
            id = fileId,
            userId = "user123",
            originalName = "test.txt",
            contentType = "text/plain",
            status = FileStatus.ACTIVE,
            uploadDate = LocalDateTime.now(),
            isPublic = false
        )
        
        coEvery { coreServiceClient.getFileById(fileId) } returns expectedFile

        // When
        val result = queryResolver.file(fileId)

        // Then
        assertEquals(expectedFile, result)
    }

    @Test
    fun `should return user files`() = runBlocking {
        // Given
        val userId = "user123"
        val files = listOf(
            File(
                id = "file1",
                userId = userId,
                originalName = "file1.txt",
                contentType = "text/plain",
                status = FileStatus.ACTIVE,
                uploadDate = LocalDateTime.now(),
                isPublic = false
            ),
            File(
                id = "file2",
                userId = userId,
                originalName = "file2.txt",
                contentType = "text/plain",
                status = FileStatus.ACTIVE,
                uploadDate = LocalDateTime.now(),
                isPublic = true
            )
        )
        
        coEvery { coreServiceClient.getUserFiles(userId) } returns files

        // When
        val result = queryResolver.userFiles(userId, null, null)

        // Then
        assertEquals(2, result.totalCount)
        assertEquals(files, result.files)
        assertFalse(result.hasNextPage)
    }

    @Test
    fun `should return user file stats`() = runBlocking {
        // Given
        val userId = "user123"
        val files = listOf(
            File(
                id = "file1",
                userId = userId,
                originalName = "file1.txt",
                contentType = "text/plain",
                status = FileStatus.ACTIVE,
                uploadDate = LocalDateTime.now(),
                isPublic = false
            ),
            File(
                id = "file2",
                userId = userId,
                originalName = "file2.txt",
                contentType = "text/plain",
                status = FileStatus.ACTIVE,
                uploadDate = LocalDateTime.now(),
                isPublic = true
            )
        )
        
        coEvery { coreServiceClient.getUserFiles(userId) } returns files

        // When
        val result = queryResolver.userFileStats(userId)

        // Then
        assertEquals(userId, result.userId)
        assertEquals(2, result.totalFiles)
        assertEquals(1, result.publicFiles)
        assertEquals(1, result.privateFiles)
        assertTrue(result.filesByStatus.any { it.status == FileStatus.ACTIVE && it.count == 2 })
    }

    @Test
    fun `should return health status`() = runBlocking {
        // Given
        val coreHealth = HealthStatus("core-service", "UP", null)
        val s3Health = HealthStatus("s3-service", "UP", null)
        
        coEvery { coreServiceClient.getHealth() } returns coreHealth
        coEvery { s3ServiceClient.getHealth() } returns s3Health

        // When
        val result = queryResolver.health()

        // Then
        assertEquals(2, result.size)
        assertTrue(result.contains(coreHealth))
        assertTrue(result.contains(s3Health))
    }
}