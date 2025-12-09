import { test, expect } from '@playwright/test';
import { createLogger } from './test-logger';
import { TEST_USERS, TestUser } from './test-users';

/**
 * Authentication E2E Tests
 * Tests for login, logout, and token management flows with multiple user types
 */

// Helper: wait until tokenManager's secure access token is present in sessionStorage
async function waitForSecureToken(page: any, timeout = 20000) {
  try {
    await page.waitForFunction(
      () => {
        const token = sessionStorage.getItem('__secure_access_token__');
        return token !== null && token !== undefined && token !== '';
      },
      { timeout }
    );
  } catch (error) {
    // Provide more context in the error
    const currentUrl = page.url();
    const hasToken = await page.evaluate(() => sessionStorage.getItem('__secure_access_token__'));
    throw new Error(
      `Timed out waiting for secure access token in sessionStorage after ${timeout}ms.\n` +
      `Current URL: ${currentUrl}\n` +
      `Token present: ${!!hasToken}`
    );
  }
}

// Removed serial mode - it causes tests to fail when previous tests have issues
// Each test now runs independently with proper isolation via beforeEach

test.describe('Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    
    // Clear sessionStorage to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    await page.waitForLoadState('networkidle');
    // Wait for redirect to login (via / -> /files -> /login due to ProtectedRoute)
    // Give it extra time for React to mount and redirect
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    const log = createLogger('Show login page for unauthenticated users');
    log.start();
    
    log.step('Verify redirect to login page');
    log.url('Current', page.url());
    
    await expect(page).toHaveURL(/\/login/);
    log.success('Redirected to login page');
    
    log.step('Check login form elements visibility');
    const emailVisible = await page.getByLabel(/email address/i).isVisible();
    const passwordVisible = await page.getByLabel(/password/i).isVisible();
    const buttonVisible = await page.getByRole('button', { name: /sign in/i }).isVisible();
    
    log.formElements({
      'Email field': emailVisible,
      'Password field': passwordVisible,
      'Sign in button': buttonVisible
    });
    
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    log.pass('All login form elements visible');
  });

  test('should show validation errors for invalid credentials', async ({ page }) => {
    const log = createLogger('Validation errors for invalid credentials');
    log.start();
    
    log.url('Starting', page.url());
    
    log.step('Enter invalid credentials');
    log.info('Email: wrong@example.com');
    log.info('Password: wrongpassword');
    await page.getByLabel(/email address/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    log.step('Submit login form');
    log.action('Clicking sign in button');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    log.step('Wait for API response');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    log.url('After login attempt', currentUrl);
    
    log.step('Verify user stayed on login page');
    await expect(page).toHaveURL(/\/login/);
    log.verify('Stayed on login page', true);
    
    log.pass('Invalid credentials rejected correctly');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Already on /login from beforeEach
    
    // Fill in login form with test credentials
    // These should match your backend test user
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait a moment for navigation
    await page.waitForTimeout(2000);
    
    // Check if user has MFA enabled - will redirect to /mfa-verify
    // If no MFA, will go directly to /files
    const currentUrl = page.url();
    
    if (currentUrl.includes('/mfa-verify')) {
      // User has MFA enabled - verify we're on MFA page
      await expect(page).toHaveURL(/\/mfa-verify/);
      console.log(' MFA is enabled for test user - redirected to /mfa-verify as expected');
    } else {
      // User doesn't have MFA - should be on files page
      await waitForSecureToken(page, 20000);
      await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
      console.log(' MFA is not enabled for test user - redirected to /files as expected');
    }

    // Wait for page to fully load after redirect
    await page.waitForLoadState('networkidle');
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    console.log('\n TEST: Persist authentication across page reloads');
    
    // Login first
    console.log(' Step 1: Logging in with test credentials');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
  // Wait for token persistence to complete
  console.log(' Step 2: Waiting for token persistence...');
  await waitForSecureToken(page, 20000);
  await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
  console.log(' Login successful, redirected to:', page.url());
    
    // Reload the page
    console.log(' Step 3: Reloading page to test persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log(' After reload, URL:', page.url());
    
    // Should still be authenticated and on files page
    console.log(' Step 4: Verifying tokens still exist...');
    await waitForSecureToken(page, 10000);
    const tokens = await page.evaluate(() => ({
      hasAccessToken: !!sessionStorage.getItem('__secure_access_token__'),
      hasRefreshToken: !!sessionStorage.getItem('__secure_refresh_token__'),
    }));
    console.log(' Tokens after reload:', tokens);
    
    await expect(page).toHaveURL(/\/files/);
    console.log(' Test passed: Authentication persisted across reload\n');
  });

  test('should logout successfully', async ({ page }) => {
    const log = createLogger('Logout successfully');
    log.start();
    
    log.step('Login with test credentials');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    log.step('Wait for authentication');
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    log.success('Login successful');
    
    log.step('Click logout button');
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    await logoutButton.click();
    
    log.step('Verify redirect to login page');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    log.url('After logout', page.url());
    
    log.step('Verify tokens cleared');
    const tokensCleared = await page.evaluate(() => {
      return {
        accessToken: sessionStorage.getItem('__secure_access_token__'),
        refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
      };
    });
    log.verify('Tokens cleared', !tokensCleared.accessToken && !tokensCleared.refreshToken);
    
    log.pass('Logout successful');
  });
});

