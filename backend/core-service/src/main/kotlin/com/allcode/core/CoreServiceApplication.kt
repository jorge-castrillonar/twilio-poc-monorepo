package com.allcode.core

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.jms.annotation.EnableJms

@SpringBootApplication
@EnableJms
class CoreServiceApplication

fun main(args: Array<String>) {
    runApplication<CoreServiceApplication>(*args)
}