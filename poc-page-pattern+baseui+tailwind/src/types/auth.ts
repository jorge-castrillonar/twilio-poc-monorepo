/**
 * Authentication Types
 * Type definitions for authentication (used by Redux and hooks)
 * 
 * Note: Authentication logic has been migrated to:
 * - Redux: src/store/slices/authSlice.ts
 * - RTK Query: src/store/graphqlApi.ts (useLoginMutation)
 * - Token Storage: src/utils/tokenManager.ts (secure storage)
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  status: string;
  mfaEnabled: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string; // Optional 6-digit TOTP code or backup code (required when mfaRequired=true)
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  mfaRequired: boolean; // True when user has MFA enabled and code not provided
}

/**
 * @deprecated Use Redux state from authSlice instead
 * Legacy functions below are kept for backward compatibility only
 * They should NOT be used in new code
 */

// Re-export for compatibility (will be removed in future)
export { tokenManager } from '../utils/tokenManager';

/**
 * @deprecated Use useAppSelector((state) => state.auth.isAuthenticated) instead
 */
export function isAuthenticated(): boolean {
  console.warn('isAuthenticated() is deprecated. Use Redux state instead.');
  return false; // Always return false to force migration
}
