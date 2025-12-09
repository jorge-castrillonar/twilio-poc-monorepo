import { test, expect } from '@playwright/test';

/**
 * Login Flow Diagnostic Test
 * Detailed debugging of the login process
 */

test.describe('Login Flow Debug', () => {
  test('should debug login attempt with test credentials', async ({ page }) => {
    const graphqlRequests: any[] = [];
    const graphqlResponses: any[] = [];
    
    // Intercept GraphQL requests and responses
    page.on('request', (request) => {
      if (request.url().includes('/graphql')) {
        const postData = request.postData();
        if (postData) {
          try {
            const parsed = JSON.parse(postData);
            if (parsed.query?.includes('Login')) {
              console.log(' LOGIN REQUEST:');
              console.log('  URL:', request.url());
              console.log('  Variables:', JSON.stringify(parsed.variables, null, 2));
              graphqlRequests.push(parsed);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    });
    
    page.on('response', async (response) => {
      if (response.url().includes('/graphql')) {
        try {
          const body = await response.text();
          
          // Skip if not JSON (e.g., JS modules loaded by Vite)
          if (!body.startsWith('{') && !body.startsWith('[')) {
            return;
          }
          
          const parsed = JSON.parse(body);
          
          if (graphqlRequests.length > graphqlResponses.length) {
            console.log(' LOGIN RESPONSE:');
            console.log('  Status:', response.status());
            console.log('  Body:', JSON.stringify(parsed, null, 2));
            graphqlResponses.push({ status: response.status(), body: parsed });
          }
        } catch (e) {
          console.log(' Failed to parse response:', e);
        }
      }
    });
    
    // Navigate to login
    console.log(' Step 1: Navigate to login page');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    console.log(' Login page loaded');
    
    // Fill credentials
    console.log('\n Step 2: Fill login credentials');
    console.log('  Email: testuser@example.com');
    console.log('  Password: Test123!');
    
    await page.getByLabel(/email address/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    console.log(' Credentials filled');
    
    // Click submit
    console.log('\n Step 3: Click sign in button');
    await page.getByRole('button', { name: /sign in/i }).click();
    console.log(' Button clicked');
    
    // Wait for response
    console.log('\n Waiting for API response...');
    await page.waitForTimeout(5000);
    
    // Check final URL
    const finalUrl = page.url();
    console.log('\n Final URL:', finalUrl);
    
    // Check for error messages on page
    const hasError = await page.locator('[role="alert"], .alert, [class*="error"]').count();
    if (hasError > 0) {
      const errorText = await page.locator('[role="alert"], .alert, [class*="error"]').first().textContent();
      console.log(' Error message on page:', errorText);
    } else {
      console.log(' No error messages visible');
    }
    
    // Check sessionStorage for tokens (using actual tokenManager keys)
    const tokens = await page.evaluate(() => ({
      accessToken: sessionStorage.getItem('__secure_access_token__'),
      refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
      tokenType: sessionStorage.getItem('__secure_token_type__')
    }));
    
    console.log('\n SessionStorage tokens:');
    console.log('  accessToken:', tokens.accessToken ? ' Present' : ' Missing');
    console.log('  refreshToken:', tokens.refreshToken ? ' Present' : ' Missing');
    console.log('  tokenType:', tokens.tokenType || ' Missing');
    
    // Summary
    console.log('\n SUMMARY:');
    console.log('  Requests sent:', graphqlRequests.length);
    console.log('  Responses received:', graphqlResponses.length);
    console.log('  Final URL:', finalUrl);
    console.log('  Expected URL: http://localhost:3001/files');
    console.log('  Success:', finalUrl.includes('/files') ? ' YES' : ' NO');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/login-debug.png', fullPage: true });
    console.log('\n Screenshot saved to: test-results/login-debug.png');
    
    // If there were responses, check if they contain errors
    if (graphqlResponses.length > 0) {
      const lastResponse = graphqlResponses[graphqlResponses.length - 1];
      if (lastResponse.body.errors) {
        console.log('\n GraphQL ERRORS:');
        lastResponse.body.errors.forEach((error: any, i: number) => {
          console.log(`  Error ${i + 1}:`, error.message);
          if (error.extensions) {
            console.log('  Extensions:', JSON.stringify(error.extensions, null, 2));
          }
        });
      } else if (lastResponse.body.data?.login) {
        console.log('\n LOGIN SUCCESS!');
        console.log('  User:', lastResponse.body.data.login.user?.email);
        console.log('  Token received:', !!lastResponse.body.data.login.accessToken);
      }
    }
    
    // The test itself - we're just debugging, so always pass
    expect(graphqlRequests.length).toBeGreaterThan(0);
  });

  test('should test the GraphQL endpoint directly', async ({ request }) => {
    console.log(' Testing GraphQL endpoint directly');
    console.log('  URL:', 'http://localhost:8082/graphql');
    
    const response = await request.post('http://localhost:8082/graphql', {
      data: {
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              accessToken
              refreshToken
              tokenType
              expiresIn
              user {
                id
                email
                fullName
                roles
                mfaEnabled
              }
            }
          }
        `,
        variables: {
          input: {
            email: 'testuser@example.com',
            password: 'Test123!'
          }
        }
      }
    });
    
    const status = response.status();
    const body = await response.json();
    
    console.log('\n Direct API Response:');
    console.log('  Status:', status);
    console.log('  Body:', JSON.stringify(body, null, 2));
    
    if (body.errors) {
      console.log('\n API returned errors:');
      body.errors.forEach((error: any) => {
        console.log('  -', error.message);
      });
    } else if (body.data?.login) {
      console.log('\n API login successful!');
      console.log('  User email:', body.data.login.user.email);
    }
    
    expect(status).toBe(200);
  });
});
