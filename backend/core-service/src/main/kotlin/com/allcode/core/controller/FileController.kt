package com.allcode.core.controller

import com.allcode.core.dto.*
import com.allcode.core.service.FileService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = ["*"])
class FileController(private val fileService: FileService) {

    @PostMapping("/upload-url")
    fun generateUploadUrl(@Valid @RequestBody request: FileUploadRequest): ResponseEntity<ServiceResponse<Any>> {
        // Use userId from request, fallback to "anonymous" if not provided
        val userId = request.userId ?: "anonymous"
        return fileService.generateUploadUrl(request, userId)
    }

    @PostMapping("/download-url")
    fun generateDownloadUrl(@Valid @RequestBody request: FileDownloadRequest): ResponseEntity<ServiceResponse<Any>> {
        return fileService.generateDownloadUrl(request)
    }

    @GetMapping("/metadata")
    fun getFileMetadata(@RequestParam fileKey: String): ResponseEntity<ServiceResponse<Any>> {
        return fileService.getFileMetadata(fileKey)
    }

    @PostMapping("/{fileId}/complete")
    fun completeUpload(@PathVariable fileId: String): ResponseEntity<ServiceResponse<Any>> {
        return fileService.completeUpload(fileId)
    }

    @DeleteMapping
    fun deleteFile(@RequestParam fileKey: String): ResponseEntity<ServiceResponse<Any>> {
        return fileService.deleteFile(FileDeleteRequest(fileKey))
    }
    
    @GetMapping
    fun getUserFiles(@RequestParam(defaultValue = "anonymous") userId: String): ResponseEntity<ServiceResponse<Any>> {
        val files = fileService.getUserFiles(userId)
        return ResponseEntity.ok(ServiceResponse(success = true, data = files))
    }
    
    @PostMapping("/metadata")
    fun updateFileMetadata(@RequestParam fileKey: String, @RequestBody request: Map<String, String>): ResponseEntity<ServiceResponse<Any>> {
        val fileName = request["fileName"] ?: return ResponseEntity.badRequest().body(
            ServiceResponse<Any>(success = false, message = "fileName is required")
        )
        return fileService.updateFileMetadata(fileKey, fileName)
    }
}