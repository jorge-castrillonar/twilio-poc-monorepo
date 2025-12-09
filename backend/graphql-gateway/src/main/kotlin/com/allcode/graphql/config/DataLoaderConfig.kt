package com.allcode.graphql.config

import com.allcode.graphql.dataloader.StorageInfoDataLoader
import org.dataloader.DataLoaderRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.graphql.execution.DataLoaderRegistrar

@Configuration
class DataLoaderConfig {

    @Bean
    fun dataLoaderRegistrar(storageInfoDataLoader: StorageInfoDataLoader): DataLoaderRegistrar {
        return DataLoaderRegistrar { registry: DataLoaderRegistry, _ ->
            registry.register("storageInfo", storageInfoDataLoader.createDataLoader())
        }
    }
}