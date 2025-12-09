package com.allcode.graphql.resolver

import com.allcode.graphql.client.CoreServiceClient
import com.allcode.graphql.jms.JmsMessageSender
import com.allcode.graphql.model.*
import graphql.GraphQLContext
import graphql.schema.DataFetchingEnvironment
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.time.Instant

class MutationResolverTest {

    private val jmsMessageSender = mockk<JmsMessageSender>()
    private val coreServiceClient = mockk<CoreServiceClient>()
    private val graphQlContext = mockk<GraphQLContext>()
    private val environment = mockk<DataFetchingEnvironment>()
    private val mutationResolver = MutationResolver(jmsMessageSender, coreServiceClient)

    init {
        every { environment.graphQlContext } returns graphQlContext
        every { graphQlContext.get<String>("userId") } returns "user-123"
    }

    @Test
    fun `should generate upload URL`() = runBlocking {
        val request = UploadRequest(
            originalName = "test.txt",
            contentType = "text/plain",
            userId = "user123"
        )
        val expected = UploadUrlResponse("file-id", "https://s3.amazonaws.com/upload", 3600, Instant.now())
        
        coEvery { coreServiceClient.generateUploadUrl(request) } returns expected

        val result = mutationResolver.generateUploadUrl(request, environment)

        assertEquals(expected, result)
    }

    @Test
    fun `should generate download URL`() = runBlocking {
        val fileId = "file-123"
        val expiresIn = 1800
        val expected = "https://s3.amazonaws.com/download"
        
        coEvery { coreServiceClient.generateDownloadUrl(fileId, expiresIn) } returns expected

        val result = mutationResolver.generateDownloadUrl(fileId, expiresIn, environment)

        assertEquals(expected, result)
    }

    @Test
    fun `should delete file`() = runBlocking {
        val fileId = "file-123"
        val expected = DeleteFileResponse(true, fileId, "File deleted successfully")
        
        coEvery { coreServiceClient.deleteFile(fileId) } returns expected

        val result = mutationResolver.deleteFile(fileId, environment)

        assertEquals(expected, result)
    }
}
