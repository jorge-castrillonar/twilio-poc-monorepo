package com.allcode.graphql.resolver

import com.allcode.graphql.client.CoreServiceClient
import com.allcode.graphql.model.File
import com.allcode.graphql.model.StorageInfo
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller
import java.util.concurrent.CompletableFuture
import graphql.schema.DataFetchingEnvironment

@Controller
class FileFieldResolver(
    private val coreServiceClient: CoreServiceClient
) {

    @SchemaMapping(typeName = "File", field = "storageInfo")
    fun storageInfo(file: File, environment: DataFetchingEnvironment): CompletableFuture<StorageInfo?> {
        // If storageInfo is already set in the file object, return it directly
        if (file.storageInfo != null) {
            return CompletableFuture.completedFuture(file.storageInfo)
        }
        
        // Otherwise, try to get it via DataLoader
        val dataLoader = environment.getDataLoader<String, StorageInfo?>("storageInfo")
        return dataLoader.load(file.id).exceptionally { null }
    }

    @SchemaMapping(typeName = "File", field = "downloadUrl")
    suspend fun downloadUrl(file: File, @Argument expiresIn: Int): String? {
        return coreServiceClient.generateDownloadUrl(file.id, expiresIn)
    }

    @SchemaMapping(typeName = "File", field = "size")
    fun size(file: File, environment: DataFetchingEnvironment): CompletableFuture<Int?> {
        // If size is already set in the file object, return it directly
        if (file.size != null) {
            return CompletableFuture.completedFuture(file.size)
        }
        
        // Otherwise, try to get it from storageInfo via DataLoader
        val dataLoader = environment.getDataLoader<String, StorageInfo?>("storageInfo")
        return dataLoader.load(file.id).thenApply { it?.size }.exceptionally { null }
    }
}
