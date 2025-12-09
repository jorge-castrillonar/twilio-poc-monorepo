package com.allcode.graphql.resolver

import com.allcode.graphql.client.CoreServiceClient
import com.allcode.graphql.client.S3ServiceClient
import com.allcode.graphql.model.*
import graphql.schema.DataFetchingEnvironment
import org.slf4j.LoggerFactory
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class QueryResolver(
    private val coreServiceClient: CoreServiceClient,
    private val s3ServiceClient: S3ServiceClient
) {
    private val logger = LoggerFactory.getLogger(QueryResolver::class.java)

    /**
     * Extract userId from GraphQL context (populated by JwtGraphQLInterceptor)
     */
    private fun getUserIdFromContext(environment: DataFetchingEnvironment): String {
        val userId = environment.graphQlContext.get<String>("userId")
        if (userId == null) {
            logger.error("User ID not found in GraphQL context")
            throw IllegalStateException("User must be authenticated")
        }
        return userId
    }

    @QueryMapping
    suspend fun file(
        @Argument id: String,
        environment: DataFetchingEnvironment
    ): File? {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Query: file(userId: $userId, fileId: $id)")
        return coreServiceClient.getFileById(id)
    }

    @QueryMapping
    suspend fun files(
        @Argument filter: FileFilter?,
        @Argument pagination: PaginationInput?,
        environment: DataFetchingEnvironment
    ): FileConnection {
        // Extract userId from JWT context, ignore filter.userId
        val authenticatedUserId = getUserIdFromContext(environment)
        logger.info("GraphQL Query: files(userId: $authenticatedUserId)")
        
        val files = coreServiceClient.getUserFiles(authenticatedUserId)
        return FileConnection(
            files = files,
            totalCount = files.size,
            hasNextPage = false,
            cursor = null
        )
    }

    @QueryMapping
    suspend fun userFiles(
        @Argument userId: String,
        @Argument status: FileStatus?,
        @Argument pagination: PaginationInput?
    ): FileConnection {
        val files = coreServiceClient.getUserFiles(userId)
        val filteredFiles = status?.let { s -> files.filter { it.status == s } } ?: files
        
        return FileConnection(
            files = filteredFiles,
            totalCount = filteredFiles.size,
            hasNextPage = false,
            cursor = null
        )
    }

    @QueryMapping
    suspend fun searchFiles(
        @Argument query: String,
        @Argument filter: FileFilter?,
        @Argument pagination: PaginationInput?
    ): FileConnection {
        // For now, return empty results - would need search implementation in core service
        return FileConnection(
            files = emptyList(),
            totalCount = 0,
            hasNextPage = false,
            cursor = null
        )
    }

    @QueryMapping
    suspend fun fileStorageInfo(@Argument fileId: String): StorageInfo? {
        return s3ServiceClient.getStorageInfo(fileId)
    }

    @QueryMapping
    suspend fun userFileStats(@Argument userId: String): UserFileStats {
        val files = coreServiceClient.getUserFiles(userId)
        val totalSize = files.sumOf { 0L } // Would need size from storage info
        val publicFiles = files.count { it.isPublic }
        val privateFiles = files.count { !it.isPublic }
        val filesByStatus = FileStatus.values().map { status ->
            StatusCount(status, files.count { it.status == status })
        }
        
        return UserFileStats(
            userId = userId,
            totalFiles = files.size,
            totalSize = totalSize,
            publicFiles = publicFiles,
            privateFiles = privateFiles,
            filesByStatus = filesByStatus
        )
    }

    @QueryMapping
    suspend fun health(): List<HealthStatus> {
        return listOf(
            coreServiceClient.getHealth(),
            s3ServiceClient.getHealth()
        )
    }
}