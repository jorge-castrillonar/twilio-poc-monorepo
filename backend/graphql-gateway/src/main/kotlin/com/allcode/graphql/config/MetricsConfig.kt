package com.allcode.graphql.config

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Timer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.graphql.server.WebGraphQlHandler
import org.springframework.graphql.server.webmvc.GraphQlHttpHandler

@Configuration
class MetricsConfig {

    @Bean
    fun graphqlTimer(meterRegistry: MeterRegistry): Timer {
        return Timer.builder("graphql.query.duration")
            .description("GraphQL query execution time")
            .register(meterRegistry)
    }
}