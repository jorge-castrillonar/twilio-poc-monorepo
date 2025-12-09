package com.allcode.graphql.security

import graphql.GraphQLContext
import org.springframework.stereotype.Component

@Component
class AuthenticationContext {
    
    companion object {
        private const val JWT_TOKEN_KEY = "jwtToken"
        private const val USER_ID_KEY = "userId"
        private const val EMAIL_KEY = "email"
    }
    
    /**
     * Extract JWT token from GraphQL context
     */
    fun getJwtToken(context: GraphQLContext): String? {
        return context.get<String>(JWT_TOKEN_KEY)
    }
    
    /**
     * Extract user ID from GraphQL context
     */
    fun getUserId(context: GraphQLContext): String? {
        return context.get<String>(USER_ID_KEY)
    }
    
    /**
     * Extract email from GraphQL context
     */
    fun getEmail(context: GraphQLContext): String? {
        return context.get<String>(EMAIL_KEY)
    }
}
