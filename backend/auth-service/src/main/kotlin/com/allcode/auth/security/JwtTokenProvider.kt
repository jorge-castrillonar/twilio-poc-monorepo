package com.allcode.auth.security

import com.allcode.auth.dto.JwtClaims
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import java.nio.file.Files
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.PublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.time.Instant
import java.util.*
import jakarta.annotation.PostConstruct

@Component
class JwtTokenProvider(
    @Value("\${jwt.private-key-path}")
    private val privateKeyPath: Resource,

    @Value("\${jwt.public-key}")
    private val publicKeyBase64: String,

    @Value("\${jwt.access-token-expiration}")
    private val accessTokenExpiration: Long,

    @Value("\${jwt.refresh-token-expiration}")
    private val refreshTokenExpiration: Long,

    @Value("\${jwt.issuer}")
    private val issuer: String
) {
    private val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)
    
    private lateinit var privateKey: PrivateKey
    private lateinit var publicKey: PublicKey

    @PostConstruct
    fun init() {
        try {
            privateKey = loadPrivateKey()
            publicKey = loadPublicKey()
            logger.info("Successfully loaded RSA keys for JWT signing")
        } catch (e: Exception) {
            logger.error("Failed to load RSA keys", e)
            throw IllegalStateException("Failed to initialize JWT token provider", e)
        }
    }

    /**
     * Generate an access token
     */
    fun generateAccessToken(
        userId: UUID,
        email: String,
        roles: Set<String>
    ): String {
        val now = Instant.now()
        val expiresAt = now.plusMillis(accessTokenExpiration)

        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("email", email)
            .claim("roles", roles.joinToString(","))
            .claim("type", "access")
            .setIssuer(issuer)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiresAt))
            .signWith(privateKey, SignatureAlgorithm.RS256)
            .compact()
    }

    /**
     * Generate a refresh token
     */
    fun generateRefreshToken(userId: UUID): String {
        val now = Instant.now()
        val expiresAt = now.plusMillis(refreshTokenExpiration)

        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("type", "refresh")
            .setIssuer(issuer)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiresAt))
            .signWith(privateKey, SignatureAlgorithm.RS256)
            .compact()
    }

    /**
     * Validate a token and return claims if valid
     */
    fun validateToken(token: String): JwtClaims? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .payload

            val userId = UUID.fromString(claims.subject)
            val email = claims["email"] as? String ?: ""
            val rolesString = claims["roles"] as? String ?: ""
            val roles = rolesString.split(",").filter { it.isNotBlank() }.toSet()

            JwtClaims(
                userId = userId,
                email = email,
                roles = roles,
                issuer = claims.issuer,
                issuedAt = claims.issuedAt.toInstant(),
                expiresAt = claims.expiration.toInstant()
            )
        } catch (e: Exception) {
            logger.debug("Token validation failed: ${e.message}")
            null
        }
    }

    /**
     * Extract user ID from token without full validation
     */
    fun getUserIdFromToken(token: String): UUID? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .payload

            UUID.fromString(claims.subject)
        } catch (e: Exception) {
            logger.debug("Failed to extract user ID from token: ${e.message}")
            null
        }
    }

    /**
     * Check if token is expired
     */
    fun isTokenExpired(token: String): Boolean {
        return try {
            val claims = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .payload

            claims.expiration.before(Date())
        } catch (e: Exception) {
            true
        }
    }

    /**
     * Get token expiration time in seconds
     */
    fun getAccessTokenExpirationSeconds(): Long = accessTokenExpiration / 1000

    /**
     * Get refresh token expiration time in seconds
     */
    fun getRefreshTokenExpirationSeconds(): Long = refreshTokenExpiration / 1000

    /**
     * Get refresh token expiration instant
     */
    fun getRefreshTokenExpirationInstant(): Instant {
        return Instant.now().plusMillis(refreshTokenExpiration)
    }

    // Private helper methods

    private fun loadPrivateKey(): PrivateKey {
        val keyBytes = privateKeyPath.inputStream.use { inputStream ->
            String(inputStream.readAllBytes())
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("\\s".toRegex(), "")
        }

        val decodedKey = Base64.getDecoder().decode(keyBytes)
        val keySpec = PKCS8EncodedKeySpec(decodedKey)
        val keyFactory = KeyFactory.getInstance("RSA")
        
        return keyFactory.generatePrivate(keySpec)
    }

    private fun loadPublicKey(): PublicKey {
        val keyBytes = publicKeyBase64
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")

        val decodedKey = Base64.getDecoder().decode(keyBytes)
        val keySpec = X509EncodedKeySpec(decodedKey)
        val keyFactory = KeyFactory.getInstance("RSA")
        
        return keyFactory.generatePublic(keySpec)
    }
}
