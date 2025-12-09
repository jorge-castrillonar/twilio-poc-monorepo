package com.allcode.graphql.config

import com.allcode.graphql.security.JwtService
import graphql.GraphQLContext
import org.slf4j.LoggerFactory
import org.springframework.graphql.server.WebGraphQlInterceptor
import org.springframework.graphql.server.WebGraphQlRequest
import org.springframework.graphql.server.WebGraphQlResponse
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class JwtGraphQLInterceptor(
    private val jwtService: JwtService
) : WebGraphQlInterceptor {
    
    private val logger = LoggerFactory.getLogger(JwtGraphQLInterceptor::class.java)
    
    override fun intercept(request: WebGraphQlRequest, chain: WebGraphQlInterceptor.Chain): Mono<WebGraphQlResponse> {
        // Extract JWT token from Authorization header
        val authHeader = request.headers.getFirst("Authorization")
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            logger.debug("JWT token found in request")
            
            // Extract user information from JWT
            val userId = jwtService.extractUserId(token)
            val email = jwtService.extractEmail(token)
            
            if (userId != null) {
                logger.info("Authenticated request for userId: $userId, email: $email")
                
                // Add user information to GraphQL context
                request.configureExecutionInput { executionInput, builder ->
                    builder.graphQLContext { contextBuilder ->
                        contextBuilder
                            .of("jwtToken", token)
                            .of("userId", userId)
                            .of("email", email ?: "")
                    }.build()
                }
            } else {
                logger.warn("Failed to extract userId from JWT token")
            }
        } else {
            logger.debug("No JWT token in request")
        }
        
        return chain.next(request)
    }
}
