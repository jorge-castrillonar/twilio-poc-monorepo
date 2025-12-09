package com.allcode.s3handler.service

import com.allcode.s3handler.dto.FileMetadata
import com.allcode.s3handler.dto.PresignedUrlRequest
import com.allcode.s3handler.dto.PresignedUrlResponse
import com.allcode.s3handler.entity.StoredFile
import com.allcode.s3handler.repository.StoredFileRepository
import com.allcode.s3handler.util.LogSanitizer
import io.micrometer.core.annotation.Timed
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.*
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.time.Duration
import java.util.*

@Service
class S3Service(
    private val s3Client: S3Client,
    private val logSanitizer: LogSanitizer,
    private val storedFileRepository: StoredFileRepository
) {
    
    private val logger = LoggerFactory.getLogger(S3Service::class.java)
    
    @Value("\${app.aws.s3.bucket}")
    private lateinit var bucket: String
    
    @Value("\${app.aws.s3.public-bucket}")
    private lateinit var publicBucket: String
    
    @Value("\${app.aws.s3.signed-url-validity}")
    private var signedUrlValidity: Long = 3600
    
    @Value("\${app.aws.s3.base-upload-folder}")
    private lateinit var baseUploadFolder: String
    
    @Value("\${app.aws.s3.region}")
    private lateinit var region: String

    @Timed("s3.generate_upload_url")
    fun generateUploadUrl(request: PresignedUrlRequest): PresignedUrlResponse {
        val sanitizedFileName = logSanitizer.sanitizeFileName(request.fileName)
        val uniqueKey = generateUniqueKey(sanitizedFileName, request.basePath)
        
        logger.info("Generating upload URL for file: {}", logSanitizer.sanitize(sanitizedFileName))
        
        val putObjectRequest = PutObjectRequest.builder()
            .bucket(if (request.isPublic) publicBucket else bucket)
            .key(uniqueKey)
            .contentType(request.contentType)
            .build()

        val presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(signedUrlValidity))
            .putObjectRequest(putObjectRequest)
            .build()

        val presigner = S3Presigner.builder()
            .region(software.amazon.awssdk.regions.Region.of(region))
            .build()
        val presignedRequest = presigner.presignPutObject(presignRequest)
        presigner.close()

        return PresignedUrlResponse(
            uploadUrl = presignedRequest.url().toString(),
            fileKey = uniqueKey,
            expiresIn = signedUrlValidity
        )
    }

    @Timed("s3.generate_download_url")
    fun generateDownloadUrl(fileKey: String, fileName: String? = null): PresignedUrlResponse {
        logger.info("Generating download URL for key: {}", logSanitizer.sanitize(fileKey))
        
        val getObjectRequest = GetObjectRequest.builder()
            .bucket(bucket)
            .key(fileKey)
            .apply {
                fileName?.let { 
                    responseContentDisposition("attachment; filename=\"${logSanitizer.sanitizeFileName(it)}\"")
                }
            }
            .build()

        val presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(signedUrlValidity))
            .getObjectRequest(getObjectRequest)
            .build()

        val presigner = S3Presigner.builder()
            .region(software.amazon.awssdk.regions.Region.of(region))
            .build()
        val presignedRequest = presigner.presignGetObject(presignRequest)
        presigner.close()

        return PresignedUrlResponse(
            downloadUrl = presignedRequest.url().toString(),
            fileKey = fileKey,
            expiresIn = signedUrlValidity
        )
    }

    @Cacheable("file-metadata")
    @Timed("s3.get_metadata")
    fun getFileMetadata(fileKey: String): FileMetadata? {
        return try {
            val headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .build()

            val response = s3Client.headObject(headObjectRequest)
            
            FileMetadata(
                fileName = response.metadata()["original-filename"] ?: fileKey.substringAfterLast("/"),
                contentType = response.contentType(),
                size = response.contentLength(),
                lastModified = response.lastModified(),
                metadata = response.metadata()
            )
        } catch (e: NoSuchKeyException) {
            logger.warn("File not found: {}", logSanitizer.sanitize(fileKey))
            null
        } catch (e: Exception) {
            logger.error("Error retrieving metadata for key: {}", logSanitizer.sanitize(fileKey), e)
            null
        }
    }

    @Timed("s3.delete_file")
    @Transactional
    fun deleteFile(fileKey: String): Boolean {
        return try {
            val deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .build()

            s3Client.deleteObject(deleteRequest)
            storedFileRepository.deleteByS3Key(fileKey)
            logger.info("Successfully deleted file: {}", logSanitizer.sanitize(fileKey))
            true
        } catch (e: Exception) {
            logger.error("Error deleting file: {}", logSanitizer.sanitize(fileKey), e)
            false
        }
    }
    
    fun recordStoredFile(fileId: UUID, s3Key: String, bucket: String, size: Long, etag: String?) {
        val storedFile = StoredFile(
            fileId = fileId,
            s3Key = s3Key,
            bucket = bucket,
            size = size,
            etag = etag
        )
        storedFileRepository.save(storedFile)
    }
    
    fun updateFileMetadata(fileKey: String, fileName: String): Boolean {
        return try {
            val copyRequest = CopyObjectRequest.builder()
                .sourceBucket(bucket)
                .sourceKey(fileKey)
                .destinationBucket(bucket)
                .destinationKey(fileKey)
                .metadata(mapOf(
                    "original-filename" to logSanitizer.sanitizeFileName(fileName),
                    "upload-timestamp" to System.currentTimeMillis().toString()
                ))
                .metadataDirective(MetadataDirective.REPLACE)
                .build()
                
            s3Client.copyObject(copyRequest)
            logger.info("Updated metadata for file: {}", logSanitizer.sanitize(fileKey))
            true
        } catch (e: Exception) {
            logger.error("Error updating metadata for file: {}", logSanitizer.sanitize(fileKey), e)
            false
        }
    }

    private fun generateUniqueKey(fileName: String, basePath: String?): String {
        val cleanBasePath = basePath?.trim('/')?.let { "$it/" } ?: baseUploadFolder.trim('/') + "/"
        val uniqueId = UUID.randomUUID().toString()
        val extension = fileName.substringAfterLast('.', "")
        val uniqueFileName = if (extension.isNotEmpty()) "$uniqueId.$extension" else uniqueId
        
        return "$cleanBasePath$uniqueFileName"
    }

    private fun buildMetadata(request: PresignedUrlRequest): Map<String, String> {
        val metadata = mutableMapOf<String, String>()
        metadata["original-filename"] = logSanitizer.sanitizeFileName(request.fileName)
        metadata["upload-timestamp"] = System.currentTimeMillis().toString()
        
        request.userMetadata?.forEach { (key, value) ->
            val sanitizedKey = key.replace(Regex("[^a-zA-Z0-9-_]"), "-").lowercase()
            metadata[sanitizedKey] = logSanitizer.sanitize(value)
        }
        
        return metadata
    }
}