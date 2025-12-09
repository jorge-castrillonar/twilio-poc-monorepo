package com.allcode.core.repository

import com.allcode.core.entity.UserFile
import com.allcode.core.entity.FileStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserFileRepository : JpaRepository<UserFile, UUID> {
    fun findByUserId(userId: String): List<UserFile>
    fun findByUserIdAndStatus(userId: String, status: FileStatus): List<UserFile>
    fun findByFileIdAndUserId(fileId: UUID, userId: String): UserFile?
}