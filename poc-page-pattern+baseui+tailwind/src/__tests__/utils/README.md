# Utility Tests

This folder contains tests for utility functions and helpers.

## Structure

```
utils/
├── tokenManager.test.ts        - Secure token storage tests
└── README.md                   - This file
```

## Pending Tests

- ❌ **tokenManager.test.ts** - Secure token storage and management

**Total: 0 tests (needs implementation)**

## Test Philosophy

Utility tests focus on:
1. **Pure Functions** - Input → Output correctness
2. **Edge Cases** - Boundary conditions, invalid inputs
3. **Security** - Token storage is secure (no XSS exposure)
4. **Persistence** - SessionStorage backup works
5. **Cleanup** - Automatic cleanup on window close

## Testing tokenManager

The tokenManager is critical for security, tests should cover:

```typescript
import * as tokenManager from '../../../utils/tokenManager';

describe('tokenManager', () => {
  beforeEach(() => {
    // Clear tokens before each test
    tokenManager.clearAll();
    sessionStorage.clear();
  });

  describe('setTokens', () => {
    it('stores tokens in memory', () => {
      tokenManager.setTokens('access-token', 'refresh-token', 3600);
      
      expect(tokenManager.getAccessToken()).toBe('access-token');
      expect(tokenManager.getRefreshToken()).toBe('refresh-token');
    });

    it('stores tokens in sessionStorage as backup', () => {
      tokenManager.setTokens('access-token', 'refresh-token', 3600);
      
      const stored = JSON.parse(sessionStorage.getItem('auth_tokens') || '{}');
      expect(stored.accessToken).toBe('access-token');
      expect(stored.refreshToken).toBe('refresh-token');
    });

    it('stores expiration time', () => {
      const now = Date.now();
      tokenManager.setTokens('access', 'refresh', 3600);
      
      const stored = JSON.parse(sessionStorage.getItem('auth_tokens') || '{}');
      expect(stored.expiresAt).toBeGreaterThan(now);
    });
  });

  describe('getAccessToken', () => {
    it('returns null when no token set', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it('returns token from memory', () => {
      tokenManager.setTokens('test-token', 'refresh', 3600);
      expect(tokenManager.getAccessToken()).toBe('test-token');
    });

    it('restores from sessionStorage if memory cleared', () => {
      // Simulate page refresh
      tokenManager.setTokens('access', 'refresh', 3600);
      
      // Simulate memory clear (page reload)
      // Then initialize again (happens in tokenManager initialization)
      
      expect(tokenManager.getAccessToken()).toBe('access');
    });

    it('returns null if token expired', () => {
      tokenManager.setTokens('access', 'refresh', -1); // Expired
      expect(tokenManager.getAccessToken()).toBeNull();
    });
  });

  describe('hasValidTokens', () => {
    it('returns false when no tokens', () => {
      expect(tokenManager.hasValidTokens()).toBe(false);
    });

    it('returns true when valid tokens exist', () => {
      tokenManager.setTokens('access', 'refresh', 3600);
      expect(tokenManager.hasValidTokens()).toBe(true);
    });

    it('returns false when tokens expired', () => {
      tokenManager.setTokens('access', 'refresh', -1);
      expect(tokenManager.hasValidTokens()).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('clears memory tokens', () => {
      tokenManager.setTokens('access', 'refresh', 3600);
      tokenManager.clearAll();
      
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('clears sessionStorage', () => {
      tokenManager.setTokens('access', 'refresh', 3600);
      tokenManager.clearAll();
      
      expect(sessionStorage.getItem('auth_tokens')).toBeNull();
    });
  });

  describe('Security', () => {
    it('tokens not accessible via window object', () => {
      tokenManager.setTokens('secret-token', 'refresh', 3600);
      
      // Token should not be on window object (XSS protection)
      expect((window as any).accessToken).toBeUndefined();
      expect((window as any).authTokens).toBeUndefined();
    });

    it('does not use localStorage (less secure)', () => {
      tokenManager.setTokens('access', 'refresh', 3600);
      
      expect(localStorage.getItem('auth_tokens')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('cleans up on beforeunload event', () => {
      tokenManager.setTokens('access', 'refresh', 3600);
      
      // Simulate window close
      window.dispatchEvent(new Event('beforeunload'));
      
      // Memory should be cleared (sessionStorage kept for refresh)
      // This tests the cleanup listener
    });
  });

  describe('migrateFromLocalStorage', () => {
    it('migrates old localStorage tokens', () => {
      // Simulate old app storing tokens in localStorage
      localStorage.setItem('token', 'old-access-token');
      localStorage.setItem('refreshToken', 'old-refresh-token');
      
      tokenManager.migrateFromLocalStorage();
      
      expect(tokenManager.getAccessToken()).toBe('old-access-token');
      expect(localStorage.getItem('token')).toBeNull(); // Cleaned up
    });

    it('does nothing if no old tokens', () => {
      tokenManager.migrateFromLocalStorage();
      
      expect(tokenManager.getAccessToken()).toBeNull();
    });
  });

  describe('updateAccessToken', () => {
    it('updates only access token', () => {
      tokenManager.setTokens('old-access', 'refresh', 3600);
      tokenManager.updateAccessToken('new-access', 3600);
      
      expect(tokenManager.getAccessToken()).toBe('new-access');
      expect(tokenManager.getRefreshToken()).toBe('refresh'); // Unchanged
    });
  });
});
```

## Priority Tests Needed

### Priority 1: tokenManager.test.ts (CRITICAL)
Tests needed:
- ✅ setTokens() stores in memory
- ✅ setTokens() stores in sessionStorage backup
- ✅ getAccessToken() returns token
- ✅ getAccessToken() returns null when expired
- ✅ hasValidTokens() validates expiration
- ✅ clearAll() clears all storage
- ✅ Security: No XSS exposure (not on window)
- ✅ Security: No localStorage usage
- ✅ migrateFromLocalStorage() one-time migration
- ✅ updateAccessToken() updates only access token
- ✅ Cleanup on beforeunload event

## Running Tests

```bash
# Run all utility tests (when implemented)
npm test -- __tests__/utils

# Run specific test
npm test -- tokenManager.test.ts

# Run in watch mode
npm test -- __tests__/utils --watch
```

## Test Coverage Target

Utility tests should aim for:
- **100% code coverage** - All functions tested
- **Security validation** - Ensure XSS protection works
- **Edge cases** - Expired tokens, null values, invalid inputs
- **Persistence** - SessionStorage works correctly

## Adding New Utility Tests

1. Create test file in this folder
2. Import utility from `../../../utils/utilityName`
3. Test all exported functions
4. Test edge cases and error handling
5. If security-related, test for vulnerabilities
6. Verify browser API integration (sessionStorage, etc.)

## Dependencies

- `jest` - Test runner
- `@testing-library/react` - If testing with React context
- `jest-localstorage-mock` - Mock localStorage/sessionStorage
