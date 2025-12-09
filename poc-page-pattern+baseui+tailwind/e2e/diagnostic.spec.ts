import { test, expect } from '@playwright/test';

/**
 * Diagnostic E2E Test
 * To identify what's preventing redirects from working
 */

test.describe('App Diagnostics', () => {
  test('should load app and check for React errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Capture all console messages
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
        console.log(' Console Error:', text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
        console.log('  Console Warning:', text);
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.log('💥 Page Error:', error.message);
    });
    
    console.log(' Loading app at /...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log(' Current URL:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/diagnostic-root.png', fullPage: true });
    
    // Check what's visible on the page
    const bodyText = await page.locator('body').textContent();
    console.log(' Page contains:', bodyText?.substring(0, 200));
    
    // Print all errors
    console.log('\n Diagnostics:');
    console.log('Total errors:', errors.length);
    console.log('Total warnings:', warnings.length);
    console.log('Final URL:', page.url());
    
    // Check if Redux store is initialized
    const hasRedux = await page.evaluate(() => {
      return typeof window !== 'undefined' && '__REDUX_DEVTOOLS_EXTENSION__' in window;
    });
    console.log('Redux DevTools:', hasRedux ? 'Found' : 'Not found');
    
    // The test itself - just document the state
    expect(page.url()).toMatch(/http:\/\/localhost:3001\/.*/);
  });

  test('should check if ProtectedRoute redirects work', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    console.log(' Testing redirect from / to /login...');
    
    // Clear auth
    await page.context().clearCookies();
    
    // Go to root
    await page.goto('/');
    console.log(' After goto("/"): URL =', page.url());
    
    // Wait a bit for any redirects
    await page.waitForTimeout(3000);
    console.log(' After 3s wait: URL =', page.url());
    
    // Try going to /files directly
    await page.goto('/files');
    console.log(' After goto("/files"): URL =', page.url());
    
    await page.waitForTimeout(3000);
    console.log(' After 3s wait: URL =', page.url());
    
    // Check Redux auth state
    const authState = await page.evaluate(() => {
      const stateEl = document.querySelector('[data-testid="auth-state"]');
      if (stateEl) return stateEl.textContent;
      
      // Try to access Redux state from window (if exposed)
      return 'Redux state not accessible from page';
    });
    console.log(' Auth state:', authState);
    
    console.log(' Errors:', errors.length);
    if (errors.length > 0) {
      console.log('First error:', errors[0]);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/diagnostic-redirect.png', fullPage: true });
  });

  test('should navigate directly to /login and check form', async ({ page }) => {
    console.log(' Direct navigation to /login...');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    console.log(' URL:', page.url());
    
    // Check for form elements
    const hasEmail = await page.getByLabel(/email address/i).isVisible().catch(() => false);
    const hasPassword = await page.getByLabel(/password/i).isVisible().catch(() => false);
    const hasButton = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);
    
    console.log(' Form elements:');
    console.log('  Email field:', hasEmail ? '' : '');
    console.log('  Password field:', hasPassword ? '' : '');
    console.log('  Submit button:', hasButton ? '' : '');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/diagnostic-login.png', fullPage: true });
    
    // This should pass
    expect(hasEmail && hasPassword && hasButton).toBe(true);
  });
});
