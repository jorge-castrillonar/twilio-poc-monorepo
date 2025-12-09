package com.allcode.graphql.model

import java.time.Instant

data class File(
    val id: String,
    val userId: String,
    val originalName: String,
    val contentType: String,
    val status: FileStatus,
    val uploadDate: Instant,
    val isPublic: Boolean,
    val size: Int? = null,
    val storageInfo: StorageInfo? = null
)

enum class FileStatus {
    UPLOADING, ACTIVE, DELETED, FAILED
}

data class StorageInfo(
    val s3Key: String,
    val bucket: String,
    val size: Int,
    val etag: String?,
    val storageClass: String,
    val storedDate: Instant,
    val region: String?
)

data class UploadUrlResponse(
    val fileId: String,
    val uploadUrl: String,
    val expiresIn: Int,
    val createdAt: Instant
)

data class DeleteFileResponse(
    val success: Boolean,
    val fileId: String,
    val message: String?
)

data class FileConnection(
    val files: List<File>,
    val totalCount: Int,
    val hasNextPage: Boolean,
    val cursor: String?
)

data class HealthStatus(
    val service: String,
    val status: String,
    val details: String?
)

data class UploadRequest(
    val originalName: String,
    val contentType: String,
    val isPublic: Boolean = false,
    val userId: String? = null  // Optional, populated from JWT
)

data class FileFilter(
    val userId: String? = null,
    val status: FileStatus? = null,
    val contentType: String? = null,
    val isPublic: Boolean? = null
)

data class PaginationInput(
    val limit: Int = 20,
    val offset: Int = 0
)

// User Statistics
data class UserFileStats(
    val userId: String,
    val totalFiles: Int,
    val totalSize: Long,
    val publicFiles: Int,
    val privateFiles: Int,
    val filesByStatus: List<StatusCount>
)

data class StatusCount(
    val status: FileStatus,
    val count: Int
)

// Subscription Models
data class FileEvent(
    val type: FileEventType,
    val file: File,
    val timestamp: Instant
)

enum class FileEventType {
    CREATED, UPDATED, DELETED, STATUS_CHANGED
}

data class UploadProgress(
    val fileId: String,
    val bytesUploaded: Long,
    val totalBytes: Long,
    val percentage: Double,
    val status: UploadStatus
)

enum class UploadStatus {
    PENDING, IN_PROGRESS, COMPLETED, FAILED
}