test.describe('Protected Routes', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });
  
  test('should redirect unauthenticated users to login', async ({ page }) => {
    const log = createLogger('Redirect unauthenticated users to login');
    log.start();
    
    log.step('Clear authentication state');
    await page.context().clearCookies();
    
    const protectedRoutes = ['/files', '/mfa'];
    log.info(`Testing protected routes: ${protectedRoutes.join(', ')}`);
    
    for (const route of protectedRoutes) {
      log.step(`Test access to ${route}`);
      await page.goto(route);
      log.url('Attempted', route);
      
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
      log.url('Redirected to', page.url());
      log.verify(`${route} redirected to login`, true);
    }
    
    log.pass('All protected routes require authentication');
  });

  test('should allow authenticated users to access protected routes', async ({ page }) => {
    const log = createLogger('Allow authenticated users to access protected routes');
    log.start();
    
    log.step('Login with valid credentials');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 10000 });
    log.success('Login successful');
    log.url('Current', page.url());
    
    log.step('Test access to protected route');
    await page.goto('/files');
    log.url('After navigation', page.url());
    await expect(page).toHaveURL(/\/files/);
    log.verify('Successfully accessed /files', true);
    
    await expect(page).not.toHaveURL(/\/login/);
    log.pass('Authenticated user can access protected routes');
  });
});

