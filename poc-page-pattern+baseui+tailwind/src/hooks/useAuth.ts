/**
 * useAuth Hook  
 * Centralized authentication hook with automatic token refresh
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateTokens } from '../store/slices/authSlice';
import { useRefreshTokenMutation } from '../store/graphqlApi';
import { tokenManager } from '../utils/tokenManager';
import { ROUTES } from '../constants';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      console.log('Token refresh already in progress');
      return false;
    }

    setIsRefreshing(true);

    try {
      const currentRefreshToken = tokenManager.getRefreshToken();
      
      if (!currentRefreshToken) {
        console.error('No refresh token available');
        return false;
      }

      const result = await refreshTokenMutation({ refreshToken: currentRefreshToken }).unwrap();
      const expiresAt = Date.now() + (result.expiresIn * 1000);

      tokenManager.setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
        expiresAt,
      });

      dispatch(updateTokens({
        token: result.accessToken,
        refreshToken: result.refreshToken,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      tokenManager.clearAll();
      dispatch(logout());
      navigate(ROUTES.LOGIN, { replace: true });
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTokenMutation, dispatch, navigate, isRefreshing]);

  /**
   * Ensure the access token is valid, refreshing if needed
   * @returns true if token is valid, false if refresh failed
   */
  const ensureValidToken = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    // Check if token needs refresh
    if (tokenManager.needsRefresh()) {
      console.log('Token needs refresh, refreshing...');
      return await refreshTokens();
    }

    return true;
  }, [isAuthenticated, refreshTokens]);

  /**
   * Schedule automatic token refresh before expiration
   */
  const scheduleTokenRefresh = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!isAuthenticated || !tokenManager.hasValidTokens()) {
      return;
    }

    const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
    
    // If no expiry time, don't schedule refresh
    if (timeUntilExpiry === null || timeUntilExpiry <= 0) {
      return;
    }
    
    // Refresh 2 minutes before expiration or at half the remaining time (whichever is sooner)
    const twoMinutes = 2 * 60 * 1000;
    const refreshTime = Math.max(
      timeUntilExpiry - twoMinutes,
      Math.floor(timeUntilExpiry / 2)
    );

    console.log(`[useAuth] Scheduling token refresh in ${Math.floor(refreshTime / 1000)}s`);

    refreshTimerRef.current = setTimeout(() => {
      console.log('[useAuth] Auto-refreshing token...');
      refreshTokens().then((success) => {
        if (success) {
          // Schedule next refresh
          scheduleTokenRefresh();
        }
      });
    }, refreshTime);
  }, [isAuthenticated, refreshTokens]);

  /**
   * Handle logout with cleanup
   */
  const handleLogout = useCallback(() => {
    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Clear tokens
    tokenManager.clearAll();
    
    // Dispatch logout
    dispatch(logout());
    
    // Navigate to login
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  // Initialize auto-refresh on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated && tokenManager.hasValidTokens()) {
      scheduleTokenRefresh();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, scheduleTokenRefresh]);

  return {
    isAuthenticated,
    user,
    logout: handleLogout,
    refreshTokens,
    ensureValidToken,
    isRefreshing,
  };
}
