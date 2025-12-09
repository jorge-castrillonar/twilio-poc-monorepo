package com.allcode.auth.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class RateLimitService(
    private val redisTemplate: RedisTemplate<String, Any>
) {
    private val logger = LoggerFactory.getLogger(RateLimitService::class.java)

    @Value("\${rate-limit.login.max-attempts}")
    private var loginMaxAttempts: Int = 5

    @Value("\${rate-limit.login.duration-seconds}")
    private var loginDurationSeconds: Long = 300

    @Value("\${rate-limit.refresh.max-attempts}")
    private var refreshMaxAttempts: Int = 10

    @Value("\${rate-limit.refresh.duration-seconds}")
    private var refreshDurationSeconds: Long = 60

    /**
     * Check if login is allowed for the given identifier (email or IP)
     */
    fun isLoginAllowed(identifier: String): Boolean {
        val key = "rate_limit:login:$identifier"
        val attempts = getAttempts(key)
        
        if (attempts >= loginMaxAttempts) {
            logger.warn("Rate limit exceeded for login: $identifier")
            return false
        }
        
        return true
    }

    /**
     * Record a login attempt
     */
    fun recordLoginAttempt(identifier: String) {
        val key = "rate_limit:login:$identifier"
        incrementAttempts(key, Duration.ofSeconds(loginDurationSeconds))
    }

    /**
     * Clear login attempts for identifier (on successful login)
     */
    fun clearLoginAttempts(identifier: String) {
        val key = "rate_limit:login:$identifier"
        redisTemplate.delete(key)
    }

    /**
     * Check if token refresh is allowed
     */
    fun isRefreshAllowed(identifier: String): Boolean {
        val key = "rate_limit:refresh:$identifier"
        val attempts = getAttempts(key)
        
        if (attempts >= refreshMaxAttempts) {
            logger.warn("Rate limit exceeded for refresh: $identifier")
            return false
        }
        
        return true
    }

    /**
     * Record a refresh attempt
     */
    fun recordRefreshAttempt(identifier: String) {
        val key = "rate_limit:refresh:$identifier"
        incrementAttempts(key, Duration.ofSeconds(refreshDurationSeconds))
    }

    // Private helpers

    private fun getAttempts(key: String): Int {
        val value = redisTemplate.opsForValue().get(key)
        return (value as? Int) ?: 0
    }

    private fun incrementAttempts(key: String, duration: Duration) {
        redisTemplate.opsForValue().increment(key)
        redisTemplate.expire(key, duration)
    }
}
