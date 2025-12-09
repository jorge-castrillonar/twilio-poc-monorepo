package com.allcode.s3handler.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

data class PresignedUrlRequest(
    @field:NotBlank(message = "File name is required")
    @field:Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Invalid file name")
    val fileName: String,
    
    @field:NotBlank(message = "Content type is required")
    val contentType: String,
    
    val basePath: String? = null,
    val isPublic: Boolean = false,
    val userMetadata: Map<String, String>? = null
)