package com.allcode.graphql.config

import graphql.scalars.ExtendedScalars
import graphql.schema.Coercing
import graphql.schema.CoercingParseLiteralException
import graphql.schema.CoercingParseValueException
import graphql.schema.CoercingSerializeException
import graphql.schema.GraphQLScalarType
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.graphql.execution.RuntimeWiringConfigurer
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@Configuration
class GraphQLConfig {

    @Bean
    fun runtimeWiringConfigurer(): RuntimeWiringConfigurer {
        return RuntimeWiringConfigurer { wiringBuilder ->
            wiringBuilder.scalar(instantDateTimeScalar())
        }
    }

    private fun instantDateTimeScalar(): GraphQLScalarType {
        return GraphQLScalarType.newScalar()
            .name("DateTime")
            .description("DateTime scalar that handles both Instant and OffsetDateTime")
            .coercing(object : Coercing<Any, String> {
                override fun serialize(dataFetcherResult: Any): String {
                    return when (dataFetcherResult) {
                        is Instant -> dataFetcherResult.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                        is OffsetDateTime -> dataFetcherResult.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                        is String -> dataFetcherResult
                        else -> throw CoercingSerializeException("Expected Instant or OffsetDateTime but got ${dataFetcherResult::class.simpleName}")
                    }
                }

                override fun parseValue(input: Any): Instant {
                    return when (input) {
                        is String -> Instant.parse(input)
                        is Instant -> input
                        else -> throw CoercingParseValueException("Expected String but got ${input::class.simpleName}")
                    }
                }

                override fun parseLiteral(input: Any): Instant {
                    if (input is String) {
                        return Instant.parse(input)
                    }
                    throw CoercingParseLiteralException("Expected String but got ${input::class.simpleName}")
                }
            })
            .build()
    }
}