/**
 * AuthGuard Component
 * Enhanced route protection with token validation and auto-refresh
 * 
 * Features:
 * - Validates token on mount
 * - Triggers refresh if token expired/expiring
 * - Shows loading state during validation
 * - Redirects to login on failure
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional redirect path if not authenticated */
  redirectTo?: string;
  /** Show loading spinner during validation (default: true) */
  showLoadingSpinner?: boolean;
}

/**
 * AuthGuard wraps protected routes and ensures valid authentication
 * 
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ 
  children, 
  redirectTo = ROUTES.LOGIN,
  showLoadingSpinner = true 
}: AuthGuardProps) {
  const { isAuthenticated, ensureValidToken, isRefreshing } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [validationFailed, setValidationFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const validateAuth = async () => {
      try {
        setIsValidating(true);
        setValidationFailed(false);

        // Check if user is authenticated and token is valid
        if (!isAuthenticated) {
          setValidationFailed(true);
          return;
        }

        // Ensure token is valid (will refresh if needed)
        const isValid = await ensureValidToken();
        
        if (mounted) {
          if (!isValid) {
            setValidationFailed(true);
          }
        }
      } catch (error) {
        console.error('[AuthGuard] Token validation error:', error);
        if (mounted) {
          setValidationFailed(true);
        }
      } finally {
        if (mounted) {
          setIsValidating(false);
        }
      }
    };

    validateAuth();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, ensureValidToken]);

  // Show loading state during initial validation
  if (isValidating || isRefreshing) {
    if (!showLoadingSpinner) {
      return null;
    }
    
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        role="status"
        aria-live="polite"
        aria-label="Validating authentication"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Redirect if validation failed or not authenticated
  if (validationFailed || !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Legacy ProtectedRoute wrapper for backward compatibility
 * @deprecated Use AuthGuard instead
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
