package com.allcode.s3handler.config

import org.apache.activemq.ActiveMQConnectionFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jms.annotation.EnableJms
import org.springframework.jms.config.DefaultJmsListenerContainerFactory
import org.springframework.jms.core.JmsTemplate
import jakarta.jms.ConnectionFactory

@Configuration
@EnableJms
class JmsConfig {

    @Value("\${activemq.broker.url}")
    private lateinit var brokerUrl: String

    @Bean
    fun connectionFactory(): ConnectionFactory {
        return ActiveMQConnectionFactory(brokerUrl)
    }

    @Bean
    fun jmsListenerContainerFactory(): DefaultJmsListenerContainerFactory {
        val factory = DefaultJmsListenerContainerFactory()
        factory.setConnectionFactory(connectionFactory())
        factory.setConcurrency("1-1")
        return factory
    }

    @Bean
    fun jmsTemplate(): JmsTemplate {
        return JmsTemplate(connectionFactory())
    }
}