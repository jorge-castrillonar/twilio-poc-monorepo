package com.allcode.graphql

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource

@SpringBootTest
@TestPropertySource(properties = [
    "services.core.url=http://localhost:8081",
    "services.s3.url=http://localhost:8080",
    "spring.activemq.broker-url=vm://localhost"
])
class GraphQLGatewayApplicationTests {

    @Test
    fun contextLoads() {
        // Test that Spring context loads successfully
    }
}