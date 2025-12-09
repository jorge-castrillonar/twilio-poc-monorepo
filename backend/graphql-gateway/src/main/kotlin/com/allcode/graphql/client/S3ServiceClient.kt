package com.allcode.graphql.client

import com.allcode.graphql.model.HealthStatus
import com.allcode.graphql.model.StorageInfo
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

@Component
class S3ServiceClient(
    @Value("\${services.s3.url:http://localhost:8080}")
    private val s3ServiceUrl: String,
    private val webClient: WebClient = WebClient.builder().baseUrl(s3ServiceUrl).build()
) {

    suspend fun getStorageInfo(fileId: String): StorageInfo? {
        return try {
            webClient.get()
                .uri("/internal/storage-info/{fileId}", fileId)
                .retrieve()
                .awaitBody()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun getStorageInfoBatch(fileIds: List<String>): Map<String, StorageInfo> {
        return try {
            webClient.post()
                .uri("/internal/storage-info/batch")
                .bodyValue(fileIds)
                .retrieve()
                .awaitBody()
        } catch (e: Exception) {
            emptyMap()
        }
    }

    suspend fun generateDownloadUrl(fileId: String, expiresIn: Int): String? {
        return try {
            webClient.post()
                .uri("/internal/download-url")
                .bodyValue(mapOf("fileId" to fileId, "expiresIn" to expiresIn))
                .retrieve()
                .awaitBody<Map<String, String>>()
                .get("downloadUrl")
        } catch (e: Exception) {
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
                        service = "s3-service",
                        status = it["status"] as String,
                        details = null
                    )
                }
        } catch (e: Exception) {
            HealthStatus(
                service = "s3-service",
                status = "DOWN",
                details = e.message
            )
        }
    }
}