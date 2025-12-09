package com.allcode.s3handler.dto

data class PresignedUrlResponse(
    val uploadUrl: String? = null,
    val downloadUrl: String? = null,
    val fileKey: String,
    val expiresIn: Long
)