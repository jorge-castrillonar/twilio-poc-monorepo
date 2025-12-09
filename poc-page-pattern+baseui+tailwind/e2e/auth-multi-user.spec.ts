import { test, expect } from '@playwright/test';
import { createLogger } from './test-logger';
import { TEST_USERS, TestUser } from './test-users';

/**
 * Multi-User Authentication E2E Tests
 * Tests authentication flows with different user types (Basic, MFA-enabled, Admin)
 * 
 * Prerequisites:
 * - Basic User: testuser@example.com (already exists)
 * - MFA User: Run `./scripts/reset-mfa-for-e2e.sh` to enable MFA
 * - Admin Users: Future - requires backend admin user support
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

// Helper: Check if MFA is actually enabled for a user
async function checkMfaStatus(page: any, user: TestUser): Promise<boolean> {
  await page.goto('/login');
  await page.getByLabel(/email address/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(2000);
  const currentUrl = page.url();
  return currentUrl.includes('/mfa-verify');
}

// Removed serial mode - it causes tests to fail when previous tests have issues
// Each test now runs independently with proper isolation via beforeEach

test.describe('Multi-User Authentication Flows', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  test('Basic User: Should login and access files without MFA', async ({ page }) => {
    const log = createLogger('Basic User Login Flow');
    log.start();
    
    const user = TEST_USERS.BASIC_USER;
    log.user({ email: user.email, roles: user.roles, mfaEnabled: user.mfaEnabled });
    
    log.step('Check actual MFA status');
    const actualMfaStatus = await checkMfaStatus(page, user);
    log.info(`Actual MFA Status: ${actualMfaStatus ? 'Enabled' : 'Disabled'}`);
    
    if (actualMfaStatus) {
      log.warn('MFA is enabled but test expects disabled state');
      log.info('To disable MFA, run: docker exec auth-db psql -U authservice -d authdb -c "DELETE FROM mfa_secrets WHERE user_id = \'3905778a-1e75-4f67-9f89-a33af54e522d\';"');
      test.skip(true, 'MFA enabled - cannot test basic user flow');
      return;
    }
    
    log.step('Verify redirect to files page (no MFA prompt)');
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    log.url('Final', page.url());
    log.verify('Redirected to files page', true);
    
    log.step('Verify tokens stored');
    const tokens = await page.evaluate(() => ({
      hasAccessToken: !!sessionStorage.getItem('__secure_access_token__'),
      hasRefreshToken: !!sessionStorage.getItem('__secure_refresh_token__'),
    }));
    log.tokens({ accessToken: tokens.hasAccessToken, refreshToken: tokens.hasRefreshToken });
    expect(tokens.hasAccessToken).toBe(true);
    expect(tokens.hasRefreshToken).toBe(true);
    
    log.pass('Basic user logged in successfully without MFA');
  });

  test('MFA User: Should require MFA verification before accessing files', async ({ page }) => {
    const log = createLogger('MFA User Login Flow');
    log.start();
    
    const user = TEST_USERS.MFA_USER;
    log.user({ email: user.email, roles: user.roles, mfaEnabled: user.mfaEnabled });
    
    log.step('Check actual MFA status');
    const actualMfaStatus = await checkMfaStatus(page, user);
    log.info(`Actual MFA Status: ${actualMfaStatus ? 'Enabled' : 'Disabled'}`);
    
    if (!actualMfaStatus) {
      log.warn('MFA is disabled but test expects enabled state');
      log.info('To enable MFA, run: ./scripts/reset-mfa-for-e2e.sh');
      test.skip(true, 'MFA disabled - cannot test MFA user flow');
      return;
    }
    
    log.step('Verify redirect to MFA verification page');
    await expect(page).toHaveURL(/\/mfa-verify/);
    log.url('Current', page.url());
    log.verify('Redirected to MFA page', true);
    
    log.step('Verify MFA page UI elements');
    const mfaElements = {
      heading: await page.getByText(/Two-Factor Authentication/i).isVisible(),
      codeInput: await page.getByLabel(/Authentication Code/i).isVisible(),
      verifyButton: await page.getByRole('button', { name: /Verify/i }).isVisible(),
    };
    log.formElements({
      'MFA Heading': mfaElements.heading,
      'Code Input': mfaElements.codeInput,
      'Verify Button': mfaElements.verifyButton,
    });
    
    log.step('Enter valid TOTP code');
    if (!user.mfaSecret) {
      log.error('MFA secret not configured');
      throw new Error('MFA secret required for this test');
    }
    
    const { authenticator } = await import('otplib');
    const totpCode = authenticator.generate(user.mfaSecret);
    log.info(`Generated TOTP code: ${totpCode}`);
    
    await page.getByLabel(/Authentication Code/i).fill(totpCode);
    await page.getByRole('button', { name: /Verify/i }).click();
    
    log.step('Verify successful MFA authentication');
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 10000 });
    log.url('Final', page.url());
    log.verify('Redirected to files page after MFA', true);
    
    log.step('Verify tokens stored after MFA');
    const tokens = await page.evaluate(() => ({
      hasAccessToken: !!sessionStorage.getItem('__secure_access_token__'),
      hasRefreshToken: !!sessionStorage.getItem('__secure_refresh_token__'),
    }));
    log.tokens({ accessToken: tokens.hasAccessToken, refreshToken: tokens.hasRefreshToken });
    expect(tokens.hasAccessToken).toBe(true);
    expect(tokens.hasRefreshToken).toBe(true);
    
    log.pass('MFA user completed full authentication flow');
  });

  test('MFA User: Should reject invalid MFA code', async ({ page }) => {
    const log = createLogger('MFA User - Invalid Code');
    log.start();
    
    const user = TEST_USERS.MFA_USER;
    log.user({ email: user.email, mfaEnabled: user.mfaEnabled });
    
    log.step('Check actual MFA status');
    const actualMfaStatus = await checkMfaStatus(page, user);
    
    if (!actualMfaStatus) {
      log.skip('MFA disabled - cannot test invalid MFA code');
      test.skip(true, 'MFA disabled');
      return;
    }
    
    log.step('Enter invalid MFA code');
    log.info('Code: 000000 (intentionally invalid)');
    await page.getByLabel(/Authentication Code/i).fill('000000');
    await page.getByRole('button', { name: /Verify/i }).click();
    
    log.step('Verify error message displayed');
    await page.waitForTimeout(2000);
    const hasError = await page.getByText(/Invalid.*code|incorrect|failed/i).isVisible().catch(() => false);
    log.verify('Error message shown', hasError);
    
    log.step('Verify user stayed on MFA page');
    await expect(page).toHaveURL(/\/mfa-verify/);
    log.url('Current', page.url());
    log.verify('Still on MFA page', true);
    
    log.pass('Invalid MFA code correctly rejected');
  });

  test('User Persistence: Basic user session persists across reload', async ({ page }) => {
    const log = createLogger('Session Persistence - Basic User');
    log.start();
    
    const user = TEST_USERS.BASIC_USER;
    log.user({ email: user.email });
    
    log.step('Login as basic user');
    const actualMfaStatus = await checkMfaStatus(page, user);
    
    if (actualMfaStatus) {
      log.skip('MFA enabled - cannot test basic user persistence');
      test.skip(true, 'MFA enabled');
      return;
    }
    
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    log.success('Initial login successful');
    
    log.step('Reload page to test persistence');
    await page.reload();
    await page.waitForLoadState('networkidle');
    log.url('After reload', page.url());
    
    log.step('Verify tokens still exist');
    await waitForSecureToken(page, 10000);
    const tokens = await page.evaluate(() => ({
      hasAccessToken: !!sessionStorage.getItem('__secure_access_token__'),
      hasRefreshToken: !!sessionStorage.getItem('__secure_refresh_token__'),
    }));
    log.tokens({ accessToken: tokens.hasAccessToken, refreshToken: tokens.hasRefreshToken });
    
    log.step('Verify still on files page');
    await expect(page).toHaveURL(/\/files/);
    log.verify('Session persisted', true);
    
    log.pass('Basic user session persisted across reload');
  });

  test('User Logout: Basic user can logout successfully', async ({ page }) => {
    const log = createLogger('Logout Flow - Basic User');
    log.start();
    
    const user = TEST_USERS.BASIC_USER;
    log.user({ email: user.email });
    
    log.step('Login as basic user');
    const actualMfaStatus = await checkMfaStatus(page, user);
    
    if (actualMfaStatus) {
      log.skip('MFA enabled - cannot test basic user logout');
      test.skip(true, 'MFA enabled');
      return;
    }
    
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    log.success('Login successful');
    
    log.step('Click logout button');
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    await logoutButton.click();
    
    log.step('Verify redirect to login page');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    log.url('After logout', page.url());
    
    log.step('Verify tokens cleared');
    const tokens = await page.evaluate(() => ({
      accessToken: sessionStorage.getItem('__secure_access_token__'),
      refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
    }));
    log.verify('Tokens cleared', !tokens.accessToken && !tokens.refreshToken);
    
    log.pass('User logged out successfully');
  });

  test('Access Control: Unauthenticated user cannot access protected routes', async ({ page }) => {
    const log = createLogger('Access Control - Protected Routes');
    log.start();
    
    log.step('Clear authentication state');
    await page.context().clearCookies();
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    const protectedRoutes = ['/files', '/mfa'];
    
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
});

test.describe('Token Management Across User Types', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  test('Tokens: Basic user tokens stored correctly in sessionStorage', async ({ page }) => {
    const log = createLogger('Token Storage - Basic User');
    log.start();
    
    const user = TEST_USERS.BASIC_USER;
    
    log.step('Login');
    await page.getByLabel(/email address/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    log.step('Wait for authentication');
    await waitForSecureToken(page, 20000);
    await expect(page).toHaveURL(/\/files/, { timeout: 5000 });
    
    log.step('Verify token storage');
    const tokens = await page.evaluate(() => ({
      accessToken: sessionStorage.getItem('__secure_access_token__'),
      refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
      tokenType: sessionStorage.getItem('__secure_token_type__'),
    }));
    
    log.table({
      'Access Token': tokens.accessToken ? `Present (${tokens.accessToken.substring(0, 20)}...)` : 'Missing',
      'Refresh Token': tokens.refreshToken ? `Present (${tokens.refreshToken.substring(0, 20)}...)` : 'Missing',
      'Token Type': tokens.tokenType || 'Missing',
    });
    
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(tokens.tokenType).toBe('Bearer');
    
    log.pass('All tokens stored correctly');
  });

  test('Tokens: Authorization header sent in API requests', async ({ page }) => {
    const log = createLogger('Authorization Header - API Requests');
    log.start();
    
    const user = TEST_USERS.BASIC_USER;
    
    log.step('Login');
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/files/, { timeout: 10000 });
    
    log.step('Listen for API requests with Authorization header');
    let hasAuthHeader = false;
    let capturedHeader = '';
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/graphql')) {
        const authHeader = request.headers()['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          hasAuthHeader = true;
          capturedHeader = authHeader.substring(0, 30) + '...';
        }
      }
    });
    
    log.step('Trigger API call by reloading');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    log.step('Verify Authorization header');
    log.verify('Authorization header present', hasAuthHeader);
    if (hasAuthHeader) {
      log.info(`Header: ${capturedHeader}`);
    }
    
    expect(hasAuthHeader).toBe(true);
    
    log.pass('Authorization header sent correctly');
  });
});
