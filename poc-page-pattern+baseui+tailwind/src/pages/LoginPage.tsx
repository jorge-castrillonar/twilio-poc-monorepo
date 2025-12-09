/**
 * LoginPage Component
 * User login page with form validation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/graphqlApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ROUTES, ERROR_MESSAGES } from '../constants';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // RTK Query mutation - handles loading state automatically
  const [loginMutation, { isLoading: loading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Mutation automatically updates authSlice via extraReducers
      const result = await loginMutation({ email, password }).unwrap();
      
      // Check if MFA is required
      if (result.mfaRequired) {
        // Redirect to MFA verification page with credentials in state
        navigate(ROUTES.MFA_VERIFICATION, {
          state: { email, password }
        });
      } else {
        // Normal login success, go to files page
        navigate(ROUTES.FILES);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.UNAUTHORIZED;
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-twilio-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-twilio-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-twilio-gray-600">
            CCAI Collections - File Management System
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

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="testuser@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          {/* Test Credentials Info */}
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
                <h3 className="text-sm font-medium text-blue-800">Test Credentials</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Email: testuser@example.com</p>
                  <p>Password: Test123!</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
