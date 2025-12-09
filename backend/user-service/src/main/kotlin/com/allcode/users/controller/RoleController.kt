package com.allcode.users.controller

import com.allcode.users.dto.RoleAssignmentRequest
import com.allcode.users.dto.UserResponse
import com.allcode.users.service.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/users/{userId}/roles")
class RoleController(
    private val userService: UserService
) {

    @PostMapping
    fun assignRole(
        @PathVariable userId: UUID,
        @Valid @RequestBody request: RoleAssignmentRequest
    ): ResponseEntity<UserResponse> {
        val user = userService.assignRole(userId, request.role)
        return ResponseEntity.ok(user)
    }

    @DeleteMapping("/{role}")
    fun revokeRole(
        @PathVariable userId: UUID,
        @PathVariable role: String
    ): ResponseEntity<UserResponse> {
        val roleEnum = com.allcode.users.entity.UserRole.fromString(role)
        val user = userService.revokeRole(userId, roleEnum)
        return ResponseEntity.ok(user)
    }
}
