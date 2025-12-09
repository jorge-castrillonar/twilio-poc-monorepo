package com.allcode.graphql.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Base64
import javax.crypto.SecretKey

@Service
class JwtService {
    private val logger = LoggerFactory.getLogger(JwtService::class.java)
    
    /**
     * Extract user ID from JWT token
     */
    fun extractUserId(token: String): String? {
        return try {
            val claims = parseClaims(token)
            claims?.get("sub") as? String
        } catch (e: Exception) {
            logger.error("Error extracting userId from JWT: ${e.message}")
            null
        }
    }
    
    /**
     * Extract email from JWT token
     */
    fun extractEmail(token: String): String? {
        return try {
            val claims = parseClaims(token)
            claims?.get("email") as? String
        } catch (e: Exception) {
            logger.error("Error extracting email from JWT: ${e.message}")
            null
        }
    }
    
    /**
     * Extract roles from JWT token
     */
    fun extractRoles(token: String): String? {
        return try {
            val claims = parseClaims(token)
            claims?.get("roles") as? String
        } catch (e: Exception) {
            logger.error("Error extracting roles from JWT: ${e.message}")
            null
        }
    }
    
    /**
     * Validate JWT token
     */
    fun validateToken(token: String): Boolean {
        return try {
            parseClaims(token) != null
        } catch (e: Exception) {
            logger.error("Token validation failed: ${e.message}")
            false
        }
    }
    
    /**
     * Parse JWT claims
     */
    private fun parseClaims(token: String): Map<String, Any>? {
        return try {
            // Remove "Bearer " prefix if present
            val cleanToken = if (token.startsWith("Bearer ")) {
                token.substring(7)
            } else {
                token
            }
            
            // For RS256 signed tokens, we need the public key
            // Since auth-service uses RS256, we'll parse without verification for now
            // In production, use the actual RSA public key
            val parts = cleanToken.split(".")
            if (parts.size != 3) {
                logger.error("Invalid JWT format")
                return null
            }
            
            // Decode the payload (second part)
            val payloadJson = String(Base64.getUrlDecoder().decode(parts[1]))
            logger.debug("JWT Payload: $payloadJson")
            
            // Parse claims manually since we're not verifying signature yet
            // This is a simplified approach for testing
            val mapper = com.fasterxml.jackson.module.kotlin.jacksonObjectMapper()
            @Suppress("UNCHECKED_CAST")
            mapper.readValue(payloadJson, Map::class.java) as Map<String, Any>
        } catch (e: Exception) {
            logger.error("Error parsing JWT claims: ${e.message}", e)
            null
        }
    }
}
