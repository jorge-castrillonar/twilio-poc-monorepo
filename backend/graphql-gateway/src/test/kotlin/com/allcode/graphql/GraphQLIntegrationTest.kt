package com.allcode.graphql

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.reactive.function.client.WebClient
import reactor.test.StepVerifier

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class GraphQLIntegrationTest {

    @LocalServerPort
    private var port: Int = 0

    @Test
    fun `should handle health query`() {
        val webClient = WebClient.builder()
            .baseUrl("http://localhost:$port")
            .build()

        val query = """
            {
                "query": "query { health { service status } }"
            }
        """.trimIndent()

        val response = webClient.post()
            .uri("/graphql")
            .header("Content-Type", "application/json")
            .bodyValue(query)
            .retrieve()
            .bodyToMono(String::class.java)

        StepVerifier.create(response)
            .expectNextMatches { it.contains("\"service\"") }
            .verifyComplete()
    }
}