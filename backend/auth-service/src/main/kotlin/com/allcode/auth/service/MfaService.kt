package com.allcode.auth.service

import com.allcode.auth.dto.MfaSetupResponse
import com.allcode.auth.dto.MfaStatusResponse
import com.allcode.auth.entity.MfaSecret
import com.allcode.auth.repository.MfaSecretRepository
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.client.j2se.MatrixToImageWriter
import org.apache.commons.codec.binary.Base32
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayOutputStream
import java.security.SecureRandom
import java.util.*
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlin.math.pow

@Service
@Transactional
class MfaService(
    private val mfaSecretRepository: MfaSecretRepository,
    @Value("\${mfa.issuer}") private val issuer: String,
    @Value("\${mfa.time-step-seconds}") private val timeStepSeconds: Long,
    @Value("\${mfa.window}") private val window: Int
) {
    private val logger = LoggerFactory.getLogger(MfaService::class.java)
    private val base32 = Base32()

    /**
     * Setup MFA for a user (generate secret and QR code)
     */
    fun setupMfa(userId: UUID, email: String): MfaSetupResponse {
        logger.info("Setting up MFA for user: $userId")

        // Generate random secret
        val secret = generateSecret()
        
        // Generate backup codes
        val backupCodes = generateBackupCodes()

        // Save or update MFA secret (not enabled yet)
        val mfaSecret = mfaSecretRepository.findByUserId(userId) ?: MfaSecret(
            userId = userId,
            secret = secret,
            enabled = false
        )
        
        mfaSecret.secret = secret
        mfaSecret.enabled = false
        mfaSecret.setBackupCodesList(backupCodes)
        
        mfaSecretRepository.save(mfaSecret)

        // Generate QR code URL
        val qrCodeUrl = generateQrCodeUrl(email, secret)

        return MfaSetupResponse(
            secret = secret,
            qrCodeUrl = qrCodeUrl,
            backupCodes = backupCodes,
            issuer = issuer,
            accountName = email
        )
    }

    /**
     * Enable MFA after verifying TOTP code
     */
    fun enableMfa(userId: UUID, totpCode: String): Boolean {
        logger.info("Enabling MFA for user: $userId")

        val mfaSecret = mfaSecretRepository.findByUserId(userId)
            ?: throw IllegalStateException("MFA not set up for user")

        if (mfaSecret.enabled) {
            throw IllegalStateException("MFA already enabled for user")
        }

        // Verify TOTP code
        if (!verifyTotp(mfaSecret.secret, totpCode)) {
            logger.warn("Invalid TOTP code during MFA enable for user: $userId")
            return false
        }

        // Enable MFA
        mfaSecret.enable()
        mfaSecretRepository.save(mfaSecret)

        logger.info("MFA enabled successfully for user: $userId")
        return true
    }

    /**
     * Disable MFA for a user
     */
    fun disableMfa(userId: UUID) {
        logger.info("Disabling MFA for user: $userId")

        val mfaSecret = mfaSecretRepository.findByUserId(userId)
            ?: throw IllegalStateException("MFA not set up for user")

        mfaSecret.disable()
        mfaSecretRepository.save(mfaSecret)

        logger.info("MFA disabled for user: $userId")
    }

    /**
     * Verify TOTP code
     */
    fun verifyTotp(userId: UUID, totpCode: String): Boolean {
        val mfaSecret = mfaSecretRepository.findByUserId(userId)
            ?: return false

        if (!mfaSecret.enabled) {
            return false
        }

        return verifyTotp(mfaSecret.secret, totpCode)
    }

    /**
     * Verify backup code
     */
    fun verifyBackupCode(userId: UUID, backupCode: String): Boolean {
        val mfaSecret = mfaSecretRepository.findByUserId(userId)
            ?: return false

        if (!mfaSecret.enabled) {
            return false
        }

        val backupCodes = mfaSecret.getBackupCodesList()
        if (backupCodes.contains(backupCode)) {
            // Remove used backup code
            mfaSecret.removeBackupCode(backupCode)
            mfaSecretRepository.save(mfaSecret)
            logger.info("Backup code used for user: $userId")
            return true
        }

        return false
    }

    /**
     * Get MFA status for a user
     */
    @Transactional(readOnly = true)
    fun getMfaStatus(userId: UUID): MfaStatusResponse {
        val mfaSecret = mfaSecretRepository.findByUserId(userId)
            ?: return MfaStatusResponse(enabled = false)

        return MfaStatusResponse(
            enabled = mfaSecret.enabled,
            enabledAt = mfaSecret.enabledAt,
            backupCodesRemaining = mfaSecret.getBackupCodesList().size
        )
    }

    /**
     * Check if MFA is enabled for a user
     */
    @Transactional(readOnly = true)
    fun isMfaEnabled(userId: UUID): Boolean {
        return mfaSecretRepository.existsByUserIdAndEnabledTrue(userId)
    }

    // Private helper methods

    private fun generateSecret(): String {
        val random = SecureRandom()
        val bytes = ByteArray(20)
        random.nextBytes(bytes)
        return base32.encodeAsString(bytes).replace("=", "")
    }

    private fun generateBackupCodes(count: Int = 10): List<String> {
        val random = SecureRandom()
        return (1..count).map {
            val code = random.nextInt(100000000)
            String.format("%08d", code)
        }
    }

    private fun generateQrCodeUrl(accountName: String, secret: String): String {
        return "otpauth://totp/$issuer:$accountName?secret=$secret&issuer=$issuer"
    }

    private fun verifyTotp(secret: String, code: String): Boolean {
        try {
            val currentTime = System.currentTimeMillis() / 1000 / timeStepSeconds

            // Check current time window and adjacent windows for clock skew
            for (i in -window..window) {
                val timeWindow = currentTime + i
                val generatedCode = generateTotp(secret, timeWindow)
                if (generatedCode == code) {
                    return true
                }
            }

            return false
        } catch (e: Exception) {
            logger.error("Error verifying TOTP", e)
            return false
        }
    }

    private fun generateTotp(secret: String, timeWindow: Long): String {
        val decodedKey = base32.decode(secret)
        val data = ByteArray(8)
        
        var value = timeWindow
        for (i in 7 downTo 0) {
            data[i] = value.toByte()
            value = value shr 8
        }

        val secretKey = SecretKeySpec(decodedKey, "HmacSHA1")
        val mac = Mac.getInstance("HmacSHA1")
        mac.init(secretKey)
        val hash = mac.doFinal(data)

        val offset = (hash[hash.size - 1].toInt() and 0xF)
        val binary = ((hash[offset].toInt() and 0x7F) shl 24) or
                    ((hash[offset + 1].toInt() and 0xFF) shl 16) or
                    ((hash[offset + 2].toInt() and 0xFF) shl 8) or
                    (hash[offset + 3].toInt() and 0xFF)

        val otp = binary % 10.0.pow(6.0).toInt()
        return String.format("%06d", otp)
    }
}
