import { Page } from '@playwright/test';
import { authenticator } from 'otplib';

/**
 * E2E Test Helpers
 * Reusable functions for common E2E testing operations
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Helper to login a user
 */
export async function login(page: Page, credentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123'
}) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  
  // Wait for redirect
  await page.waitForURL(/\/dashboard|\/files/, { timeout: 10000 });
}

/**
 * Helper to logout a user
 */
export async function logout(page: Page) {
  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  await logoutButton.click();
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const hasToken = await page.evaluate(() => {
    return !!sessionStorage.getItem('accessToken');
  });
  return hasToken;
}

/**
 * Helper to wait for API calls to complete
 */
export async function waitForApiCalls(page: Page, urlPattern: string | RegExp, timeout = 10000) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Helper to mock API responses
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status = 200
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Helper to simulate token expiration
 */
export async function expireToken(page: Page) {
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
}

/**
 * Helper to get token from storage
 */
export async function getStoredToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return sessionStorage.getItem('accessToken');
  });
}

/**
 * Helper to set custom token
 */
export async function setStoredToken(page: Page, token: string) {
  await page.evaluate((tokenValue) => {
    sessionStorage.setItem('accessToken', tokenValue);
  }, token);
}

/**
 * Helper to check for console errors
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Helper to take a screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Helper to wait for loading spinner to disappear
 */
export async function waitForLoadingToComplete(page: Page) {
  // Wait for any loading spinners to disappear
  const spinner = page.locator('.animate-spin, [role="status"]').first();
  
  try {
    await spinner.waitFor({ state: 'hidden', timeout: 10000 });
  } catch {
    // If spinner doesn't exist or already hidden, that's fine
  }
  
  // Also wait for network to be idle
  await page.waitForLoadState('networkidle');
}

/**
 * MFA Helper Functions
 */

/**
 * Check if MFA is actually enabled for a user by attempting login
 * @param page - Playwright page
 * @param credentials - User credentials
 * @returns true if MFA is required, false otherwise
 */
export async function isMfaEnabledForUser(page: Page, credentials: LoginCredentials): Promise<boolean> {
  // Go to login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill credentials
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  
  // Submit login
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait a bit for redirect
  await page.waitForTimeout(2000);
  
  // Check current URL
  const currentUrl = page.url();
  
  // If redirected to /mfa-verify, MFA is enabled
  return currentUrl.includes('/mfa-verify');
}

/**
 * Generate a TOTP code from a secret
 * @param secret - The TOTP secret (base32 encoded)
 * @returns 6-digit TOTP code
 */
export function generateTOTP(secret: string): string {
  return authenticator.generate(secret);
}

/**
 * MFA test user credentials
 * NOTE: This user needs to be set up in the backend with MFA enabled
 * and the secret must match what's configured in the backend
 * 
 * TO CONFIGURE:
 * 1. Get the MFA secret from your backend (via setupMfa mutation or admin panel)
 * 2. Update the 'secret' field below with the actual TOTP secret
 * 3. The secret should be a base32-encoded string (e.g., 'JBSWY3DPEHPK3PXP')
 */
export const MFA_TEST_USER = {
  email: 'testuser@example.com',
  password: 'Test123!',
  // MFA secret for TOTP generation
  // Tests will automatically skip if MFA is not enabled in backend
  // To enable: ./scripts/reset-mfa-for-e2e.sh
  secret: 'JBSWY3DPEHPK3PXP',
};

/**
 * Helper to enable MFA for a test user
 * This should be called in a setup script before running MFA E2E tests
 */
export async function setupMfaForTestUser(page: Page, credentials: LoginCredentials): Promise<string> {
  // Login as the user
  await login(page, credentials);
  
  // Navigate to MFA settings page
  await page.goto('/mfa');
  
  // Click setup/enable MFA button
  await page.getByRole('button', { name: /enable|setup mfa/i }).click();
  
  // Wait for QR code and secret to appear
  await page.waitForSelector('text=Secret', { timeout: 5000 });
  
  // Extract the secret from the page
  const secretElement = page.locator('text=/[A-Z0-9]{16,}/');
  const secret = await secretElement.textContent();
  
  if (!secret) {
    throw new Error('Failed to extract MFA secret');
  }
  
  // Generate a TOTP code to verify setup
  const code = generateTOTP(secret);
  
  // Enter the code to complete MFA setup
  await page.getByLabel(/code|totp/i).fill(code);
  await page.getByRole('button', { name: /verify|enable/i }).click();
  
  // Wait for success message
  await page.waitForSelector('text=/MFA enabled|successfully/i', { timeout: 5000 });
  
  return secret;
}

/**
 * Helper to login with MFA-enabled user
 */
export async function loginWithMFA(
  page: Page, 
  credentials: LoginCredentials,
  totpSecret: string
): Promise<void> {
  // Step 1: Initial login
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  
  // Step 2: Wait for redirect to MFA verification page
  await page.waitForURL(/\/mfa-verify/, { timeout: 10000 });
  
  // Step 3: Generate and enter TOTP code
  const code = generateTOTP(totpSecret);
  await page.getByLabel(/authentication code|totp/i).fill(code);
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Step 4: Wait for final redirect to main app
  await page.waitForURL(/\/files|\/dashboard/, { timeout: 10000 });
}
