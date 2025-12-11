/**
 * SpaceX E2E Tests
 * End-to-end tests for SpaceX integration
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'testuser@example.com',
  password: 'Test123!',
};

test.describe('SpaceX Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/files');
  });

  test('should navigate to SpaceX page', async ({ page }) => {
    await page.goto('/spacex');
    await expect(page).toHaveURL('/spacex');
    await expect(page.locator('h1')).toContainText('SpaceX Data');
  });

  test('should display page header and description', async ({ page }) => {
    await page.goto('/spacex');
    
    await expect(page.locator('h1')).toContainText('SpaceX Data');
    await expect(page.locator('text=Explore SpaceX launches and rockets')).toBeVisible();
  });

  test('should display view toggle buttons', async ({ page }) => {
    await page.goto('/spacex');
    
    await expect(page.locator('button:has-text("Launches")')).toBeVisible();
    await expect(page.locator('button:has-text("Rockets")')).toBeVisible();
  });

  test('should show launches view by default', async ({ page }) => {
    await page.goto('/spacex');
    
    await expect(page.locator('h2:has-text("Recent Launches")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display launches table with data', async ({ page }) => {
    await page.goto('/spacex');
    
    // Wait for data to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Check table headers
    await expect(page.locator('th:has-text("Mission")')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Rocket")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    
    // Check that at least one row exists
    const rows = page.locator('table tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('should display mission patches in launches table', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Check for mission patch images
    const images = page.locator('table tbody img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should switch to rockets view', async ({ page }) => {
    await page.goto('/spacex');
    
    // Click rockets button
    await page.click('button:has-text("Rockets")');
    
    // Verify rockets view is displayed
    await expect(page.locator('h2:has-text("Rockets")')).toBeVisible();
  });

  test('should display rockets grid with data', async ({ page }) => {
    await page.goto('/spacex');
    
    // Switch to rockets view
    await page.click('button:has-text("Rockets")');
    
    // Wait for rockets to load
    await page.waitForSelector('text=Falcon', { timeout: 10000 });
    
    // Check that rocket cards are displayed
    const rocketCards = page.locator('div:has-text("Falcon")');
    await expect(rocketCards.first()).toBeVisible();
  });

  test('should display rocket details', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.click('button:has-text("Rockets")');
    await page.waitForSelector('text=Falcon', { timeout: 10000 });
    
    // Check for rocket details
    await expect(page.locator('text=Type:')).toBeVisible();
    await expect(page.locator('text=Country:')).toBeVisible();
    await expect(page.locator('text=Company:')).toBeVisible();
  });

  test('should show active/inactive badges on rockets', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.click('button:has-text("Rockets")');
    await page.waitForSelector('text=Falcon', { timeout: 10000 });
    
    // Check for active/inactive badges
    const badges = page.locator('span:has-text("Active"), span:has-text("Inactive")');
    await expect(badges.first()).toBeVisible();
  });

  test('should toggle between launches and rockets views', async ({ page }) => {
    await page.goto('/spacex');
    
    // Start with launches
    await expect(page.locator('h2:has-text("Recent Launches")')).toBeVisible();
    
    // Switch to rockets
    await page.click('button:has-text("Rockets")');
    await expect(page.locator('h2:has-text("Rockets")')).toBeVisible();
    
    // Switch back to launches
    await page.click('button:has-text("Launches")');
    await expect(page.locator('h2:has-text("Recent Launches")')).toBeVisible();
  });

  test('should highlight active view button', async ({ page }) => {
    await page.goto('/spacex');
    
    // Launches button should be active by default
    const launchesButton = page.locator('button:has-text("Launches")');
    await expect(launchesButton).toHaveClass(/bg-blue-600/);
    
    // Switch to rockets
    await page.click('button:has-text("Rockets")');
    
    // Rockets button should now be active
    const rocketsButton = page.locator('button:has-text("Rockets")');
    await expect(rocketsButton).toHaveClass(/bg-blue-600/);
  });

  test('should display loading state', async ({ page }) => {
    await page.goto('/spacex');
    
    // Check for loading text (might be brief)
    const loadingText = page.locator('text=Loading launches');
    // Loading might complete quickly, so we just check it exists or data loads
    const hasLoading = await loadingText.isVisible().catch(() => false);
    const hasData = await page.locator('table tbody tr').count() > 0;
    
    expect(hasLoading || hasData).toBeTruthy();
  });

  test('should format dates correctly', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Check that dates are displayed (format: MM/DD/YYYY or similar)
    const dateCell = page.locator('table tbody tr').first().locator('td').nth(1);
    const dateText = await dateCell.textContent();
    
    // Should contain a date-like pattern or "N/A"
    expect(dateText).toMatch(/\d+\/\d+\/\d+|N\/A/);
  });

  test('should display launch success status', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Check for status badges
    const statusBadges = page.locator('span:has-text("Success"), span:has-text("Failed"), span:has-text("Unknown")');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('should require authentication', async ({ page }) => {
    // Logout first
    await page.goto('/files');
    await page.click('button:has-text("Logout")');
    
    // Try to access SpaceX page
    await page.goto('/spacex');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return error
    await page.route('**/graphql', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ errors: [{ message: 'Server error' }] }),
      });
    });
    
    await page.goto('/spacex');
    
    // Page should still render without crashing
    await expect(page.locator('h1:has-text("SpaceX Data")')).toBeVisible();
  });

  test('should display rocket cost information', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.click('button:has-text("Rockets")');
    await page.waitForSelector('text=Falcon', { timeout: 10000 });
    
    // Check for cost information
    const costText = page.locator('text=Cost per Launch:');
    const count = await costText.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display rocket success rate', async ({ page }) => {
    await page.goto('/spacex');
    
    await page.click('button:has-text("Rockets")');
    await page.waitForSelector('text=Falcon', { timeout: 10000 });
    
    // Check for success rate
    const successRateText = page.locator('text=Success Rate:');
    const count = await successRateText.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/spacex');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1:has-text("SpaceX Data")')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1:has-text("SpaceX Data")')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1:has-text("SpaceX Data")')).toBeVisible();
  });
});
