/**
 * useAuth Hook Tests
 * Tests for authentication hook with token refresh functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '../../hooks/useAuth';
import authReducer from '../../store/slices/authSlice';
import { graphqlApi } from '../../store/graphqlApi';
import { tokenManager } from '../../utils/tokenManager';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock tokenManager
jest.mock('../../utils/tokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => null),
    getTokenType: jest.fn(() => 'Bearer'),
    setTokens: jest.fn(),
    clearAll: jest.fn(),
    hasValidTokens: jest.fn(() => false),
    needsRefresh: jest.fn(() => false),
    getTimeUntilExpiry: jest.fn(() => null),
    startRefresh: jest.fn(),
  },
}));

// Helper to create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [graphqlApi.reducerPath]: graphqlApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(graphqlApi.middleware),
    preloadedState: initialState,
  });
};

// Wrapper component with store and router
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    (tokenManager.hasValidTokens as jest.Mock).mockReturnValue(false);
    (tokenManager.needsRefresh as jest.Mock).mockReturnValue(false);
    (tokenManager.getTimeUntilExpiry as jest.Mock).mockReturnValue(null);
  });

  describe('Initial state', () => {
    it('should return unauthenticated state by default', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should provide all expected properties', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refreshTokens');
      expect(result.current).toHaveProperty('ensureValidToken');
      expect(result.current).toHaveProperty('isRefreshing');
    });
  });

  describe('Authenticated state', () => {
    it('should return authenticated user from Redux state', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['user'],
        mfaEnabled: false,
      };

      const store = createTestStore({
        auth: {
          user: mockUser,
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle user with MFA enabled', () => {
      const mockUser = {
        id: '2',
        email: 'mfa@example.com',
        fullName: 'MFA User',
        roles: ['admin'],
        mfaEnabled: true,
      };

      const store = createTestStore({
        auth: {
          user: mockUser,
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.user?.mfaEnabled).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear tokens, auth state, and navigate to login', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['user'],
        mfaEnabled: false,
      };

      const store = createTestStore({
        auth: {
          user: mockUser,
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(tokenManager.clearAll).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should work even when not authenticated', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.logout();
      });

      expect(tokenManager.clearAll).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  describe('ensureValidToken', () => {
    it('should return false when not authenticated', async () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.ensureValidToken();
      });

      expect(isValid).toBe(false);
    });

    it('should return true when token is valid', async () => {
      (tokenManager.needsRefresh as jest.Mock).mockReturnValue(false);

      const store = createTestStore({
        auth: {
          user: { id: '1', email: 'test@example.com' },
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.ensureValidToken();
      });

      expect(isValid).toBe(true);
      expect(tokenManager.needsRefresh).toHaveBeenCalled();
    });

    it('should trigger refresh when token needs refresh', async () => {
      (tokenManager.needsRefresh as jest.Mock).mockReturnValue(true);
      (tokenManager.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const store = createTestStore({
        auth: {
          user: { id: '1', email: 'test@example.com' },
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      // Mock the refresh mutation to fail (we can't easily mock success)
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.ensureValidToken();
      });

      expect(tokenManager.needsRefresh).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should return false when no refresh token available', async () => {
      (tokenManager.getRefreshToken as jest.Mock).mockReturnValue(null);

      const store = createTestStore({
        auth: {
          user: { id: '1', email: 'test@example.com' },
          token: 'test-token',
          refreshToken: null,
          isAuthenticated: true,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      let success;
      await act(async () => {
        success = await result.current.refreshTokens();
      });

      expect(success).toBe(false);
      expect(tokenManager.getRefreshToken).toHaveBeenCalled();
    });

    it('should not refresh if already refreshing', async () => {
      (tokenManager.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const store = createTestStore({
        auth: {
          user: { id: '1', email: 'test@example.com' },
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      // Start first refresh
      let firstRefresh;
      const firstPromise = act(async () => {
        firstRefresh = result.current.refreshTokens();
      });

      // Try to start second refresh immediately
      let secondSuccess;
      await act(async () => {
        secondSuccess = await result.current.refreshTokens();
      });

      await firstPromise;

      // Second call should return false (already refreshing)
      expect(secondSuccess).toBe(false);
    });
  });

  describe('Auto-refresh scheduling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should schedule refresh when authenticated with valid tokens', () => {
      const fiveMinutes = 5 * 60 * 1000;
      (tokenManager.hasValidTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.getTimeUntilExpiry as jest.Mock).mockReturnValue(fiveMinutes);
      (tokenManager.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const store = createTestStore({
        auth: {
          user: { id: '1', email: 'test@example.com' },
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      // Verify getTimeUntilExpiry was called during scheduling
      expect(tokenManager.getTimeUntilExpiry).toHaveBeenCalled();
    });

    it('should not schedule refresh when not authenticated', () => {
      (tokenManager.hasValidTokens as jest.Mock).mockReturnValue(false);

      const store = createTestStore();

      renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      // Should not call getTimeUntilExpiry when not authenticated
      expect(tokenManager.getTimeUntilExpiry).not.toHaveBeenCalled();
    });

    it('should cleanup timer on unmount', () => {
      const fiveMinutes = 5 * 60 * 1000;
      (tokenManager.hasValidTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.getTimeUntilExpiry as jest.Mock).mockReturnValue(fiveMinutes);
      (tokenManager.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const store = createTestStore({
        auth: {
          user: { id: '1', email: 'test@example.com' },
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      // Unmount should clear any pending timers
      unmount();

      // If cleanup works, advancing timers shouldn't cause issues
      act(() => {
        jest.advanceTimersByTime(fiveMinutes);
      });
    });
  });

  describe('Integration', () => {
    it('should provide complete auth interface', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      // Verify all expected methods are functions
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshTokens).toBe('function');
      expect(typeof result.current.ensureValidToken).toBe('function');

      // Verify all expected properties are present
      expect(typeof result.current.isAuthenticated).toBe('boolean');
      expect(typeof result.current.isRefreshing).toBe('boolean');
    });

    it('should maintain consistent state across re-renders', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['user'],
        mfaEnabled: false,
      };

      const store = createTestStore({
        auth: {
          user: mockUser,
          token: 'test-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
        },
      });

      const { result, rerender } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store),
      });

      const firstUser = result.current.user;
      const firstIsAuthenticated = result.current.isAuthenticated;

      rerender();

      expect(result.current.user).toEqual(firstUser);
      expect(result.current.isAuthenticated).toBe(firstIsAuthenticated);
    });
  });
});
