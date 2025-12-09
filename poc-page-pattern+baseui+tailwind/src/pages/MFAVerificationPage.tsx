/**
 * MFAVerificationPage Component
 * Page for verifying MFA code during login
 * 
 * This page is shown when a user with MFA enabled attempts to login.
 * It receives email/password via React Router state and calls the login mutation with mfaCode.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoginMutation } from '../store/graphqlApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ROUTES } from '../constants';

interface LocationState {
  email: string;
  password: string;
}

export function MFAVerificationPage() {
  const [code, setCode] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loginMutation, { isLoading: loading }] = useLoginMutation();
  
  // Get credentials from location state
  const state = location.state as LocationState | null;

  // Redirect to login if no credentials provided
  useEffect(() => {
    if (!state?.email || !state?.password) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [state, navigate]);

  // Clear credentials from memory on unmount
  useEffect(() => {
    return () => {
      // Cleanup sensitive data
      setCode('');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Please enter your authentication code');
      return;
    }

    if (!state?.email || !state?.password) {
      setError('Session expired. Please login again.');
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      // Call login mutation with mfaCode
      const result = await loginMutation({ 
        email: state.email, 
        password: state.password,
        mfaCode: code.trim()
      }).unwrap();

      // If mfaRequired is still true, something went wrong
      if (result.mfaRequired) {
        setError('Invalid authentication code. Please try again.');
        return;
      }

      // Success! Navigate to files page
      navigate(ROUTES.FILES);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid authentication code';
      setError(message);
      setCode(''); // Clear the code on error
    }
  };

  const handleBackToLogin = () => {
    // Clear sensitive data and go back to login
    setCode('');
    navigate(ROUTES.LOGIN);
  };

  // Don't render if no credentials (will redirect)
  if (!state?.email || !state?.password) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-twilio-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-twilio-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-twilio-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {!showBackupCode ? (
              <>
                <Input
                  label="Authentication Code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    // Only allow digits, max 6 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  placeholder="000000"
                  required
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowBackupCode(true)}
                    className="text-sm text-twilio-blue-600 hover:text-twilio-blue-800 underline"
                  >
                    Use a backup code instead
                  </button>
                </div>
              </>
            ) : (
              <>
                <Input
                  label="Backup Code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    // Allow alphanumeric for backup codes
                    const value = e.target.value.toUpperCase().slice(0, 16);
                    setCode(value);
                  }}
                  placeholder="XXXXXXXX"
                  required
                  autoFocus
                  maxLength={16}
                />
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBackupCode(false);
                      setCode('');
                    }}
                    className="text-sm text-twilio-blue-600 hover:text-twilio-blue-800 underline"
                  >
                    Use authenticator code instead
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading || !code.trim()}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleBackToLogin}
              disabled={loading}
            >
              Back to Login
            </Button>
          </div>

          {/* Help text */}
          <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.</p>
                  <p className="mt-2">If you don't have access to your authenticator app, use one of your backup codes.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
