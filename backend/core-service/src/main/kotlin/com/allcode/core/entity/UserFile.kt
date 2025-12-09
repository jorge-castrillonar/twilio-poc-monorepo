package com.allcode.core.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.*

@Entity
@Table(name = "user_files")
class UserFile {
    @Id
    var fileId: UUID = UUID.randomUUID()
    
    @Column(nullable = false)
    var userId: String = ""
    
    @Column(nullable = false)
    var originalName: String = ""
    
    @Column(nullable = false)
    var contentType: String = ""
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: FileStatus = FileStatus.UPLOADING
    
    @Column(nullable = false)
    var uploadDate: Instant = Instant.now()
    
    var isPublic: Boolean = false
    
    constructor()
    
    constructor(
        userId: String,
        originalName: String,
        contentType: String,
        status: FileStatus = FileStatus.UPLOADING,
        uploadDate: Instant = Instant.now(),
        isPublic: Boolean = false
    ) {
        this.userId = userId
        this.originalName = originalName
        this.contentType = contentType
        this.status = status
        this.uploadDate = uploadDate
        this.isPublic = isPublic
    }
}

enum class FileStatus {
    UPLOADING, ACTIVE, DELETED, FAILED
}