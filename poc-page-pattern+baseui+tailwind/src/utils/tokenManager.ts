import { STORAGE_KEYS, TOKEN_EXPIRY_DEFAULT } from '../constants';

/**
 * Secure Token Manager
 * 
 * Security Strategy:
 * 1. Tokens stored in memory (RAM) during session - not accessible to XSS
 * 2. SessionStorage as backup only for page refresh - cleared on tab close
 * 3. Automatic token cleanup on logout or session end
 * 4. Token rotation support for refresh tokens
 * 5. No localStorage - reduces XSS attack surface
 * 
 * Security Benefits:
 * - Memory storage: XSS cannot access (no document.cookie, no localStorage)
 * - SessionStorage: Only survives page refresh, cleared on tab close
 * - Automatic cleanup: Tokens wiped on logout/close
 * - HTTPS only: Should be used with HTTPS in production
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt?: number;
}

class SecureTokenManager {
  // Primary storage: in-memory (most secure)
  private tokens: TokenData | null = null;

  // Refresh lock to prevent concurrent refresh attempts
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Callbacks to notify when refresh completes
  private refreshCallbacks: Array<(success: boolean) => void> = [];

  // Session storage keys (backup for page refresh only)
  private readonly ACCESS_TOKEN_KEY = STORAGE_KEYS.ACCESS_TOKEN;
  private readonly REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN;
  private readonly TOKEN_TYPE_KEY = STORAGE_KEYS.TOKEN_TYPE;
  private readonly EXPIRES_AT_KEY = STORAGE_KEYS.EXPIRES_AT;

  constructor() {
    // Restore tokens from sessionStorage on page load (if exists)
    this.restoreFromSession();

    // Clear all tokens when window closes or user navigates away
    window.addEventListener('beforeunload', () => {
      this.clearMemory();
    });

    // Clear tokens when tab becomes hidden (security measure)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Optional: clear memory when tab is hidden (paranoid mode)
        // this.clearMemory();
      }
    });
  }

  /**
   * Store tokens securely
   * Priority: Memory first, sessionStorage as backup
   */
  setTokens(tokens: TokenData): void {
    // Store in memory (primary)
    this.tokens = {
      ...tokens,
      expiresAt: tokens.expiresAt || Date.now() + TOKEN_EXPIRY_DEFAULT,
    };

    // Backup to sessionStorage (only for page refresh)
    // SessionStorage is cleared when tab closes
    try {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      sessionStorage.setItem(this.TOKEN_TYPE_KEY, tokens.tokenType);
      if (tokens.expiresAt) {
        sessionStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt.toString());
      }
    } catch (error) {
      console.error('Failed to store tokens in sessionStorage:', error);
    }
  }

  /**
   * Get access token
   * Checks expiration and returns null if expired
   */
  getAccessToken(): string | null {
    if (!this.tokens) {
      return null;
    }

    // Check if token is expired
    if (this.tokens.expiresAt && Date.now() >= this.tokens.expiresAt) {
      console.warn('Access token expired');
      this.clearAll();
      return null;
    }

    return this.tokens.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.tokens?.refreshToken || null;
  }

  /**
   * Get token type (usually "Bearer")
   */
  getTokenType(): string {
    return this.tokens?.tokenType || 'Bearer';
  }

  /**
   * Check if user has valid tokens
   */
  hasValidTokens(): boolean {
    if (!this.tokens) {
      return false;
    }

    // Check expiration
    if (this.tokens.expiresAt && Date.now() >= this.tokens.expiresAt) {
      return false;
    }

    return !!this.tokens.accessToken;
  }

  /**
   * Clear all tokens (logout)
   */
  clearAll(): void {
    this.clearMemory();
    this.clearSessionStorage();
  }

  /**
   * Clear memory storage
   */
  private clearMemory(): void {
    this.tokens = null;
  }

  /**
   * Clear sessionStorage
   */
  private clearSessionStorage(): void {
    try {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_TYPE_KEY);
      sessionStorage.removeItem(this.EXPIRES_AT_KEY);
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  /**
   * Restore tokens from sessionStorage (on page refresh)
   */
  private restoreFromSession(): void {
    try {
      const accessToken = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
      const refreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
      const tokenType = sessionStorage.getItem(this.TOKEN_TYPE_KEY);
      const expiresAt = sessionStorage.getItem(this.EXPIRES_AT_KEY);

      if (accessToken && refreshToken && tokenType) {
        this.tokens = {
          accessToken,
          refreshToken,
          tokenType,
          expiresAt: expiresAt ? parseInt(expiresAt, 10) : undefined,
        };

        // Check if restored token is expired
        if (!this.hasValidTokens()) {
          console.warn('Restored token is expired, clearing...');
          this.clearAll();
        }
      }
    } catch (error) {
      console.error('Failed to restore tokens from sessionStorage:', error);
    }
  }

  /**
   * Update access token (for token refresh)
   */
  updateAccessToken(accessToken: string, expiresAt?: number): void {
    if (this.tokens) {
      this.tokens.accessToken = accessToken;
      this.tokens.expiresAt = expiresAt || Date.now() + 3600000;

      // Update sessionStorage
      try {
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        if (expiresAt) {
          sessionStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
        }
      } catch (error) {
        console.error('Failed to update token in sessionStorage:', error);
      }
    }
  }

  /**
   * Get token expiration time
   */
  getExpiresAt(): number | null {
    return this.tokens?.expiresAt || null;
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  willExpireSoon(): boolean {
    if (!this.tokens?.expiresAt) {
      return false;
    }

    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= this.tokens.expiresAt - fiveMinutes;
  }

  /**
   * Start token refresh
   * Returns a promise that resolves when refresh completes
   * Prevents concurrent refresh attempts
   */
  async startRefresh(refreshFn: () => Promise<TokenData>): Promise<boolean> {
    // If already refreshing, wait for existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start new refresh
    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh(refreshFn);

    return this.refreshPromise;
  }

  /**
   * Perform the actual token refresh
   */
  private async _performRefresh(refreshFn: () => Promise<TokenData>): Promise<boolean> {
    try {
      const newTokens = await refreshFn();
      
      this.setTokens(newTokens);
      this._notifyRefreshComplete(true);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAll();
      this._notifyRefreshComplete(false);
      
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Register callback to be notified when refresh completes
   */
  onRefreshComplete(callback: (success: boolean) => void): void {
    this.refreshCallbacks.push(callback);
  }

  /**
   * Notify all callbacks that refresh completed
   */
  private _notifyRefreshComplete(success: boolean): void {
    this.refreshCallbacks.forEach(callback => {
      try {
        callback(success);
      } catch (error) {
        console.error('Refresh callback error:', error);
      }
    });
    this.refreshCallbacks = [];
  }

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiry(): number | null {
    if (!this.tokens?.expiresAt) {
      return null;
    }

    return Math.max(0, this.tokens.expiresAt - Date.now());
  }

  /**
   * Check if token needs refresh (expired or expiring soon)
   */
  needsRefresh(): boolean {
    return !this.hasValidTokens() || this.willExpireSoon();
  }
}

// Singleton instance
export const tokenManager = new SecureTokenManager();

/**
 * Legacy localStorage migration helper
 * Call this once on app initialization to migrate old tokens
 */
export function migrateFromLocalStorage(): void {
  try {
    const oldToken = localStorage.getItem('authToken');
    const oldRefreshToken = localStorage.getItem('refreshToken');
    
    if (oldToken) {
      console.warn('Migrating tokens from localStorage to secure storage...');
      
      tokenManager.setTokens({
        accessToken: oldToken,
        refreshToken: oldRefreshToken || '',
        tokenType: 'Bearer',
      });

      // Remove from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      console.log('Migration complete. Old tokens removed from localStorage.');
    }
  } catch (error) {
    console.error('Failed to migrate tokens:', error);
  }
}
