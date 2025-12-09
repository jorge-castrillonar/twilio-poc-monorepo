import { test, expect } from '@playwright/test';

/**
 * Smoke Tests
 * Basic tests to ensure the application loads and core functionality works
 */

test.describe('Application Smoke Tests', () => {
  test('should load the homepage and redirect to login', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load and redirect
    // App redirects: / -> /files -> /login (via ProtectedRoute)
    await page.waitForURL(/\/login/, { timeout: 10000 });
    
    // Should be on login page for unauthenticated users
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Twilio|CCAI/i);
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have no critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('warning') && 
      !error.includes('DevTools')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should be accessible (basic check)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Basic accessibility checks
    // Check for proper HTML structure
    const main = page.locator('main, [role="main"], #root');
    await expect(main).toBeVisible();
  });
});
