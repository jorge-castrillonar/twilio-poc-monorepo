package com.allcode.graphql.resolver

import com.allcode.graphql.client.CoreServiceClient
import com.allcode.graphql.jms.JmsMessageSender
import com.allcode.graphql.model.*
import graphql.schema.DataFetchingEnvironment
import org.slf4j.LoggerFactory
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.stereotype.Controller

@Controller
class MutationResolver(
    private val jmsMessageSender: JmsMessageSender,
    private val coreServiceClient: CoreServiceClient
) {
    private val logger = LoggerFactory.getLogger(MutationResolver::class.java)

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

    @MutationMapping
    suspend fun generateUploadUrl(
        @Argument input: UploadRequest,
        environment: DataFetchingEnvironment
    ): UploadUrlResponse? {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: generateUploadUrl(userId: $userId, originalName: ${input.originalName})")
        
        // Override userId from JWT context
        val authenticatedRequest = input.copy(userId = userId)
        return coreServiceClient.generateUploadUrl(authenticatedRequest)
    }

    @MutationMapping
    suspend fun completeUpload(
        @Argument fileId: String,
        environment: DataFetchingEnvironment
    ): File? {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: completeUpload(userId: $userId, fileId: $fileId)")
        return coreServiceClient.completeUpload(fileId)
    }

    @MutationMapping
    suspend fun generateDownloadUrl(
        @Argument fileId: String,
        @Argument expiresIn: Int,
        environment: DataFetchingEnvironment
    ): String? {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: generateDownloadUrl(userId: $userId, fileId: $fileId)")
        return coreServiceClient.generateDownloadUrl(fileId, expiresIn)
    }

    @MutationMapping
    suspend fun deleteFile(
        @Argument fileId: String,
        environment: DataFetchingEnvironment
    ): DeleteFileResponse {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: deleteFile(userId: $userId, fileId: $fileId)")
        return coreServiceClient.deleteFile(fileId)
    }

    @MutationMapping
    suspend fun updateFileVisibility(@Argument fileId: String, @Argument isPublic: Boolean): File? {
        // This would need to be implemented in the core service
        return coreServiceClient.getFileById(fileId)
    }

    @MutationMapping
    suspend fun updateFileMetadata(
        @Argument fileId: String,
        @Argument originalName: String?
    ): File? {
        // This would need to be implemented in the core service
        return coreServiceClient.getFileById(fileId)
    }
}
