package com.allcode.graphql.resolver

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import reactor.test.StepVerifier
import java.time.Duration

class SubscriptionResolverTest {

    private val subscriptionResolver = SubscriptionResolver()

    @Test
    fun `should emit file status changes`() {
        val userId = "user123"
        val flux = subscriptionResolver.fileStatusChanged(userId)
        
        StepVerifier.create(flux.take(1))
            .expectNextMatches { file -> file.userId == userId }
            .verifyComplete()
    }

    @Test
    fun `should emit upload progress`() {
        val fileId = "file123"
        val flux = subscriptionResolver.uploadProgress(fileId)
        
        StepVerifier.create(flux.take(1))
            .expectNextMatches { progress -> progress.fileId == fileId }
            .verifyComplete()
    }

    @Test
    fun `should emit user file events`() {
        val userId = "user123"
        val flux = subscriptionResolver.userFileEvents(userId)
        
        StepVerifier.create(flux.take(1))
            .expectNextMatches { event -> event.file.userId == userId }
            .verifyComplete()
    }
}