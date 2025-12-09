package com.allcode.graphql.config

import com.allcode.graphql.dataloader.StorageInfoDataLoader
import io.mockk.mockk
import org.dataloader.DataLoaderRegistry
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class DataLoaderConfigTest {

    private val config = DataLoaderConfig()
    private val storageInfoDataLoader = mockk<StorageInfoDataLoader>()

    @Test
    fun `should create dataloader registrar`() {
        val registrar = config.dataLoaderRegistrar(storageInfoDataLoader)
        
        assertNotNull(registrar)
    }

    @Test
    fun `should register storage info dataloader`() {
        val registrar = config.dataLoaderRegistrar(storageInfoDataLoader)
        val registry = DataLoaderRegistry()
        
        registrar.registerDataLoaders(registry, mockk())
        
        assertTrue(registry.keys.contains("storageInfo"))
    }
}