package com.allcode.s3handler.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.core.retry.RetryPolicy
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.time.Duration

@Configuration
class AwsConfig {

    @Value("\${app.aws.access-key-id}")
    private lateinit var accessKeyId: String

    @Value("\${app.aws.secret-access-key}")
    private lateinit var secretAccessKey: String

    @Value("\${app.aws.s3.region}")
    private lateinit var region: String

    @Bean
    fun s3Client(): S3Client {
        val credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey)
        
        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .overrideConfiguration { config ->
                config.retryPolicy(
                    RetryPolicy.builder()
                        .numRetries(3)
                        .build()
                )
                config.apiCallTimeout(Duration.ofSeconds(30))
                config.apiCallAttemptTimeout(Duration.ofSeconds(10))
            }
            .build()
    }
}