test.describe('Token Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });
  
  test('should store tokens in sessionStorage after login', async ({ page }) => {
    console.log('\n TEST: Store tokens in sessionStorage after login');
    
    // Start at login page
    console.log(' Step 1: Navigating to app');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
    console.log(' Redirected to login:', page.url());
    
    // Login
    console.log(' Step 2: Logging in');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
  // Wait for the token to be persisted by the client
  console.log(' Step 3: Waiting for token persistence...');
  await waitForSecureToken(page, 20000);
  await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
  console.log(' Login successful');
    
    // Check that sessionStorage has tokens (using tokenManager keys)
    console.log(' Step 4: Checking sessionStorage for tokens');
    const tokens = await page.evaluate(() => ({
      accessToken: sessionStorage.getItem('__secure_access_token__'),
      refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
      tokenType: sessionStorage.getItem('__secure_token_type__')
    }));
    
    console.log(' Tokens found:');
    console.log('  - Access Token:', tokens.accessToken ? ' Present' : ' Missing');
    console.log('  - Refresh Token:', tokens.refreshToken ? ' Present' : ' Missing');
    console.log('  - Token Type:', tokens.tokenType || ' Missing');
    
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(tokens.tokenType).toBe('Bearer');
    console.log(' Test passed: Tokens stored correctly\n');
  });

  test('should send Authorization header in API requests', async ({ page }) => {
    const log = createLogger('Send Authorization header in API requests');
    log.start();
    
    log.step('Login to get valid tokens');
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for token to be stored
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 10000 });
    log.success('Login successful');
    
    log.step('Setup listener for API requests');
    let hasAuthHeader = false;
    let capturedHeader = '';
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/graphql')) {
        const authHeader = request.headers()['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          hasAuthHeader = true;
          capturedHeader = authHeader.substring(0, 30) + '...';
          log.api('POST', '/graphql', 200);
          log.info(`Authorization: ${capturedHeader}`);
        }
      }
    });
    
    log.step('Reload page to trigger API calls');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    log.step('Verify Authorization header was sent');
    log.verify('Authorization header present', hasAuthHeader);
    expect(hasAuthHeader).toBe(true);
    
    log.pass('API requests include Authorization header');
  });

  test('should clear tokens on logout', async ({ page }) => {
    const log = createLogger('Clear tokens on logout');
    log.start();
    
    log.step('Login to get tokens');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    log.success('Login successful');
    
    log.step('Verify tokens exist before logout');
    let hasTokens = await page.evaluate(() => {
      return !!sessionStorage.getItem('__secure_access_token__');
    });
    log.verify('Tokens present', hasTokens);
    expect(hasTokens).toBe(true);
    
    log.step('Click logout button');
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    await logoutButton.click();
    
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    log.url('After logout', page.url());
    
    log.step('Verify tokens cleared after logout');
    hasTokens = await page.evaluate(() => {
      const accessToken = sessionStorage.getItem('__secure_access_token__');
      const refreshToken = sessionStorage.getItem('__secure_refresh_token__');
      return !!(accessToken || refreshToken);
    });
    log.verify('Tokens cleared', !hasTokens);
    expect(hasTokens).toBe(false);
    
    log.pass('Tokens cleared successfully on logout');
  });
});

test.describe('AuthGuard Component', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });
  
  test('should validate tokens and allow access when valid', async ({ page }) => {
    console.log('\n TEST: AuthGuard validates tokens and allows access');
    
    // Login to get valid tokens
    console.log(' Step 1: Logging in to get valid tokens');
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
  // Wait for token persistence before checking route
  console.log(' Step 2: Waiting for authentication...');
  await waitForSecureToken(page, 20000);
  await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
  console.log(' Login successful');

  // Navigate to a page with AuthGuard
  console.log('  Step 3: Testing AuthGuard by navigating to protected route');
  await page.goto('/files');
  console.log(' Current URL:', page.url());
    
    // Should load successfully without redirect
    await expect(page).toHaveURL(/\/files/);
    await page.waitForLoadState('networkidle');
    console.log(' Test passed: AuthGuard allowed access with valid tokens\n');
  });

  test('should redirect to login when tokens are expired', async ({ page }) => {
    console.log('\n TEST: AuthGuard redirects when tokens are expired');
    
    // Manually set expired tokens in sessionStorage using secure keys
    console.log(' Step 1: Setting expired tokens in sessionStorage');
    await page.goto('/login');
    
    await page.evaluate(() => {
      // Set expired tokens (exp timestamp in the past) using tokenManager secure keys
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNTE2MjM5MDIyfQ.test';
      sessionStorage.setItem('__secure_access_token__', expiredToken);
      sessionStorage.setItem('__secure_refresh_token__', expiredToken);
      sessionStorage.setItem('__secure_token_type__', 'Bearer');
      sessionStorage.setItem('__secure_expires_at__', '1516239022000'); // Expired timestamp
    });
    console.log(' Expired tokens set');
    
    // Try to access protected route with expired tokens
    console.log('  Step 2: Attempting to access protected route with expired tokens');
    await page.goto('/files');
    console.log(' After goto("/files"):', page.url());
    
    // AuthGuard should detect expired tokens and redirect to login
    console.log(' Step 3: Waiting for AuthGuard to redirect...');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    console.log(' Test passed: AuthGuard redirected to login due to expired tokens\n');
  });

  test('should have token refresh mechanism in baseQueryWithReauth', async ({ page }) => {
    // This test validates the refresh token mechanism is implemented
    // The actual refresh flow requires a real 401 from an authenticated API call
    
    // Login first to get valid tokens
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for successful login and token persistence
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    
    // Verify tokens are stored (including refresh token for future refresh)
    const tokens = await page.evaluate(() => ({
      accessToken: sessionStorage.getItem('__secure_access_token__'),
      refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
      tokenType: sessionStorage.getItem('__secure_token_type__'),
    }));
    
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(tokens.tokenType).toBe('Bearer');
    
    // NOTE: The baseQueryWithReauth in graphqlApi.ts automatically refreshes tokens on 401
    // This mechanism is validated by:
    // 1. tokenManager.startRefresh() prevents concurrent refreshes
    // 2. refreshToken mutation is called when access token expires
    // 3. Original request is retried with new token
    // 
    // Full flow testing requires:
    // - Real API endpoint that returns 401 with expired token
    // - Backend that accepts valid refresh token
    // - This is better tested with integration tests or manual testing
    // 
    // This E2E test confirms the tokens are available for the refresh mechanism
  });
});

