/**
 * MFAPage Component
 * Multi-Factor Authentication setup and management page
 */

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Page } from '../components/patterns/Page';
import { PageHeader } from '../components/patterns/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { 
  useSetupMfaMutation,
  useEnableMfaMutation,
  useDisableMfaMutation 
} from '../store/graphqlApi';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  startMfaSetup, 
  setMfaDetails, 
  completeMfaSetup, 
  cancelMfaSetup 
} from '../store/slices/mfaSlice';
import { setCredentials } from '../store/slices/authSlice';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';

export function MFAPage() {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { user, token, refreshToken } = useAppSelector((state) => state.auth);
  const { qrCodeUrl, secret, backupCodes, isSetupMode } = useAppSelector((state) => state.mfa);
  
  // RTK Query mutations
  const [setupMfaMutation, { isLoading: setupLoading, error: setupError }] = useSetupMfaMutation();
  const [enableMfaMutation, { isLoading: enableLoading, error: enableError }] = useEnableMfaMutation();
  const [disableMfaMutation, { isLoading: disableLoading, error: disableError }] = useDisableMfaMutation();
  
  const [totpCode, setTotpCode] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loading = setupLoading || enableLoading || disableLoading;
  
  // Convert RTK Query error to string
  const errorMessage = setupError || enableError || disableError 
    ? ERROR_MESSAGES.GENERIC_ERROR
    : null;
  
  // Derived state - MFA setup data
  const mfaSetup = qrCodeUrl && secret ? { qrCodeUrl, secret, backupCodes } : null;

  const handleSetupMfa = async () => {
    try {
      dispatch(startMfaSetup());
      const response = await setupMfaMutation().unwrap();
      dispatch(setMfaDetails(response));
      setSuccessMessage(null);
    } catch (err) {
      dispatch(cancelMfaSetup());
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      const success = await enableMfaMutation({ totpCode }).unwrap();
      if (success) {
        dispatch(completeMfaSetup());
        setSuccessMessage(SUCCESS_MESSAGES.MFA_ENABLED);
        setTotpCode('');
        
        // Update user data to reflect MFA is enabled
        if (user && token) {
          dispatch(setCredentials({
            token,
            refreshToken: refreshToken || '',
            user: { ...user, mfaEnabled: true }
          }));
        }
      }
    } catch (err) {
      // Error is handled by RTK Query
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Are you sure you want to disable MFA?')) {
      return;
    }

    try {
      const success = await disableMfaMutation().unwrap();
      if (success) {
        dispatch(cancelMfaSetup());
        setSuccessMessage(SUCCESS_MESSAGES.MFA_DISABLED);
        
        // Update user data to reflect MFA is disabled
        if (user && token) {
          dispatch(setCredentials({
            token,
            refreshToken: refreshToken || '',
            user: { ...user, mfaEnabled: false }
          }));
        }
      }
    } catch (err) {
      // Error is handled by RTK Query
    }
  };

  return (
    <Page>
      <PageHeader
        title="Multi-Factor Authentication"
        description="Enhance your account security with two-factor authentication"
      />

      <div className="mx-auto max-w-3xl">
        {successMessage && (
          <div className="mb-6">
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
            />
          </div>
        )}

        {errorMessage && (
          <div className="mb-6">
            <Alert type="error" message={errorMessage} />
          </div>
        )}

        {/* MFA Status */}
        <div className="mb-8 rounded-lg border border-twilio-gray-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-twilio-gray-900">
                MFA Status
              </h3>
              <p className="mt-1 text-sm text-twilio-gray-600">
                {user?.mfaEnabled
                  ? 'Multi-factor authentication is currently enabled'
                  : 'Multi-factor authentication is currently disabled'}
              </p>
            </div>
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  user?.mfaEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-twilio-gray-100 text-twilio-gray-800'
                }`}
              >
                {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Setup MFA */}
        {!user?.mfaEnabled && !isSetupMode && (
          <div className="rounded-lg border border-twilio-gray-200 bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-twilio-gray-900">
              Enable MFA
            </h3>
            <p className="mt-2 text-sm text-twilio-gray-600">
              Add an extra layer of security to your account by requiring a
              verification code in addition to your password.
            </p>
            <div className="mt-4">
              <Button
                onClick={handleSetupMfa}
                disabled={loading}
                variant="primary"
              >
                {loading ? 'Setting up...' : 'Setup MFA'}
              </Button>
            </div>
          </div>
        )}

        {/* MFA Setup Process */}
        {!user?.mfaEnabled && isSetupMode && mfaSetup && (
          <div className="space-y-6">
            {/* Step 1: Scan QR Code */}
            <div className="rounded-lg border border-twilio-gray-200 bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-twilio-gray-900">
                Step 1: Scan QR Code
              </h3>
              <p className="mt-2 text-sm text-twilio-gray-600">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              <div className="mt-4 flex justify-center rounded-lg bg-white p-4">
                <QRCodeSVG value={mfaSetup.qrCodeUrl} size={200} />
              </div>
              <div className="mt-4">
                <p className="text-xs text-twilio-gray-500">
                  Or enter this code manually:
                </p>
                <code className="mt-1 block rounded bg-twilio-gray-100 px-3 py-2 text-sm font-mono">
                  {mfaSetup.secret}
                </code>
              </div>
            </div>

            {/* Step 2: Verify */}
            <div className="rounded-lg border border-twilio-gray-200 bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-twilio-gray-900">
                Step 2: Verify
              </h3>
              <p className="mt-2 text-sm text-twilio-gray-600">
                Enter the 6-digit code from your authenticator app to complete
                setup
              </p>
              <form onSubmit={handleEnableMfa} className="mt-4 space-y-4">
                <Input
                  label="Verification Code"
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <div className="flex space-x-3">
                  <Button type="submit" disabled={loading || totpCode.length !== 6}>
                    {loading ? 'Verifying...' : 'Enable MFA'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      dispatch(cancelMfaSetup());
                      setTotpCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Disable MFA */}
        {user?.mfaEnabled && (
          <div className="rounded-lg border border-twilio-gray-200 bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-twilio-gray-900">
              Disable MFA
            </h3>
            <p className="mt-2 text-sm text-twilio-gray-600">
              Disabling MFA will reduce your account security. You can re-enable
              it at any time.
            </p>
            <div className="mt-4">
              <Button
                onClick={handleDisableMfa}
                disabled={loading}
                variant="danger"
              >
                {loading ? 'Disabling...' : 'Disable MFA'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
