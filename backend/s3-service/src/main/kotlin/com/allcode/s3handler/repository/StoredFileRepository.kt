package com.allcode.s3handler.repository

import com.allcode.s3handler.entity.StoredFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface StoredFileRepository : JpaRepository<StoredFile, UUID> {
    fun findByS3Key(s3Key: String): StoredFile?
    fun deleteByS3Key(s3Key: String)
}