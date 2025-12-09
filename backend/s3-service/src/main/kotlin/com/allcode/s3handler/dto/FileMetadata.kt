package com.allcode.s3handler.dto

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant

@JsonInclude(JsonInclude.Include.NON_NULL)
data class FileMetadata(
    val fileName: String,
    val contentType: String?,
    val size: Long,
    val lastModified: Instant?,
    val metadata: Map<String, String>
)