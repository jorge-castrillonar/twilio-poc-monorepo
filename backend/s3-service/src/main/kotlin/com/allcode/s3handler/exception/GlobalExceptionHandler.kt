package com.allcode.s3handler.exception

import com.allcode.s3handler.dto.ErrorResponse
import com.allcode.s3handler.util.LogSanitizer
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import software.amazon.awssdk.services.s3.model.S3Exception
import java.time.LocalDateTime
import java.util.*

@RestControllerAdvice
class GlobalExceptionHandler(
    private val logSanitizer: LogSanitizer
) {
    
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(
        ex: MethodArgumentNotValidException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.allErrors.associate { error ->
            val fieldName = (error as FieldError).field
            fieldName to (error.defaultMessage ?: "Invalid value")
        }
        
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Validation Failed",
            message = "Request validation failed",
            path = request.getDescription(false).removePrefix("uri="),
            details = errors
        )
        
        logger.warn("Validation error: {}", logSanitizer.sanitize(errors.toString()))
        return ResponseEntity.badRequest().body(errorResponse)
    }

    @ExceptionHandler(S3Exception::class)
    fun handleS3Exception(
        ex: S3Exception,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val status = when (ex.statusCode()) {
            404 -> HttpStatus.NOT_FOUND
            403 -> HttpStatus.FORBIDDEN
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = status.value(),
            error = "S3 Operation Failed",
            message = "File operation failed",
            path = request.getDescription(false).removePrefix("uri=")
        )
        
        logger.error("S3 operation failed: {}", logSanitizer.sanitize(ex.message))
        return ResponseEntity.status(status).body(errorResponse)
    }



    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorId = UUID.randomUUID().toString()
        
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = "Internal Server Error",
            message = "An unexpected error occurred",
            path = request.getDescription(false).removePrefix("uri="),
            errorId = errorId
        )
        
        logger.error("Unexpected error [{}]: {}", errorId, logSanitizer.sanitize(ex.message), ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}