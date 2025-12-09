package com.allcode.graphql.dataloader

import com.allcode.graphql.client.S3ServiceClient
import com.allcode.graphql.model.StorageInfo
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.time.LocalDateTime

class StorageInfoDataLoaderTest {

    private val s3ServiceClient = mockk<S3ServiceClient>()
    private val dataLoader = StorageInfoDataLoader(s3ServiceClient)

    @Test
    fun `should create dataloader successfully`() {
        val loader = dataLoader.createDataLoader()
        assertNotNull(loader)
    }

    @Test
    fun `should handle batch loading`() {
        val fileIds = listOf("file1", "file2")
        val storageInfoMap = mapOf(
            "file1" to StorageInfo("key1", "bucket", 100, "etag1", "STANDARD", LocalDateTime.now(), "us-east-1")
        )
        
        coEvery { s3ServiceClient.getStorageInfoBatch(fileIds) } returns storageInfoMap

        val loader = dataLoader.createDataLoader()
        val future = loader.loadMany(fileIds)
        
        assertNotNull(future)
    }
}