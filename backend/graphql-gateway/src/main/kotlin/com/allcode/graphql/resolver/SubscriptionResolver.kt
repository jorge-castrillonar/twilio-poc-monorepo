package com.allcode.graphql.resolver

import com.allcode.graphql.model.*
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.SubscriptionMapping
import org.springframework.stereotype.Controller
import reactor.core.publisher.Flux
import java.time.Duration
import java.time.Instant

@Controller
class SubscriptionResolver {

    @SubscriptionMapping
    fun fileStatusChanged(@Argument userId: String): Flux<File> {
        // Mock implementation - in real scenario, this would listen to JMS events
        return Flux.interval(Duration.ofSeconds(30))
            .map { 
                File(
                    id = "mock-file-$it",
                    userId = userId,
                    originalName = "mock-file-$it.txt",
                    contentType = "text/plain",
                    status = FileStatus.ACTIVE,
                    uploadDate = Instant.now(),
                    isPublic = false
                )
            }
    }

    @SubscriptionMapping
    fun uploadProgress(@Argument fileId: String): Flux<UploadProgress> {
        // Mock implementation - simulate upload progress
        return Flux.range(0, 11)
            .delayElements(Duration.ofSeconds(1))
            .map { progress ->
                val percentage = progress * 10.0
                UploadProgress(
                    fileId = fileId,
                    bytesUploaded = (percentage * 1000).toLong(),
                    totalBytes = 100000L,
                    percentage = percentage,
                    status = when {
                        percentage < 100 -> UploadStatus.IN_PROGRESS
                        else -> UploadStatus.COMPLETED
                    }
                )
            }
    }

    @SubscriptionMapping
    fun userFileEvents(@Argument userId: String): Flux<FileEvent> {
        // Mock implementation - in real scenario, this would listen to JMS events
        return Flux.interval(Duration.ofMinutes(1))
            .map { 
                FileEvent(
                    type = FileEventType.CREATED,
                    file = File(
                        id = "event-file-$it",
                        userId = userId,
                        originalName = "event-file-$it.txt",
                        contentType = "text/plain",
                        status = FileStatus.ACTIVE,
                        uploadDate = Instant.now(),
                        isPublic = false
                    ),
                    timestamp = Instant.now()
                )
            }
    }
}