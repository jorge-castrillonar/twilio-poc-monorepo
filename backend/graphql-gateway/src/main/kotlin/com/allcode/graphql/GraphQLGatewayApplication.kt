package com.allcode.graphql

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class GraphQLGatewayApplication

fun main(args: Array<String>) {
    runApplication<GraphQLGatewayApplication>(*args)
}