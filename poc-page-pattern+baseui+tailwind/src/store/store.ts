/**
 * Redux Store Configuration
 * Combines all slices and RTK Query API
 */

import { configureStore } from '@reduxjs/toolkit';
import { graphqlApi } from './graphqlApi';
import { spacexApi } from '../graphql/spacex';
import authReducer from './slices/authSlice';
import filesReducer from './slices/filesSlice';
import mfaReducer from './slices/mfaSlice';

/**
 * Configure Redux store with all reducers and middleware
 */
export const store = configureStore({
  reducer: {
    // RTK Query API reducers
    [graphqlApi.reducerPath]: graphqlApi.reducer,
    [spacexApi.reducerPath]: spacexApi.reducer,
    
    // Feature slices
    auth: authReducer,
    files: filesReducer,
    mfa: mfaReducer,
  },
  // Add RTK Query middleware for caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(graphqlApi.middleware, spacexApi.middleware),
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
