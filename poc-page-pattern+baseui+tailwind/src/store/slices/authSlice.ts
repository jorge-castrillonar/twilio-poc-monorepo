/**
 * Auth Slice - Manages authentication state with secure token storage
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { graphqlApi } from '../graphqlApi';
import { tokenManager } from '../../utils/tokenManager';
import { STORAGE_KEYS } from '../../constants';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  mfaEnabled: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Try to restore user from sessionStorage on initialization
const restoreUser = (): User | null => {
  try {
    const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  token: tokenManager.getAccessToken(),
  refreshToken: tokenManager.getRefreshToken(),
  user: restoreUser(),
  isAuthenticated: tokenManager.hasValidTokens(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Clear secure token storage
      tokenManager.clearAll();
      
      // Clear session user data
      try {
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } catch (error) {
        console.error('Failed to clear user data:', error);
      }
      
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string;
        user: User;
      }>
    ) => {
      // Store tokens securely
      tokenManager.setTokens({
        accessToken: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenType: 'Bearer',
      });
      
      // Store user data in sessionStorage (not sensitive)
      try {
        sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload.user));
      } catch (error) {
        console.error('Failed to store user data:', error);
      }
      
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      // Update tokens in state (tokenManager should already be updated)
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    // Handle login success from RTK Query
    builder.addMatcher(
      graphqlApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        // Store tokens securely
        tokenManager.setTokens({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          tokenType: payload.tokenType || 'Bearer',
        });
        
        // Store user data in sessionStorage
        try {
          sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(payload.user));
        } catch (error) {
          console.error('Failed to store user data:', error);
        }
        
        state.token = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.user = payload.user;
        state.isAuthenticated = true;
      }
    );
  },
});

export const { logout, setCredentials, updateTokens } = authSlice.actions;
export default authSlice.reducer;
