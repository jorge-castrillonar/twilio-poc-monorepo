package com.allcode.graphql.client

import com.allcode.graphql.model.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import java.time.Instant

@Component
class CoreServiceClient(
    @Value("\${services.core.url:http://localhost:8081}")
    private val coreServiceUrl: String,
    private val webClient: WebClient = WebClient.builder().baseUrl(coreServiceUrl).build()
) {
    private val logger = LoggerFactory.getLogger(CoreServiceClient::class.java)

    suspend fun getUserFiles(userId: String): List<File> {
        return try {
            val response = webClient.get()
                .uri("/api/v1/files?userId={userId}", userId)
                .retrieve()
                .awaitBody<ServiceResponse>()
            
            // Convert list of Maps to List<File>
            val dataList = response.data as? List<*> ?: return emptyList()
            dataList.mapNotNull { item ->
                val data = item as? Map<*, *> ?: return@mapNotNull null
                convertMapToFile(data)
            }
        } catch (e: Exception) {
            logger.error("Error fetching user files for userId: $userId", e)
            emptyList()
        }
    }
    
    private fun convertMapToFile(data: Map<*, *>): File? {
        return try {
            val uploadDateString = data["uploadDate"]?.toString() ?: return null
            // Parse ISO-8601 date string to Instant
            val uploadDate = Instant.parse(uploadDateString)
            
            File(
                id = data["fileId"]?.toString() ?: return null,
                userId = data["userId"]?.toString() ?: return null,
                originalName = data["originalName"]?.toString() ?: return null,
                contentType = data["contentType"]?.toString() ?: return null,
                status = FileStatus.valueOf(data["status"]?.toString() ?: return null),
                uploadDate = uploadDate,
                isPublic = data["isPublic"] as? Boolean ?: false,
                size = data["size"]?.toString()?.toIntOrNull(),
                storageInfo = null // Storage info would need separate mapping if provided by backend
            )
        } catch (e: Exception) {
            logger.error("Error converting map to File", e)
            null
        }
    }

    data class ServiceResponse(
        val success: Boolean,
        val data: Any? = null,
        val message: String? = null
    )

    suspend fun getFileById(fileId: String): File? {
        return try {
            webClient.get()
                .uri("/api/v1/files/{fileId}", fileId)
                .retrieve()
                .awaitBody()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun deleteFile(fileId: String): DeleteFileResponse {
        return webClient.delete()
            .uri("/api/v1/files?fileKey={fileId}", fileId)
            .retrieve()
            .awaitBody()
    }

    suspend fun generateDownloadUrl(fileId: String, expiresIn: Int): String? {
        return try {
            val response = webClient.post()
                .uri("/api/v1/files/download-url")
                .bodyValue(mapOf("fileKey" to fileId, "expiresIn" to expiresIn))
                .retrieve()
                .awaitBody<ServiceResponse>()
            
            val data = response.data as? Map<*, *> ?: return null
            data["downloadUrl"]?.toString()
        } catch (e: Exception) {
            logger.error("Error generating download URL for fileId: $fileId", e)
            null
        }
    }

    suspend fun generateUploadUrl(request: UploadRequest): UploadUrlResponse? {
        return try {
            val response = webClient.post()
                .uri("/api/v1/files/upload-url")
                .bodyValue(mapOf(
                    "fileName" to request.originalName,  // Map originalName to fileName for backend
                    "contentType" to request.contentType,
                    "userId" to request.userId
                ))
                .retrieve()
                .awaitBody<ServiceResponse>()
            
            val data = response.data as? Map<String, Any>
            data?.let {
                UploadUrlResponse(
                    fileId = it["fileId"] as? String ?: it["fileKey"] as String, // Use database UUID, fallback to S3 key
                    uploadUrl = it["uploadUrl"] as String,
                    expiresIn = 3600,
                    createdAt = Instant.now()
                )
            }
        } catch (e: Exception) {
            null
        }
    }

    suspend fun completeUpload(fileId: String): File? {
        return try {
            val response = webClient.post()
                .uri("/api/v1/files/{fileId}/complete", fileId)
                .retrieve()
                .awaitBody<ServiceResponse>()
            
            // Convert response data (Map) to File object
            val data = response.data as? Map<*, *> ?: return null
            convertMapToFile(data)
        } catch (e: Exception) {
            logger.error("Error completing upload for fileId: $fileId", e)
            null
        }
    }

    suspend fun getHealth(): HealthStatus {
        return try {
            webClient.get()
                .uri("/actuator/health")
                .retrieve()
                .awaitBody<Map<String, Any>>()
                .let { 
                    HealthStatus(
                        service = "core-service",
                        status = it["status"] as String,
                        details = null
                    )
                }
        } catch (e: Exception) {
            HealthStatus(
                service = "core-service",
                status = "DOWN",
                details = e.message
            )
        }
    }
}
