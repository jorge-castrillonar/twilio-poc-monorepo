/**
 * Test Users Configuration
 * Define multiple test users with different roles and MFA configurations
 */

export interface TestUser {
  email: string;
  password: string;
  roles: string[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  displayName: string;
  description: string;
}

/**
 * Test user accounts for E2E testing
 * 
 * Setup Instructions:
 * 1. Basic User (no MFA): Already exists - testuser@example.com
 * 2. MFA User: Run ./scripts/reset-mfa-for-e2e.sh to enable MFA
 * 3. Admin User: Create in backend with admin role
 */
export const TEST_USERS = {
  BASIC_USER: {
    email: 'testuser@example.com',
    password: 'Test123!',
    roles: ['USER'],
    mfaEnabled: false,
    displayName: 'Basic User',
    description: 'Standard user without MFA'
  } as TestUser,

  MFA_USER: {
    email: 'testuser@example.com', // Same user, but with MFA enabled
    password: 'Test123!',
    roles: ['USER'],
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    displayName: 'MFA User',
    description: 'User with MFA enabled'
  } as TestUser,

  // Future: Add admin user when backend supports it
  ADMIN_USER: {
    email: 'admin@example.com',
    password: 'Admin123!',
    roles: ['USER', 'ADMIN'],
    mfaEnabled: false,
    displayName: 'Admin User',
    description: 'Admin user without MFA'
  } as TestUser,

  // Future: Add admin with MFA
  ADMIN_MFA_USER: {
    email: 'admin@example.com',
    password: 'Admin123!',
    roles: ['USER', 'ADMIN'],
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXQ',
    displayName: 'Admin MFA User',
    description: 'Admin user with MFA enabled'
  } as TestUser,
};

/**
 * Get test user by type
 */
export function getTestUser(userType: keyof typeof TEST_USERS): TestUser {
  return TEST_USERS[userType];
}

/**
 * Check if user should be skipped based on backend configuration
 */
export function shouldSkipUser(user: TestUser, actualMfaState: boolean): { skip: boolean; reason: string } {
  if (user.mfaEnabled && !actualMfaState) {
    return {
      skip: true,
      reason: `Test requires MFA enabled. Run: ./scripts/reset-mfa-for-e2e.sh`
    };
  }
  if (!user.mfaEnabled && actualMfaState) {
    return {
      skip: true,
      reason: `Test requires MFA disabled. Run: docker exec auth-db psql -U authservice -d authdb -c "DELETE FROM mfa_secrets WHERE user_id = '3905778a-1e75-4f67-9f89-a33af54e522d';"`
    };
  }
  return { skip: false, reason: '' };
}
