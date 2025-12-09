package com.allcode.graphql.security

import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.stereotype.Component

@Component
class JwtAuthenticationProvider : AuthenticationProvider {

    override fun authenticate(authentication: Authentication): Authentication? {
        val token = authentication.principal as? String ?: return null
        
        // Simple JWT validation - in production, use proper JWT library
        if (token.startsWith("Bearer ")) {
            val jwtToken = token.substring(7)
            // Mock validation - replace with real JWT validation
            if (jwtToken.isNotEmpty()) {
                return PreAuthenticatedAuthenticationToken(
                    "user", 
                    null, 
                    listOf(SimpleGrantedAuthority("ROLE_USER"))
                )
            }
        }
        
        return null
    }

    override fun supports(authentication: Class<*>): Boolean {
        return PreAuthenticatedAuthenticationToken::class.java.isAssignableFrom(authentication)
    }
}