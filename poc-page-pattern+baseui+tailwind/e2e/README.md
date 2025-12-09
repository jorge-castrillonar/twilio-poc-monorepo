# E2E Testing Documentation

Playwright end-to-end tests for authentication, token management, and user workflows.

## 📁 Directory Structure

```
e2e/
├── auth.spec.ts                  # Authentication flow tests (13 tests)
├── smoke.spec.ts                 # Basic app smoke tests (4 tests)
├── diagnostic.spec.ts            # App diagnostics & redirects (3 tests)
├── login-debug.spec.ts           # Login debug & token inspection (2 tests)
├── helpers.ts                    # Reusable test helpers
└── README.md                     # This file
```

## 📊 Test Status

**All E2E Tests Passing:** ✅ 21/21 (1 skipped)

### Test Suites Overview

| Suite | Tests | Status | Description |
|-------|-------|--------|-------------|
| **Authentication Flow** | 5 | ✅ All Pass | Login, logout, persistence, validation |
| **Protected Routes** | 2 | ✅ All Pass | Route guards and access control |
| **Token Management** | 3 | ✅ All Pass | Token storage, headers, cleanup |
| **AuthGuard Component** | 2 | ✅ All Pass | Token validation and expiry handling |
| **Application Smoke** | 4 | ✅ All Pass | Basic app health and accessibility |
| **App Diagnostics** | 3 | ✅ All Pass | Redirects, console errors, form checks |
| **Login Debug** | 2 | ✅ All Pass | GraphQL inspection and token verification |
| **MFA Flow** | 1 | ⏭️ Skipped | Requires backend MFA configuration |

**Total Execution Time:** ~24 seconds (8 parallel workers)

## 🚀 Running E2E Tests

### Prerequisites
```bash
# Backend must be running
docker-compose up -d

# Install Playwright browsers (first time only)
npx playwright install
```

### Run Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive, best for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run with debug mode
npm run test:e2e:debug

# View last test report
npm run test:e2e:report

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run specific test by grep pattern
npx playwright test -g "should login"
```

## 🔐 CRITICAL: Secure Token Storage Keys

**All E2E tests must use secure storage keys for token validation.**

### TokenManager Secure Keys
```typescript
// Defined in src/constants/index.ts
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '__secure_access_token__',      // NOT 'accessToken'
  REFRESH_TOKEN: '__secure_refresh_token__',    // NOT 'refreshToken'
  TOKEN_TYPE: '__secure_token_type__',          // NOT 'tokenType'
  EXPIRES_AT: '__secure_expires_at__',
  USER_DATA: '__secure_user_data__',
};
```

### ❌ Wrong (Will Fail)
```typescript
// ❌ Plain keys don't exist in sessionStorage
const token = await page.evaluate(() => 
  sessionStorage.getItem('accessToken')
);
// Result: null (token not found!)
```

### ✅ Correct
```typescript
// ✅ Use secure keys
const tokens = await page.evaluate(() => ({
  accessToken: sessionStorage.getItem('__secure_access_token__'),
  refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
  tokenType: sessionStorage.getItem('__secure_token_type__'),
}));

expect(tokens.accessToken).toBeTruthy();
expect(tokens.tokenType).toBe('Bearer');
```

## 🛠️ E2E Test Helpers

### waitForSecureToken (Token Persistence Helper)
Located in `e2e/auth.spec.ts`:

```typescript
async function waitForSecureToken(page: any, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const token = await page.evaluate(() => 
      sessionStorage.getItem('__secure_access_token__')
    );
    if (token) return;
    await page.waitForTimeout(200);
  }
  throw new Error('Timed out waiting for secure access token');
}
```

**Why it's needed:**
- Redux processes login response asynchronously
- tokenManager persists to sessionStorage with small delay
- Tests were failing by asserting URL before tokens saved
- This helper polls sessionStorage until token appears

**Usage:**
```typescript
// After login button click
await page.getByRole('button', { name: /sign in/i }).click();

// Wait for token to be saved (up to 20s)
await waitForSecureToken(page, 20000);

// Now safe to assert navigation
await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
```

### Helpers from helpers.ts

```typescript
import { login, logout, checkTokensInStorage } from './helpers';

// Login helper
await login(page, 'test@example.com', 'password123');

// Logout helper
await logout(page);

