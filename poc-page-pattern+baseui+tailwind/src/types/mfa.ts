/**
 * Multi-Factor Authentication Types
 * Type definitions for MFA operations (used by Redux and hooks)
 * 
 * Note: MFA logic has been migrated to:
 * - Redux: src/store/slices/mfaSlice.ts
 * - RTK Query: src/store/graphqlApi.ts (useSetupMfaMutation, useEnableMfaMutation, useDisableMfaMutation)
 * - Hooks: src/hooks/useMfa.ts
 */

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MfaEnableRequest {
  totpCode: string;
}

export interface MfaResponse {
  success: boolean;
  message?: string;
}

/**
 * @deprecated All MFA functions have been migrated to RTK Query
 * Use the following instead:
 * - useSetupMfaMutation() for setup
 * - useEnableMfaMutation() for enable
 * - useDisableMfaMutation() for disable
 * 
 * Or use the useMfa() hook for a complete MFA interface
 */
