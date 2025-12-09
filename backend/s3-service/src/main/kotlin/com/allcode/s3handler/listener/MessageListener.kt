package com.allcode.s3handler.listener

import com.allcode.s3handler.dto.PresignedUrlRequest
import com.allcode.s3handler.service.S3Service
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.jms.annotation.JmsListener
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Component
import java.util.*

@Component
class S3MessageListener(
    private val objectMapper: ObjectMapper,
    private val s3Service: S3Service,
    private val jmsTemplate: JmsTemplate
) {
    
    @Value("\${app.aws.s3.bucket}")
    private lateinit var bucket: String
    
    private val logger = LoggerFactory.getLogger(S3MessageListener::class.java)

    @JmsListener(destination = "s3.upload.url")
    fun handleUploadUrlRequest(message: String) {
        try {
            val request = objectMapper.readValue(message, Map::class.java)
            val correlationId = request["correlationId"] as String
            val payload = request["payload"] as Map<String, Any>
            
            val fileId = UUID.fromString(payload["fileId"] as String)
            val uploadRequest = PresignedUrlRequest(
                fileName = payload["fileName"] as String,
                contentType = payload["contentType"] as String,
                isPublic = payload["isPublic"] as? Boolean ?: false
            )
            
            val response = s3Service.generateUploadUrl(uploadRequest)
            
            // Record the file storage mapping
            s3Service.recordStoredFile(
                fileId = fileId,
                s3Key = response.fileKey,
                bucket = bucket,
                size = 0, // Will be updated after upload
                etag = null
            )
            
            sendResponse(correlationId, mapOf("success" to true, "data" to response))
            
        } catch (e: Exception) {
            logger.error("Error processing upload URL request", e)
            sendErrorResponse("unknown", "Failed to generate upload URL: ${e.message}")
        }
    }

    @JmsListener(destination = "s3.download.url")
    fun handleDownloadUrlRequest(message: String) {
        try {
            val request = objectMapper.readValue(message, Map::class.java)
            val correlationId = request["correlationId"] as String
            val payload = request["payload"] as Map<String, Any>
            
            val fileKey = payload["fileKey"] as String
            val response = s3Service.generateDownloadUrl(fileKey)
            sendResponse(correlationId, mapOf("success" to true, "data" to response))
            
        } catch (e: Exception) {
            logger.error("Error processing download URL request", e)
            sendErrorResponse("unknown", "Failed to generate download URL: ${e.message}")
        }
    }

    @JmsListener(destination = "s3.metadata")
    fun handleMetadataRequest(message: String) {
        try {
            val request = objectMapper.readValue(message, Map::class.java)
            val correlationId = request["correlationId"] as String
            val payload = request["payload"] as Map<String, Any>
            
            val fileKey = payload["fileKey"] as String
            val metadata = s3Service.getFileMetadata(fileKey)
            
            if (metadata != null) {
                sendResponse(correlationId, mapOf("success" to true, "data" to metadata))
            } else {
                sendResponse(correlationId, mapOf("success" to false, "message" to "File not found"))
            }
            
        } catch (e: Exception) {
            logger.error("Error processing metadata request", e)
            sendErrorResponse("unknown", "Failed to get file metadata: ${e.message}")
        }
    }

    @JmsListener(destination = "s3.delete")
    fun handleDeleteRequest(message: String) {
        try {
            val request = objectMapper.readValue(message, Map::class.java)
            val correlationId = request["correlationId"] as String
            val payload = request["payload"] as Map<String, Any>
            
            val fileKey = payload["fileKey"] as String
            val deleted = s3Service.deleteFile(fileKey)
            
            sendResponse(correlationId, mapOf(
                "success" to deleted,
                "message" to if (deleted) "File deleted successfully" else "Failed to delete file"
            ))
            
        } catch (e: Exception) {
            logger.error("Error processing delete request", e)
            sendErrorResponse("unknown", "Failed to delete file: ${e.message}")
        }
    }
    
    @JmsListener(destination = "s3.update.metadata")
    fun handleUpdateMetadataRequest(message: String) {
        try {
            val request = objectMapper.readValue(message, Map::class.java)
            val correlationId = request["correlationId"] as String
            val payload = request["payload"] as Map<String, Any>
            
            val fileKey = payload["fileKey"] as String
            val fileName = payload["fileName"] as String
            val updated = s3Service.updateFileMetadata(fileKey, fileName)
            
            sendResponse(correlationId, mapOf(
                "success" to updated,
                "message" to if (updated) "Metadata updated successfully" else "Failed to update metadata"
            ))
            
        } catch (e: Exception) {
            logger.error("Error processing metadata update request", e)
            val correlationId = try {
                val request = objectMapper.readValue(message, Map::class.java)
                request["correlationId"] as String
            } catch (ex: Exception) {
                "unknown"
            }
            sendErrorResponse(correlationId, "Failed to update metadata: ${e.message}")
        }
    }
    
    private fun sendResponse(correlationId: String, response: Map<String, Any>) {
        val responseMessage = mapOf(
            "correlationId" to correlationId,
            "response" to response
        )
        jmsTemplate.convertAndSend("core.response", objectMapper.writeValueAsString(responseMessage))
    }
    
    private fun sendErrorResponse(correlationId: String, errorMessage: String) {
        sendResponse(correlationId, mapOf("success" to false, "message" to errorMessage))
    }
}