package com.allcode.graphql.exception

import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter
import org.springframework.graphql.execution.ErrorType
import org.springframework.stereotype.Component

@Component
class GraphQLExceptionHandler : DataFetcherExceptionResolverAdapter() {

    override fun resolveToSingleError(ex: Throwable, env: DataFetchingEnvironment): GraphQLError? {
        return when (ex) {
            is IllegalArgumentException -> GraphqlErrorBuilder.newError()
                .errorType(ErrorType.BAD_REQUEST)
                .message("Invalid input: ${ex.message}")
                .path(env.executionStepInfo.path)
                .location(env.field.sourceLocation)
                .build()
                
            is SecurityException -> GraphqlErrorBuilder.newError()
                .errorType(ErrorType.UNAUTHORIZED)
                .message("Access denied")
                .path(env.executionStepInfo.path)
                .location(env.field.sourceLocation)
                .build()
                
            else -> GraphqlErrorBuilder.newError()
                .errorType(ErrorType.INTERNAL_ERROR)
                .message("Internal server error")
                .path(env.executionStepInfo.path)
                .location(env.field.sourceLocation)
                .build()
        }
    }
}