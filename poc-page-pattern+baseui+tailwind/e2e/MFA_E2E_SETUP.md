# MFA E2E Test Setup Guide

This guide explains how to configure and run MFA (Multi-Factor Authentication) E2E tests.

---

## 📋 Overview

The E2E test suite includes comprehensive MFA tests that verify the complete two-factor authentication flow. These tests require backend MFA configuration to run properly.

---

## 🔧 Prerequisites

Before running MFA E2E tests, you need:

1. **Backend with MFA support running** on `http://localhost:8082/graphql`
2. **Test user with MFA enabled** (`testuser@example.com`)
3. **TOTP secret** for the test user

---

## ⚙️ Configuration Steps

### Step 1: Enable MFA for Test User

You have several options to enable MFA for your test user:

#### Option A: Using GraphQL Mutation (Recommended)

```bash
# 1. Login as test user to get access token
curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"testuser@example.com\", password: \"Test123!\" }) { accessToken } }"
  }'

# 2. Enable MFA (use the accessToken from step 1)
curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "query": "mutation { setupMfa { secret qrCodeUrl backupCodes } }"
  }'
```

The response will include:
```json
{
  "data": {
    "setupMfa": {
      "secret": "JBSWY3DPEHPK3PXP",  // ← Copy this!
      "qrCodeUrl": "otpauth://totp/...",
      "backupCodes": ["ABC123...", "DEF456..."]
    }
  }
}
```

#### Option B: Using the Frontend UI

1. Start the frontend: `npm run dev`
2. Login as `testuser@example.com`
3. Navigate to MFA settings page: `http://localhost:3001/mfa`
4. Click "Enable MFA"
5. **Copy the secret** shown below the QR code
6. Complete the MFA setup by entering a generated code

#### Option C: Using Backend Admin Tools

If your backend has admin tools or seed scripts, use those to:
1. Enable MFA for `testuser@example.com`
2. Retrieve or generate the TOTP secret
3. Save backup codes if needed

### Step 2: Update E2E Test Configuration

Once you have the MFA secret, update the test configuration:

1. Open `e2e/helpers.ts`
2. Find the `MFA_TEST_USER` constant (around line 173)
3. Update the `secret` field with your actual TOTP secret:

```typescript
export const MFA_TEST_USER = {
  email: 'testuser@example.com',
  password: 'Test123!',
  secret: 'JBSWY3DPEHPK3PXP', // ← Replace with your actual secret
};
```

**Important:** The secret must be:
- **Base32 encoded** (uppercase letters A-Z and numbers 2-7)
- **16 or 32 characters long** (typically)
- **Exactly as returned** from `setupMfa` mutation

### Step 3: Verify Configuration

Test your configuration manually:

```bash
# Generate a TOTP code using Node.js
node -e "
const { authenticator } = require('otplib');
const secret = 'JBSWY3DPEHPK3PXP'; // Your actual secret
console.log('Current TOTP code:', authenticator.generate(secret));
"
```

Try logging in with this code via the UI to verify it works.

---

## 🧪 Running MFA E2E Tests

### Run All E2E Tests (including MFA)

```bash
npm run test:e2e
```

### Run Only MFA Tests

```bash
npx playwright test --grep "MFA Flow"
```

### Run with UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Run with Visible Browser

```bash
npm run test:e2e:headed
```

### Debug Mode (Step Through)

```bash
npm run test:e2e:debug
```

---

## 📊 Test Status

### Current MFA E2E Tests

The test suite includes 7 MFA tests:

| Test | Description | Status |
|------|-------------|--------|
| **1. Redirect to MFA page** | Verifies redirect to `/mfa-verify` when MFA enabled | Conditional* |
| **2. Complete MFA login** | Full login flow with valid TOTP code | Conditional* |
| **3. Invalid code error** | Shows error for invalid TOTP code | Conditional* |
| **4. Backup code toggle** | Toggle between TOTP and backup codes | Conditional* |
| **5. Back to login** | Navigate back to login page | Conditional* |
| **6. UI elements** | Verify MFA page renders correctly | ✅ Always runs |
| **7. Input validation** | Test code input format validation | Conditional* |

*\*Conditional tests automatically skip if `MFA_TEST_USER.secret` is not configured.*

### Test Behavior

