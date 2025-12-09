package com.allcode.auth.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfig {

    @Value("\${user-service.base-url}")
    private lateinit var userServiceBaseUrl: String

    @Bean
    fun userServiceWebClient(): WebClient {
        return WebClient.builder()
            .baseUrl(userServiceBaseUrl)
            .build()
    }
}
