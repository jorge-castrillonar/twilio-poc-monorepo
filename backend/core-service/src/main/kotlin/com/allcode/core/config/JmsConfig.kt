package com.allcode.core.config

import org.apache.activemq.ActiveMQConnectionFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jms.core.JmsTemplate

@Configuration
class JmsConfig {

    @Value("\${activemq.broker-url:tcp://localhost:61616}")
    private lateinit var brokerUrl: String

    @Bean
    fun connectionFactory(): ActiveMQConnectionFactory {
        return ActiveMQConnectionFactory(brokerUrl)
    }

    @Bean
    fun jmsTemplate(): JmsTemplate {
        return JmsTemplate(connectionFactory())
    }
}