import type { Decorator } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/store/slices/authSlice';
import mfaReducer from '../src/store/slices/mfaSlice';
import filesReducer from '../src/store/slices/filesSlice';
import { graphqlApi } from '../src/store/graphqlApi';

// Create a mock store for Storybook
const createMockStore = () => configureStore({
  reducer: {
    auth: authReducer,
    mfa: mfaReducer,
    files: filesReducer,
    [graphqlApi.reducerPath]: graphqlApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(graphqlApi.middleware),
  preloadedState: {
    auth: {
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'user@example.com',
        fullName: 'Test User',
        roles: ['user'],
        mfaEnabled: false,
      },
      isAuthenticated: true,
    },
  },
});

export const withReduxProvider: Decorator = (Story) => {
  const store = createMockStore();
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};
