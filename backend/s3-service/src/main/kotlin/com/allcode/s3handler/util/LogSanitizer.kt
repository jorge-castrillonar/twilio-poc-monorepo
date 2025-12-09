package com.allcode.s3handler.util

import org.springframework.stereotype.Component

@Component
class LogSanitizer {
    
    fun sanitize(input: String?): String {
        return input?.replace(Regex("[\\r\\n\\t]"), "_") ?: ""
    }
    
    fun sanitizeFileName(fileName: String): String {
        return fileName.replace(Regex("[^a-zA-Z0-9._-]"), "_")
    }
}