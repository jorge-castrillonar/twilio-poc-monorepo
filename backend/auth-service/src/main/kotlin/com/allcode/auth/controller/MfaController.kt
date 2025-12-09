package com.allcode.auth.controller

import com.allcode.auth.dto.*
import com.allcode.auth.security.JwtTokenProvider
import com.allcode.auth.service.AuthEventService
import com.allcode.auth.service.MfaService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/mfa")
class MfaController(
    private val mfaService: MfaService,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authEventService: AuthEventService
) {

    @PostMapping("/setup")
    fun setupMfa(
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<MfaSetupResponse> {
        val (userId, email) = extractUserFromToken(authHeader)
        val response = mfaService.setupMfa(userId, email)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/enable")
    fun enableMfa(
        @RequestHeader("Authorization") authHeader: String,
        @Valid @RequestBody request: MfaEnableRequest
    ): ResponseEntity<Map<String, String>> {
        val (userId, email) = extractUserFromToken(authHeader)
        
        val success = mfaService.enableMfa(userId, request.totpCode)
        
        return if (success) {
            authEventService.publishMfaEnabledEvent(userId, email)
            ResponseEntity.ok(mapOf("message" to "MFA enabled successfully"))
        } else {
            ResponseEntity.badRequest().body(mapOf("error" to "Invalid TOTP code"))
        }
    }

    @PostMapping("/disable")
    fun disableMfa(
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<Map<String, String>> {
        val (userId, email) = extractUserFromToken(authHeader)
        
        mfaService.disableMfa(userId)
        authEventService.publishMfaDisabledEvent(userId, email)
        
        return ResponseEntity.ok(mapOf("message" to "MFA disabled successfully"))
    }

    @GetMapping("/status")
    fun getMfaStatus(
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<MfaStatusResponse> {
        val (userId, _) = extractUserFromToken(authHeader)
        val status = mfaService.getMfaStatus(userId)
        return ResponseEntity.ok(status)
    }

    @PostMapping("/verify")
    fun verifyMfa(
        @RequestHeader("Authorization") authHeader: String,
        @Valid @RequestBody request: MfaVerifyRequest
    ): ResponseEntity<Map<String, Boolean>> {
        val (userId, _) = extractUserFromToken(authHeader)
        val valid = mfaService.verifyTotp(userId, request.totpCode)
        return ResponseEntity.ok(mapOf("valid" to valid))
    }

    // Helper method to extract user info from JWT token
    private fun extractUserFromToken(authHeader: String): Pair<UUID, String> {
        val token = authHeader.replace("Bearer ", "")
        val claims = jwtTokenProvider.validateToken(token)
            ?: throw IllegalArgumentException("Invalid token")
        return Pair(claims.userId, claims.email)
    }
}
