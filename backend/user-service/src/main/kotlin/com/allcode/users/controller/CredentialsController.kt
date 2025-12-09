package com.allcode.users.controller

import com.allcode.users.dto.CredentialValidationRequest
import com.allcode.users.dto.CredentialValidationResponse
import com.allcode.users.service.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/credentials")
class CredentialsController(
    private val userService: UserService
) {

    @PostMapping("/validate")
    fun validateCredentials(
        @Valid @RequestBody request: CredentialValidationRequest
    ): ResponseEntity<CredentialValidationResponse> {
        val response = userService.validateCredentials(request)
        return ResponseEntity.ok(response)
    }
}
