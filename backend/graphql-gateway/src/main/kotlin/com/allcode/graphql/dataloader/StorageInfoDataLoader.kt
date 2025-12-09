package com.allcode.graphql.dataloader

import com.allcode.graphql.client.S3ServiceClient
import com.allcode.graphql.model.StorageInfo
import org.dataloader.DataLoader
import org.dataloader.DataLoaderFactory
import org.springframework.stereotype.Component
import java.util.concurrent.CompletableFuture
import kotlinx.coroutines.future.future
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

@Component
class StorageInfoDataLoader(
    private val s3ServiceClient: S3ServiceClient
) {

    fun createDataLoader(): DataLoader<String, StorageInfo?> {
        return DataLoaderFactory.newDataLoader { fileIds ->
            CoroutineScope(Dispatchers.IO).future {
                runCatching {
                    // Use batch API to get storage info for multiple files
                    val storageInfoMap = s3ServiceClient.getStorageInfoBatch(fileIds)
                    fileIds.map { fileId -> storageInfoMap[fileId] }
                }.getOrElse { 
                    // Return nulls for all files if batch fails
                    fileIds.map { null }
                }
            }
        }
    }
}