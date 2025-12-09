package com.allcode.graphql.security

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken

class JwtAuthenticationProviderTest {

    private val provider = JwtAuthenticationProvider()

    @Test
    fun `should authenticate valid Bearer token`() {
        val token = PreAuthenticatedAuthenticationToken("Bearer valid-token", null)
        
        val result = provider.authenticate(token)
        
        assertNotNull(result)
        assertEquals("user", result?.principal)
    }

    @Test
    fun `should reject invalid token`() {
        val token = PreAuthenticatedAuthenticationToken("invalid", null)
        
        val result = provider.authenticate(token)
        
        assertNull(result)
    }

    @Test
    fun `should support PreAuthenticatedAuthenticationToken`() {
        assertTrue(provider.supports(PreAuthenticatedAuthenticationToken::class.java))
    }
}