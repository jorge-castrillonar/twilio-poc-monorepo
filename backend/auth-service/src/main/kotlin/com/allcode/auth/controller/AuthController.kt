package com.allcode.auth.controller

import com.allcode.auth.dto.*
import com.allcode.auth.service.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<LoginResponse> {
        val ipAddress = getClientIp(httpRequest)
        val userAgent = httpRequest.getHeader("User-Agent")

        val response = authService.login(request, ipAddress, userAgent)
        
        return if (response.mfaRequired) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
        } else {
            ResponseEntity.ok(response)
        }
    }

    @PostMapping("/refresh")
    fun refreshToken(
        @Valid @RequestBody request: RefreshTokenRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<RefreshTokenResponse> {
        val ipAddress = getClientIp(httpRequest)
        val response = authService.refreshToken(request.refreshToken, ipAddress)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/logout")
    fun logout(@Valid @RequestBody request: LogoutRequest): ResponseEntity<Map<String, String>> {
        authService.logout(request.refreshToken)
        return ResponseEntity.ok(mapOf("message" to "Logged out successfully"))
    }

    // Helper method to extract client IP
    private fun getClientIp(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        return when {
            xForwardedFor != null -> xForwardedFor.split(",")[0].trim()
            else -> request.remoteAddr
        }
    }
}
