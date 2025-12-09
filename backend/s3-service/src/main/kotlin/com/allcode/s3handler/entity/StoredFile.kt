package com.allcode.s3handler.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.*

@Entity
@Table(name = "stored_files")
data class StoredFile(
    @Id
    val fileId: UUID,
    
    @Column(nullable = false, unique = true)
    val s3Key: String,
    
    @Column(nullable = false)
    val bucket: String,
    
    @Column(nullable = false)
    val size: Long,
    
    val etag: String? = null,
    
    @Column(nullable = false)
    val storageClass: String = "STANDARD",
    
    @Column(nullable = false)
    val storedDate: Instant = Instant.now()
)