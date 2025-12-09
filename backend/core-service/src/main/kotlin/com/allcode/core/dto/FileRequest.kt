package com.allcode.core.dto

data class FileUploadRequest(
    val fileName: String,
    val contentType: String,
    val userId: String? = null,
    val isPublic: Boolean = false
)

data class FileDownloadRequest(
    val fileKey: String
)

data class FileDeleteRequest(
    val fileKey: String
)

data class ServiceResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null
)