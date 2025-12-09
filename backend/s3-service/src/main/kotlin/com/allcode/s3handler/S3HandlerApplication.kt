package com.allcode.s3handler

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching
import org.springframework.scheduling.annotation.EnableAsync

@SpringBootApplication
@EnableCaching
@EnableAsync
class S3HandlerApplication

fun main(args: Array<String>) {
    runApplication<S3HandlerApplication>(*args)
}