package com.allcode.graphql.resolver

import com.allcode.graphql.client.CoreServiceClient
import com.allcode.graphql.model.*
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.dataloader.DataLoader
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import graphql.schema.DataFetchingEnvironment
import java.time.Instant
import java.util.concurrent.CompletableFuture

class FileFieldResolverTest {

    private val coreServiceClient = mockk<CoreServiceClient>()
    private val resolver = FileFieldResolver(coreServiceClient)

    @Test
    fun `should load storage info via DataLoader`() {
        val file = File("file1", "user1", "test.txt", "text/plain", FileStatus.ACTIVE, Instant.now(), false)
        val dataLoader = mockk<DataLoader<String, StorageInfo?>>()
        val environment = mockk<DataFetchingEnvironment>()
        val storageInfo = StorageInfo("key1", "bucket", 100, "etag", "STANDARD", Instant.now(), "us-east-1")
        
        every { environment.getDataLoader<String, StorageInfo?>("storageInfo") } returns dataLoader
        coEvery { dataLoader.load("file1") } returns CompletableFuture.completedFuture(storageInfo)

        val result = resolver.storageInfo(file, environment)

        assertEquals(storageInfo, result.get())
    }

    @Test
    fun `should generate download URL`() = runBlocking {
        val file = File("file1", "user1", "test.txt", "text/plain", FileStatus.ACTIVE, Instant.now(), false)
        val expectedUrl = "https://download.example.com"
        
        coEvery { coreServiceClient.generateDownloadUrl("file1", 3600) } returns expectedUrl

        val result = resolver.downloadUrl(file, 3600)

        assertEquals(expectedUrl, result)
    }
}
