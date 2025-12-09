package com.allcode.graphql.resolver

import com.allcode.graphql.client.AuthServiceClient
import com.allcode.graphql.model.*
import graphql.schema.DataFetchingEnvironment
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.stereotype.Controller
import org.slf4j.LoggerFactory

@Controller
class AuthResolver(
    private val authServiceClient: AuthServiceClient
) {
    private val logger = LoggerFactory.getLogger(AuthResolver::class.java)
    
    /**
     * Extract userId from GraphQL context (set by JwtGraphQLInterceptor)
     */
    private fun getUserIdFromContext(environment: DataFetchingEnvironment): String {
        val userId = environment.graphQlContext.get<String>("userId")
        if (userId == null) {
            logger.error("No userId found in GraphQL context - JWT authentication may have failed")
            throw IllegalStateException("Authentication required")
        }
        return userId
    }
    
    // ============================================
    // Authentication Mutations
    // ============================================
    
    @MutationMapping
    suspend fun login(@Argument input: LoginInput): AuthResponse {
        logger.info("GraphQL Mutation: login(email: ${input.email})")
        return authServiceClient.login(input)
    }
    
    @MutationMapping
    suspend fun refreshToken(@Argument input: RefreshTokenInput): AuthResponse {
        logger.info("GraphQL Mutation: refreshToken")
        return authServiceClient.refreshToken(input)
    }
    
    @MutationMapping
    suspend fun logout(@Argument input: LogoutInput): Boolean {
        logger.info("GraphQL Mutation: logout")
        return authServiceClient.logout(input)
    }
    
    @MutationMapping
    suspend fun verifyToken(@Argument token: String): TokenVerificationResult {
        logger.info("GraphQL Mutation: verifyToken")
        return authServiceClient.verifyToken(token)
    }
    
    @MutationMapping
    suspend fun setupMfa(environment: DataFetchingEnvironment): MfaSetupResponse {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: setupMfa(userId: $userId)")
        return authServiceClient.setupMfa(userId)
    }
    
    @MutationMapping
    suspend fun enableMfa(@Argument input: EnableMfaInput, environment: DataFetchingEnvironment): Boolean {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: enableMfa(userId: $userId)")
        return authServiceClient.enableMfa(userId, input)
    }
    
    @MutationMapping
    suspend fun disableMfa(environment: DataFetchingEnvironment): Boolean {
        val userId = getUserIdFromContext(environment)
        logger.info("GraphQL Mutation: disableMfa(userId: $userId)")
        return authServiceClient.disableMfa(userId)
    }
}
