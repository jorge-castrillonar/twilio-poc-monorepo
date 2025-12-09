package com.allcode.users.config

import org.apache.activemq.ActiveMQConnectionFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jms.annotation.EnableJms
import org.springframework.jms.config.DefaultJmsListenerContainerFactory
import org.springframework.jms.core.JmsTemplate
import org.springframework.jms.support.converter.MessageConverter
import org.springframework.jms.support.converter.SimpleMessageConverter

@Configuration
@EnableJms
class JmsConfig {

    @Value("\${spring.activemq.broker-url}")
    private lateinit var brokerUrl: String

    @Value("\${spring.activemq.user}")
    private lateinit var username: String

    @Value("\${spring.activemq.password}")
    private lateinit var password: String

    @Bean
    fun connectionFactory(): ActiveMQConnectionFactory {
        return ActiveMQConnectionFactory().apply {
            brokerURL = brokerUrl
            userName = username
            setPassword(password)
        }
    }

    @Bean
    fun messageConverter(): MessageConverter {
        return SimpleMessageConverter()
    }

    @Bean
    fun jmsTemplate(): JmsTemplate {
        return JmsTemplate(connectionFactory()).apply {
            messageConverter = messageConverter()
            isPubSubDomain = false // For queues
        }
    }

    @Bean
    fun jmsListenerContainerFactory(): DefaultJmsListenerContainerFactory {
        return DefaultJmsListenerContainerFactory().apply {
            setConnectionFactory(connectionFactory())
            setMessageConverter(messageConverter())
            setPubSubDomain(false) // For queues
        }
    }
}
