package com.allcode.users.controller

import com.allcode.users.dto.*
import com.allcode.users.entity.UserRole
import com.allcode.users.entity.UserStatus
import com.allcode.users.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @PostMapping
    fun createUser(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<UserResponse> {
        val user = userService.createUser(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(user)
    }

    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: UUID): ResponseEntity<UserResponse> {
        val user = userService.getUserById(userId)
        return ResponseEntity.ok(user)
    }

    @GetMapping("/email/{email}")
    fun getUserByEmail(@PathVariable email: String): ResponseEntity<UserResponse> {
        val user = userService.getUserByEmail(email)
        return ResponseEntity.ok(user)
    }

    @GetMapping
    fun getAllUsers(
        @RequestParam(required = false) status: UserStatus?,
        @RequestParam(required = false) role: UserRole?,
        @RequestParam(required = false) emailSearch: String?,
        @RequestParam(required = false) nameSearch: String?
    ): ResponseEntity<List<UserResponse>> {
        val users = when {
            status != null -> userService.getUsersByStatus(status)
            role != null -> userService.getUsersByRole(role)
            emailSearch != null -> userService.searchUsersByEmail(emailSearch)
            nameSearch != null -> userService.searchUsersByName(nameSearch)
            else -> userService.getAllUsers()
        }
        return ResponseEntity.ok(users)
    }

    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: UUID,
        @Valid @RequestBody request: UpdateUserRequest
    ): ResponseEntity<UserResponse> {
        val user = userService.updateUser(userId, request)
        return ResponseEntity.ok(user)
    }

    @PatchMapping("/{userId}/status")
    fun changeUserStatus(
        @PathVariable userId: UUID,
        @RequestParam status: UserStatus
    ): ResponseEntity<UserResponse> {
        val user = userService.changeUserStatus(userId, status)
        return ResponseEntity.ok(user)
    }

    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: UUID): ResponseEntity<Void> {
        userService.deleteUser(userId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/exists/{email}")
    fun userExists(@PathVariable email: String): ResponseEntity<Map<String, Boolean>> {
        val exists = userService.userExistsByEmail(email)
        return ResponseEntity.ok(mapOf("exists" to exists))
    }

    @GetMapping("/count")
    fun getUserCount(@RequestParam status: UserStatus): ResponseEntity<Map<String, Long>> {
        val count = userService.getUserCountByStatus(status)
        return ResponseEntity.ok(mapOf("count" to count))
    }
}
