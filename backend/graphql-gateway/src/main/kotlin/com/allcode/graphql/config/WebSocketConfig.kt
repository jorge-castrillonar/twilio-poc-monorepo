package com.allcode.graphql.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.CloseStatus

@Configuration
@EnableWebSocket
class WebSocketConfig : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(GraphQLWebSocketHandler(), "/graphql-ws")
            .setAllowedOrigins("*") // Configure appropriately for production
    }
}

class GraphQLWebSocketHandler : WebSocketHandler {
    
    override fun afterConnectionEstablished(session: WebSocketSession) {
        // Handle WebSocket connection establishment for GraphQL subscriptions
    }

    override fun handleMessage(session: WebSocketSession, message: org.springframework.web.socket.WebSocketMessage<*>) {
        // Handle GraphQL subscription messages
        if (message is TextMessage) {
            // Process GraphQL subscription protocol messages
        }
    }

    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        // Handle transport errors
    }

    override fun afterConnectionClosed(session: WebSocketSession, closeStatus: CloseStatus) {
        // Clean up after connection closes
    }

    override fun supportsPartialMessages(): Boolean = false
}