- **If secret is configured:** All tests run and validate full MFA flow
- **If secret is NOT configured:** Tests skip with message: *"MFA secret not configured"*
- **UI-only test (#6):** Always runs, doesn't require backend MFA

---

## 🐛 Troubleshooting

### Tests Are Skipping

**Symptom:** Tests show as "skipped" with message about MFA secret

**Solution:** 
1. Verify `MFA_TEST_USER.secret` is not empty in `e2e/helpers.ts`
2. Check that the secret is correct (try generating a code manually)

### Invalid Code Errors

**Symptom:** Tests fail with "Invalid authentication code" errors

**Possible causes:**
1. **Secret is incorrect** - Double-check you copied it correctly
2. **Time sync issue** - TOTP codes are time-based, ensure system clock is accurate
3. **Backend MFA not enabled** - Verify MFA is enabled for test user
4. **Secret expired/regenerated** - Get a fresh secret from backend

**Solutions:**
```bash
# Check system time
date

# Sync system time (Linux)
sudo ntpdate -s time.nist.gov

# Or manually sync with NTP
sudo systemctl restart systemd-timesyncd

# Verify secret generates valid codes
node -e "
const { authenticator } = require('otplib');
const secret = 'YOUR_SECRET_HERE';
console.log('Code:', authenticator.generate(secret));
console.log('Valid for ~30 seconds');
"
```

### Backend Not Responding

**Symptom:** Tests fail with network errors or timeouts

**Solution:**
1. Verify backend is running: `curl http://localhost:8082/graphql`
2. Check backend logs for errors
3. Ensure GraphQL endpoint is accessible
4. Verify test user exists in backend database

### MFA Not Enabled in Backend

**Symptom:** Tests pass but user goes directly to `/files` instead of `/mfa-verify`

**Solution:**
1. Re-run MFA setup for test user (Step 1 above)
2. Verify `mfaEnabled` field is `true` in user data:
```graphql
query {
  me {
    email
    mfaEnabled
  }
}
```

---

## 🔐 Security Notes

### Secret Storage

- **Never commit real secrets to git**
- Use environment variables for CI/CD:
  ```bash
  export MFA_TEST_SECRET="JBSWY3DPEHPK3PXP"
  ```
- Update test to read from env:
  ```typescript
  secret: process.env.MFA_TEST_SECRET || '',
  ```

### Test User Credentials

The default test user (`testuser@example.com`) should:
- Only exist in **development/test environments**
- **Never be used in production**
- Have a **separate database** from production data

### Backup Codes

If your backend generates backup codes:
- Save them securely
- Use them as a fallback if TOTP fails
- Test them in a dedicated E2E test

---

## 📚 Helper Functions

The E2E test suite provides MFA helper functions:

### `generateTOTP(secret: string): string`

Generates a valid 6-digit TOTP code from a secret.

```typescript
import { generateTOTP } from './helpers';

const code = generateTOTP('JBSWY3DPEHPK3PXP');
console.log(code); // '123456'
```

### `loginWithMFA(page, credentials, secret): Promise<void>`

Performs complete MFA login flow.

```typescript
import { loginWithMFA, MFA_TEST_USER } from './helpers';

await loginWithMFA(page, MFA_TEST_USER, MFA_TEST_USER.secret);
// User is now logged in and on /files page
```

### `setupMfaForTestUser(page, credentials): Promise<string>`

Programmatically enables MFA for a user and returns the secret.

```typescript
import { setupMfaForTestUser } from './helpers';

const secret = await setupMfaForTestUser(page, {
  email: 'newuser@example.com',
  password: 'password123'
});
console.log('MFA Secret:', secret);
```

---

## ✅ Verification Checklist

Before running MFA E2E tests, verify:

- [ ] Backend is running on `http://localhost:8082/graphql`
- [ ] Test user `testuser@example.com` exists
- [ ] MFA is enabled for test user (`mfaEnabled: true`)
- [ ] TOTP secret is copied to `MFA_TEST_USER.secret` in `e2e/helpers.ts`
- [ ] Secret is base32 encoded (A-Z, 2-7)
- [ ] System clock is synchronized (NTP)
- [ ] Can generate valid TOTP code manually
- [ ] Frontend is running on `http://localhost:3001`
- [ ] All dependencies installed (`npm install`)

---

## 🎯 Quick Start

**Minimal setup to run MFA tests:**

```bash
# 1. Get MFA secret from backend
curl -X POST http://localhost:8082/graphql \
  -H "Authorization: Bearer $(YOUR_TOKEN)" \
  -d '{"query":"mutation { setupMfa { secret } }"}' \
  | jq -r '.data.setupMfa.secret'

# 2. Update helpers.ts with the secret
# Open e2e/helpers.ts and paste the secret

# 3. Run MFA tests
npm run test:e2e -- --grep "MFA Flow"
```

---

## 📖 Additional Resources

- **[MFA Implementation Summary](../MFA_IMPLEMENTATION_SUMMARY.md)** - Complete MFA feature documentation
- **[Quick Start Guide](../QUICK_START.md)** - General development setup
- **[Playwright Documentation](https://playwright.dev)** - Playwright testing framework docs
- **[otplib Documentation](https://github.com/yeojz/otplib)** - TOTP library used for code generation

---

**Need Help?**

If you're still having issues:
1. Check backend logs for errors
2. Verify GraphQL mutations work with tools like GraphiQL or Postman
3. Try manual MFA login via the UI first
4. Consult the team or open an issue

---

**Last Updated:** December 1, 2025  
**Status:** ✅ MFA E2E tests ready with conditional execution
