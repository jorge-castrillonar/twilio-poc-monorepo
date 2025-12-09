package com.allcode.core.controller

import com.allcode.core.dto.*
import com.allcode.core.service.AuthOrchestrationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = ["*"])
class AuthController(
    private val authOrchestrationService: AuthOrchestrationService
) {
    private val logger = LoggerFactory.getLogger(AuthController::class.java)
    
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<ServiceResponse<AuthResponse>> {
        return try {
            logger.info("Login attempt for email: ${request.email}")
            val authResponse = authOrchestrationService.login(request)
            ResponseEntity.ok(ServiceResponse(success = true, data = authResponse, message = "Login successful"))
        } catch (e: Exception) {
            logger.error("Login failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ServiceResponse(success = false, message = e.message ?: "Login failed"))
        }
    }
    
    @PostMapping("/refresh")
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<ServiceResponse<AuthResponse>> {
        return try {
            logger.info("Token refresh attempt")
            val authResponse = authOrchestrationService.refreshToken(request)
            ResponseEntity.ok(ServiceResponse(success = true, data = authResponse, message = "Token refreshed successfully"))
        } catch (e: Exception) {
            logger.error("Token refresh failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ServiceResponse(success = false, message = e.message ?: "Token refresh failed"))
        }
    }
    
    @PostMapping("/logout")
    fun logout(@Valid @RequestBody request: LogoutRequest): ResponseEntity<ServiceResponse<Boolean>> {
        return try {
            logger.info("Logout attempt")
            val success = authOrchestrationService.logout(request)
            if (success) {
                ResponseEntity.ok(ServiceResponse(success = true, data = true, message = "Logout successful"))
            } else {
                ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ServiceResponse(success = false, message = "Logout failed"))
            }
        } catch (e: Exception) {
            logger.error("Logout failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ServiceResponse(success = false, message = e.message ?: "Logout failed"))
        }
    }
    
    @PostMapping("/mfa/setup")
    fun setupMfa(@RequestHeader("X-User-Id") userId: String): ResponseEntity<ServiceResponse<MfaSetupResponse>> {
        return try {
            logger.info("MFA setup for user: $userId")
            val mfaSetup = authOrchestrationService.setupMfa(userId)
            ResponseEntity.ok(ServiceResponse(success = true, data = mfaSetup, message = "MFA setup initiated"))
        } catch (e: Exception) {
            logger.error("MFA setup failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "MFA setup failed"))
        }
    }
    
    @PostMapping("/mfa/enable")
    fun enableMfa(
        @RequestHeader("X-User-Id") userId: String,
        @Valid @RequestBody request: EnableMfaRequest
    ): ResponseEntity<ServiceResponse<Boolean>> {
        return try {
            logger.info("Enabling MFA for user: $userId")
            val success = authOrchestrationService.enableMfa(userId, request)
            if (success) {
                ResponseEntity.ok(ServiceResponse(success = true, data = true, message = "MFA enabled successfully"))
            } else {
                ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ServiceResponse(success = false, message = "Invalid TOTP code"))
            }
        } catch (e: Exception) {
            logger.error("Enable MFA failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServiceResponse(success = false, message = e.message ?: "Enable MFA failed"))
        }
    }
    
    @PostMapping("/mfa/disable")
    fun disableMfa(@RequestHeader("X-User-Id") userId: String): ResponseEntity<ServiceResponse<Boolean>> {
        return try {
            logger.info("Disabling MFA for user: $userId")
            val success = authOrchestrationService.disableMfa(userId)
            if (success) {
                ResponseEntity.ok(ServiceResponse(success = true, data = true, message = "MFA disabled successfully"))
            } else {
                ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ServiceResponse(success = false, message = "Failed to disable MFA"))
            }
        } catch (e: Exception) {
            logger.error("Disable MFA failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ServiceResponse(success = false, message = e.message ?: "Disable MFA failed"))
        }
    }
    
    @PostMapping("/verify")
    fun verifyToken(@RequestBody request: Map<String, String>): ResponseEntity<ServiceResponse<Map<String, Any>>> {
        return try {
            val token = request["token"] ?: throw IllegalArgumentException("Token is required")
            logger.info("Token verification attempt")
            val claims = authOrchestrationService.verifyToken(token)
            if (claims != null) {
                ResponseEntity.ok(ServiceResponse(success = true, data = claims, message = "Token is valid"))
            } else {
                ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ServiceResponse(success = false, message = "Invalid token"))
            }
        } catch (e: Exception) {
            logger.error("Token verification failed: ${e.message}", e)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ServiceResponse(success = false, message = e.message ?: "Token verification failed"))
        }
    }
}