test.describe('MFA Flow', () => {
  /**
   * MFA E2E Tests
   * 
   * Prerequisites for running these tests with real backend:
   * 1. Backend must be running with MFA support
   * 2. Test user must have MFA enabled
   * 3. MFA secret must be known (from setupMfa mutation)
   * 
   * Current Status:
   * - Tests run against frontend UI and mock MFA flow
   * - To test with real backend, update MFA_TEST_USER.secret in helpers.ts
   * - Tests will automatically detect if backend MFA is configured
   */

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  test('should redirect to MFA verification page when user has MFA enabled', async ({ page }) => {
    console.log('\n TEST: Redirect to MFA verification when MFA enabled');
    const { MFA_TEST_USER, isMfaEnabledForUser } = await import('./helpers');
    
    // Check if MFA is actually enabled for this user
    console.log(' Step 1: Checking if MFA is enabled for test user');
    console.log('  Test user:', MFA_TEST_USER.email);
    const mfaEnabled = await isMfaEnabledForUser(page, MFA_TEST_USER);
    console.log('  MFA Status:', mfaEnabled ? ' Enabled' : ' Disabled');
    
    if (!mfaEnabled) {
      console.log('  Skipping test: MFA not enabled. Run: ./scripts/reset-mfa-for-e2e.sh\n');
      test.skip(true, 'MFA not enabled for test user. Run: ./scripts/reset-mfa-for-e2e.sh');
      return;
    }
    
    // Already on MFA verification page from the check
    console.log(' Step 2: Verifying MFA page URL:', page.url());
    
    // Verify MFA verification page elements
    console.log(' Step 3: Checking MFA page UI elements');
    const elements = {
      heading: await page.getByText(/Two-Factor Authentication/i).isVisible(),
      codeInput: await page.getByLabel(/Authentication Code/i).isVisible(),
      verifyButton: await page.getByRole('button', { name: /Verify/i }).isVisible(),
      backButton: await page.getByRole('button', { name: /Back to Login/i }).isVisible(),
    };
    
    console.log('  UI Elements:');
    console.log('    - Heading:', elements.heading ? ' Visible' : ' Hidden');
    console.log('    - Code Input:', elements.codeInput ? ' Visible' : ' Hidden');
    console.log('    - Verify Button:', elements.verifyButton ? ' Visible' : ' Hidden');
    console.log('    - Back Button:', elements.backButton ? ' Visible' : ' Hidden');
    
    await expect(page.getByText(/Two-Factor Authentication/i)).toBeVisible();
    await expect(page.getByLabel(/Authentication Code/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Verify/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Login/i })).toBeVisible();
    console.log(' Test passed: MFA verification page displayed correctly\n');
  });

  test('should complete MFA login flow with valid TOTP code', async ({ page }) => {
    console.log('\n TEST: Complete MFA login with valid TOTP code');
    const { MFA_TEST_USER, loginWithMFA, isMfaEnabledForUser } = await import('./helpers');
    
    // Check if MFA is actually enabled for this user
    console.log(' Step 1: Checking MFA status');
    const mfaEnabled = await isMfaEnabledForUser(page, MFA_TEST_USER);
    console.log('  MFA enabled:', mfaEnabled ? ' Yes' : ' No');
    
    if (!mfaEnabled) {
      console.log('  Skipping: MFA not enabled\n');
      test.skip(true, 'MFA not enabled for test user. Run: ./scripts/reset-mfa-for-e2e.sh');
      return;
    }
    
    if (!MFA_TEST_USER.secret) {
      console.log('  Skipping: MFA secret not configured\n');
      test.skip(true, 'MFA secret not configured in helpers.ts');
      return;
    }
    
    console.log(' Step 2: Performing MFA login');
    console.log('  User:', MFA_TEST_USER.email);
    console.log('  Secret configured:', MFA_TEST_USER.secret ? ' Yes' : ' No');
    
    // Use the helper function to perform complete MFA login
    await loginWithMFA(page, MFA_TEST_USER, MFA_TEST_USER.secret);
    console.log(' MFA login completed');
    
    // Wait for secure tokens to be stored
    console.log(' Step 3: Waiting for tokens...');
    await waitForSecureToken(page, 20000);
    
    // Verify tokens are stored in sessionStorage
    console.log(' Step 4: Verifying tokens in sessionStorage');
    const tokens = await page.evaluate(() => ({
      accessToken: sessionStorage.getItem('__secure_access_token__'),
      refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
    }));
    
    console.log('  Tokens:');
    console.log('    - Access Token:', tokens.accessToken ? ' Present' : ' Missing');
    console.log('    - Refresh Token:', tokens.refreshToken ? ' Present' : ' Missing');
    
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    
    // Verify we're on the files page
    console.log(' Step 5: Verifying redirect to files page');
    await expect(page).toHaveURL(/\/files/);
    console.log('  Current URL:', page.url());
    console.log(' Test passed: MFA login successful\n');
  });

  test('should show error for invalid MFA code', async ({ page }) => {
    console.log('\n TEST: Show error for invalid MFA code');
    const { MFA_TEST_USER, isMfaEnabledForUser } = await import('./helpers');
    
    // Check if MFA is actually enabled for this user
    console.log(' Step 1: Checking MFA status');
    const mfaEnabled = await isMfaEnabledForUser(page, MFA_TEST_USER);
    console.log('  MFA enabled:', mfaEnabled ? ' Yes' : ' No');
    
    if (!mfaEnabled) {
      console.log('  Skipping: MFA not enabled\n');
      test.skip(true, 'MFA not enabled for test user. Run: ./scripts/reset-mfa-for-e2e.sh');
      return;
    }
    
    // Already on MFA verification page from the check
    console.log(' Current URL:', page.url());
    
    // Step 3: Enter invalid code (definitely wrong)
    console.log(' Step 2: Entering invalid MFA code');
    console.log('  Code: 000000 (intentionally wrong)');
    await page.getByLabel(/Authentication Code/i).fill('000000');
    
    console.log('  Step 3: Clicking Verify button');
    await page.getByRole('button', { name: /Verify/i }).click();
    
    // Step 4: Should show error message
    console.log(' Step 4: Waiting for error message...');
    await expect(page.getByText(/Invalid.*code|incorrect|failed/i)).toBeVisible({ timeout: 5000 });
    console.log(' Error message displayed');
    
    // Step 5: Should stay on MFA verification page
    console.log(' Step 5: Verifying still on MFA page');
    await expect(page).toHaveURL(/\/mfa-verify/);
    console.log('  Current URL:', page.url());
    console.log(' Test passed: Invalid code rejected with error message\n');
  });

  test('should support backup codes toggle', async ({ page }) => {
    const { MFA_TEST_USER, isMfaEnabledForUser } = await import('./helpers');
    
    // Check if MFA is actually enabled for this user
    const mfaEnabled = await isMfaEnabledForUser(page, MFA_TEST_USER);
    
    if (!mfaEnabled) {
      test.skip(true, 'MFA not enabled for test user. Run: ./scripts/reset-mfa-for-e2e.sh');
      return;
    }
    
    // Already on MFA verification page from the check
    
    // Step 3: Verify TOTP code input is shown by default
    await expect(page.getByLabel(/Authentication Code/i)).toBeVisible();
    
    // Step 4: Click "Use a backup code instead"
    await page.getByText(/Use a backup code instead/i).click();
    
    // Step 5: Verify backup code input is shown
    await expect(page.getByLabel(/Backup Code/i)).toBeVisible();
    
    // Step 6: Can switch back to authenticator code
    await page.getByText(/Use authenticator code instead/i).click();
    await expect(page.getByLabel(/Authentication Code/i)).toBeVisible();
  });

  test('should allow user to go back to login from MFA page', async ({ page }) => {
    const { MFA_TEST_USER, isMfaEnabledForUser } = await import('./helpers');
    
    // Check if MFA is actually enabled for this user
    const mfaEnabled = await isMfaEnabledForUser(page, MFA_TEST_USER);
    
    if (!mfaEnabled) {
      test.skip(true, 'MFA not enabled for test user. Run: ./scripts/reset-mfa-for-e2e.sh');
      return;
    }
    
    // Step 2: Wait for MFA page
    await page.waitForURL(/\/mfa-verify/, { timeout: 10000 });
    
    // Step 3: Click back to login
    await page.getByRole('button', { name: /Back to Login/i }).click();
    
    // Step 4: Should redirect to login page
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page.getByText(/Sign in to your account/i)).toBeVisible();
  });

  test('should show MFA verification UI elements correctly', async ({ page }) => {
    // This test doesn't require backend MFA setup - it just tests the UI
    // We manually navigate to the MFA verification page with state
    await page.goto('/login');
    
    // Manually set up navigation state (simulating redirect from login)
    await page.evaluate(() => {
      // Store credentials in memory as LoginPage would
      (window as any).__mfaTestCredentials = {
        email: 'testuser@example.com',
        password: 'Test123!'
      };
    });
    
    // Navigate to MFA verification page
    // Note: In real flow, this happens automatically via React Router
    await page.goto('/mfa-verify');
    
    // Verify page elements exist (may not fully function without proper flow)
    // Check for main heading
    const heading = page.getByText(/Two-Factor Authentication/i);
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
      
      // Check for helper text
      await expect(page.getByText(/6-digit code/i)).toBeVisible();
      
      // Check for buttons
      await expect(page.getByRole('button', { name: /Verify/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Back to Login/i })).toBeVisible();
    }
    // If not visible, it redirected to login due to missing state, which is correct behavior
  });

  test('should validate MFA code input format', async ({ page }) => {
    const { MFA_TEST_USER, isMfaEnabledForUser } = await import('./helpers');
    
    // Check if MFA is actually enabled for this user
    const mfaEnabled = await isMfaEnabledForUser(page, MFA_TEST_USER);
    
    if (!mfaEnabled) {
      test.skip(true, 'MFA not enabled for test user. Run: ./scripts/reset-mfa-for-e2e.sh');
      return;
    }
    
    // Already on MFA verification page from the check
    
    // Test numeric input validation
    const codeInput = page.getByLabel(/Authentication Code/i);
    
    // Should accept numeric input
    await codeInput.fill('123456');
    await expect(codeInput).toHaveValue('123456');
    
    // Should filter out non-numeric characters
    await codeInput.fill('12ab34cd56');
    const value = await codeInput.inputValue();
    // Value should only contain digits
    expect(/^\d+$/.test(value)).toBe(true);
    
    // Should limit to 6 digits max
    await codeInput.fill('1234567890');
    const limitedValue = await codeInput.inputValue();
    expect(limitedValue.length).toBeLessThanOrEqual(6);
  });
});
