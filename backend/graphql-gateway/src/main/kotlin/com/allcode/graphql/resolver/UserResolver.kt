package com.allcode.graphql.resolver

import com.allcode.graphql.client.UserServiceClient
import com.allcode.graphql.model.*
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import org.slf4j.LoggerFactory

@Controller
class UserResolver(
    private val userServiceClient: UserServiceClient
) {
    private val logger = LoggerFactory.getLogger(UserResolver::class.java)
    
    // ============================================
    // Queries
    // ============================================
    
    @QueryMapping
    suspend fun user(@Argument id: String): User? {
        logger.info("GraphQL Query: user(id: $id)")
        return try {
            userServiceClient.getUserById(id)
        } catch (e: Exception) {
            logger.error("Error getting user: ${e.message}", e)
            null
        }
    }
    
    @QueryMapping
    suspend fun userByEmail(@Argument email: String): User? {
        logger.info("GraphQL Query: userByEmail(email: $email)")
        return try {
            userServiceClient.getUserByEmail(email)
        } catch (e: Exception) {
            logger.error("Error getting user by email: ${e.message}", e)
            null
        }
    }
    
    @QueryMapping
    suspend fun users(
        @Argument status: UserStatus?,
        @Argument role: UserRole?
    ): List<User> {
        logger.info("GraphQL Query: users(status: $status, role: $role)")
        return try {
            userServiceClient.getUsers(status, role)
        } catch (e: Exception) {
            logger.error("Error getting users: ${e.message}", e)
            emptyList()
        }
    }
    
    // ============================================
    // Mutations
    // ============================================
    
    @MutationMapping
    suspend fun createUser(@Argument input: CreateUserInput): User {
        logger.info("GraphQL Mutation: createUser(email: ${input.email})")
        return userServiceClient.createUser(input)
    }
    
    @MutationMapping
    suspend fun updateUser(
        @Argument id: String,
        @Argument input: UpdateUserInput
    ): User {
        logger.info("GraphQL Mutation: updateUser(id: $id)")
        return userServiceClient.updateUser(id, input)
    }
    
    @MutationMapping
    suspend fun deleteUser(@Argument id: String): Boolean {
        logger.info("GraphQL Mutation: deleteUser(id: $id)")
        return userServiceClient.deleteUser(id)
    }
    
    @MutationMapping
    suspend fun assignRole(
        @Argument userId: String,
        @Argument role: UserRole
    ): User {
        logger.info("GraphQL Mutation: assignRole(userId: $userId, role: $role)")
        return userServiceClient.assignRole(userId, role)
    }
    
    @MutationMapping
    suspend fun revokeRole(
        @Argument userId: String,
        @Argument role: UserRole
    ): User {
        logger.info("GraphQL Mutation: revokeRole(userId: $userId, role: $role)")
        return userServiceClient.revokeRole(userId, role)
    }
}
