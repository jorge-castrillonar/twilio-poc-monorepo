package com.allcode.core.service

import com.allcode.core.dto.*
import com.allcode.core.entity.UserFile
import com.allcode.core.entity.FileStatus
import com.allcode.core.listener.ResponseListener
import com.allcode.core.repository.UserFileRepository
import com.fasterxml.jackson.databind.ObjectMapper
import io.micrometer.core.annotation.Timed
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.http.ResponseEntity
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit
import java.util.*

@Service
class FileService(
    private val jmsTemplate: JmsTemplate,
    private val objectMapper: ObjectMapper,
    private val responseListener: ResponseListener,
    private val userFileRepository: UserFileRepository,
    private val meterRegistry: MeterRegistry
) {

    @Timed("core.file.upload_url")
    fun generateUploadUrl(request: FileUploadRequest, userId: String = "anonymous"): ResponseEntity<ServiceResponse<Any>> {
        meterRegistry.counter("core.file.upload_requests").increment()
        val userFile = UserFile(
            userId = userId,
            originalName = request.fileName,
            contentType = request.contentType,
            isPublic = request.isPublic
        )
        
        val savedFile = userFileRepository.save(userFile)
        
        val payload = mapOf(
            "fileId" to savedFile.fileId.toString(),
            "fileName" to request.fileName,
            "contentType" to request.contentType,
            "isPublic" to request.isPublic
        )
        
        val s3Response = sendMessageAndWaitForResponse("s3.upload.url", payload)
        
        // Add the database fileId to the response
        val responseData = s3Response.body?.data
        if (responseData is Map<*, *>) {
            val modifiedData = responseData.toMutableMap()
            modifiedData["fileId"] = savedFile.fileId.toString()
            return ResponseEntity.ok(ServiceResponse(
                success = true,
                data = modifiedData
            ))
        }
        
        return s3Response
    }

    fun generateDownloadUrl(request: FileDownloadRequest): ResponseEntity<ServiceResponse<Any>> {
        return sendMessageAndWaitForResponse("s3.download.url", request)
    }

    fun getFileMetadata(fileKey: String): ResponseEntity<ServiceResponse<Any>> {
        return sendMessageAndWaitForResponse("s3.metadata", mapOf("fileKey" to fileKey))
    }
    
    fun getUserFiles(userId: String): List<UserFile> {
        return userFileRepository.findByUserIdAndStatus(userId, FileStatus.ACTIVE)
    }
    
    fun completeUpload(fileId: String): ResponseEntity<ServiceResponse<Any>> {
        return try {
            val uuid = UUID.fromString(fileId)
            val file = updateFileStatus(uuid, FileStatus.ACTIVE)
            if (file != null) {
                ResponseEntity.ok(ServiceResponse(success = true, data = file))
            } else {
                ResponseEntity.status(404).body(ServiceResponse<Any>(success = false, message = "File not found"))
            }
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ServiceResponse<Any>(success = false, message = "Invalid file ID format"))
        }
    }
    
    fun updateFileStatus(fileId: UUID, status: FileStatus): UserFile? {
        val file = userFileRepository.findById(fileId).orElse(null)
        return file?.let {
            it.status = status
            userFileRepository.save(it)
        }
    }

    fun deleteFile(request: FileDeleteRequest): ResponseEntity<ServiceResponse<Any>> {
        return sendMessageAndWaitForResponse("s3.delete", request)
    }
    
    fun updateFileMetadata(fileKey: String, fileName: String): ResponseEntity<ServiceResponse<Any>> {
        val payload = mapOf(
            "fileKey" to fileKey,
            "fileName" to fileName
        )
        return sendMessageAndWaitForResponse("s3.update.metadata", payload)
    }

    private fun sendMessageAndWaitForResponse(queue: String, payload: Any): ResponseEntity<ServiceResponse<Any>> {
        return try {
            val correlationId = java.util.UUID.randomUUID().toString()
            val message = mapOf(
                "correlationId" to correlationId,
                "payload" to payload
            )
            
            val responseFuture = responseListener.registerRequest(correlationId)
            jmsTemplate.convertAndSend(queue, objectMapper.writeValueAsString(message))
            
            val response = responseFuture.get(30, TimeUnit.SECONDS)
            val success = response["success"] as Boolean
            
            if (success) {
                ResponseEntity.ok(ServiceResponse(
                    success = true,
                    data = response["data"],
                    message = response["message"] as? String
                ))
            } else {
                ResponseEntity.badRequest().body(ServiceResponse<Any>(
                    success = false,
                    message = response["message"] as? String ?: "Request failed"
                ))
            }
            
        } catch (e: Exception) {
            ResponseEntity.internalServerError().body(
                ServiceResponse<Any>(success = false, message = "Failed to process request: ${e.message}")
            )
        }
    }
}