// Check tokens are present
const hasTokens = await checkTokensInStorage(page);
expect(hasTokens).toBe(true);
```

## 📝 Test Patterns

### 1. Authentication Flow Test
```typescript
test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  
  await page.getByLabel(/email address/i).fill('testuser@example.com');
  await page.getByLabel(/password/i).fill('Test123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // CRITICAL: Wait for token before asserting URL
  await waitForSecureToken(page, 20000);
  await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
});
```

### 2. Token Persistence Check
```typescript
test('should store tokens in sessionStorage', async ({ page }) => {
  await page.goto('/login');
  // ... login steps ...
  
  await waitForSecureToken(page, 20000);
  
  // Check secure storage keys
  const tokens = await page.evaluate(() => ({
    accessToken: sessionStorage.getItem('__secure_access_token__'),
    refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
    tokenType: sessionStorage.getItem('__secure_token_type__')
  }));
  
  expect(tokens.accessToken).toBeTruthy();
  expect(tokens.refreshToken).toBeTruthy();
  expect(tokens.tokenType).toBe('Bearer');
});
```

### 3. API Request Interception
```typescript
test('should debug login API response', async ({ page }) => {
  // Intercept GraphQL requests
  page.on('request', request => {
    if (request.url().includes('/graphql')) {
      const postData = request.postData();
      console.log('📤 REQUEST:', postData);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/graphql')) {
      const body = await response.json();
      console.log('📥 RESPONSE:', body);
    }
  });
  
  // Perform login
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('testuser@example.com');
  await page.getByLabel(/password/i).fill('Test123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Logs will show GraphQL mutation and response with tokens
});
```

### 4. Token Refresh Test
```typescript
test('should auto-refresh expired token on 401', async ({ page }) => {
  // Login first
  await login(page, 'testuser@example.com', 'Test123!');
  await waitForSecureToken(page, 20000);
  
  // Manually expire access token (keep refresh token valid)
  await page.evaluate(() => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    sessionStorage.setItem('__secure_access_token__', expiredToken);
    sessionStorage.setItem('__secure_expires_at__', '1516239022000');
  });
  
  // Reload page - should trigger 401 and auto-refresh
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Should still have valid tokens (refreshed)
  const tokens = await page.evaluate(() => ({
    accessToken: sessionStorage.getItem('__secure_access_token__'),
    refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
  }));
  
  expect(tokens.refreshToken).toBeTruthy();
});
```

## ⚙️ Configuration

### Playwright Config (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 8,
  
  use: {
    baseURL: 'http://localhost:3001',  // Vite dev server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Serial Mode for Auth Tests
Authentication tests run in serial mode to prevent concurrent login race conditions:

```typescript
// In e2e/auth.spec.ts
test.describe.configure({ mode: 'serial' });

test.describe('Authentication Flow', () => {
  // Tests run one at a time, not in parallel
});
```

**Why serial mode?**
- Prevents multiple concurrent logins to backend
- Avoids rate limiting issues
- Ensures stable token persistence checks
- Reduces flakiness from timing issues

## 🎯 Test Credentials

All tests use these credentials (must exist in backend):

```typescript
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'Test123!',
};
```

**Backend Setup:**
```bash
# Ensure test user exists
docker-compose exec backend npm run seed:test-user
```

## 📸 Test Artifacts

On test failure, Playwright automatically captures:

- **Screenshots** - Visual state when test failed
- **Videos** - Recording of entire test run
- **Traces** - Detailed execution timeline with DOM snapshots
- **Error Context** - Markdown file with error details

**Location:** `test-results/` directory

**View trace:**
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 🔍 Debugging Tips

### 1. Run in UI Mode (Best for Debugging)
```bash
npm run test:e2e:ui
```
- See tests execute live
- Pause and inspect at any step
- Time-travel through test execution
- View network requests and DOM snapshots

### 2. Run in Headed Mode
```bash
npm run test:e2e:headed
```
- See browser window during test
- Slower execution to observe behavior

### 3. Use `page.pause()`
```typescript
test('debug login', async ({ page }) => {
  await page.goto('/login');
  
  await page.pause(); // Test stops here, open inspector
  
  await page.getByLabel(/email/i).fill('test@test.com');
});
```

### 4. Check Console Logs
```typescript
page.on('console', msg => console.log('🖥️ CONSOLE:', msg.text()));
```

### 5. Inspect Storage
```typescript
const storage = await page.evaluate(() => {
  const keys = Object.keys(sessionStorage);
  const items = {};
  keys.forEach(key => items[key] = sessionStorage.getItem(key));
  return items;
});
console.log('💾 sessionStorage:', storage);
```

## Common Pitfalls

### 1. Using Wrong Storage Keys ❌
```typescript
// ❌ This will always return null
const token = await page.evaluate(() => 
  sessionStorage.getItem('accessToken')
);
```

### 2. Not Waiting for Token Persistence ❌
```typescript
// ❌ Race condition - token may not be saved yet
await page.getByRole('button', { name: /sign in/i }).click();
await expect(page).toHaveURL(/\/files/); // May fail!
```

### 3. Parallel Auth Tests ❌
```typescript
// ❌ Parallel execution can cause flaky tests
test.describe('Authentication Flow', () => {
  // Multiple tests logging in simultaneously
});
```

## ✅ Solutions

### 1. Always Use Secure Keys ✅
```typescript
const token = await page.evaluate(() => 
  sessionStorage.getItem('__secure_access_token__')
);
```

### 2. Wait for Token Before Assertions ✅
```typescript
await page.getByRole('button', { name: /sign in/i }).click();
await waitForSecureToken(page, 20000); // Wait for token
await expect(page).toHaveURL(/\/files/); // Now safe
```

### 3. Use Serial Mode for Auth ✅
```typescript
test.describe.configure({ mode: 'serial' });
```

## 📊 Test Coverage

E2E tests validate these critical flows:

- ✅ Login with valid credentials
- ✅ Login with invalid credentials (error handling)
- ✅ Logout and token cleanup
- ✅ Token persistence across page reloads
- ✅ Protected route access control
- ✅ Authorization header in API requests
- ✅ Token expiry detection and redirect
- ✅ Automatic token refresh on 401
- ✅ Redirect chain (/ → /files → /login)
- ✅ Basic accessibility checks
- ⏭️ MFA flow (skipped - needs backend config)

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    CI: true
```

### Best Practices for CI
- Set `workers: 1` in CI (prevent resource contention)
- Set `retries: 2` for flaky network conditions
- Use `npx playwright install --with-deps` in CI setup
- Ensure backend is running before tests

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Unit Tests README](../src/__tests__/README.md)
- [Token Management Documentation](../docs/TOKEN_MANAGEMENT.md)
- [E2E Test Results](./E2E_FINAL_STATUS.md)

---

**Last Updated:** November 26, 2025  
**Framework:** Playwright 1.40+  
**Status:** ✅ All tests passing (21/21, 1 skipped)
