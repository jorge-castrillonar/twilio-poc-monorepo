/**
 * AuthGuard Component Tests
 * Tests for enhanced route protection with token validation
 */

import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../../../components/layout/AuthGuard';
import { useAuth } from '../../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Helper to flush promises
const flushPromises = () => act(async () => {});

// Mock components
const ProtectedContent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

describe('AuthGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication validation', () => {
    it('should show loading spinner during validation', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(true)),
        isRefreshing: false,
      } as any);

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Should show loading initially
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render protected content when validation succeeds', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(true)),
        isRefreshing: false,
      } as any);

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Flush promises to complete async validation
      await flushPromises();

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should redirect to login when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(false)),
        isRefreshing: false,
      } as any);

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('should redirect to login when validation fails', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(false)),
        isRefreshing: false,
      } as any);

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading spinner when isRefreshing is true', async () => {
      // Use a promise that doesn't resolve immediately
      const slowPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 100);
      });

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn().mockReturnValue(slowPromise),
        isRefreshing: true,
      } as any);

      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Spinner should be visible when isRefreshing is true
      await waitFor(() => {
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });

    it('should not show loading spinner when showLoadingSpinner is false', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(true)),
        isRefreshing: false,
      } as any);

      const { container } = render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard showLoadingSpinner={false}>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // Should not show spinner even during initial render
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should have proper accessibility attributes on loading spinner', async () => {
      // Use a slow-resolving promise to keep loading state visible
      const slowPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 100);
      });

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn().mockReturnValue(slowPromise),
        isRefreshing: false,
      } as any);

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Loading container should be visible during validation
      await waitFor(() => {
        const loadingContainer = screen.queryByRole('status');
        expect(loadingContainer).toBeInTheDocument();
        expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
        expect(loadingContainer).toHaveAttribute('aria-label', 'Validating authentication');
      });
    });
  });

  describe('Custom redirect', () => {
    it('should redirect to custom path when specified', async () => {
      const CustomLogin = () => <div>Custom Login</div>;

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(false)),
        isRefreshing: false,
      } as any);

      // Use MemoryRouter with initialEntries instead of BrowserRouter
      const { MemoryRouter } = require('react-router-dom');
      
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard redirectTo="/custom-login">
                  <ProtectedContent />
                </AuthGuard>
              }
            />
            <Route path="/custom-login" element={<CustomLogin />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for redirect to complete
      await waitFor(() => {
        expect(screen.getByText('Custom Login')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.reject(new Error('Validation error'))),
        isRefreshing: false,
      } as any);

      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Flush promises to allow the error to be caught
      await flushPromises();

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });

      // Check if console.error was called at least once
      expect(consoleError).toHaveBeenCalled();
      // Check the call contains the expected error message
      const errorCalls = consoleError.mock.calls;
      const hasAuthGuardError = errorCalls.some(call => 
        call[0]?.includes && call[0].includes('[AuthGuard] Token validation error:')
      );
      expect(hasAuthGuardError).toBe(true);

      consoleError.mockRestore();
    });
  });

  describe('Backward compatibility', () => {
    it('should provide ProtectedRoute wrapper', async () => {
      const { ProtectedRoute } = require('../../../components/layout/AuthGuard');

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(true)),
        isRefreshing: false,
      } as any);

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Flush promises to complete async validation
      await flushPromises();

      // Wait for validation to complete and content to render
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Component lifecycle', () => {
    it('should call ensureValidToken on mount', async () => {
      const mockEnsureValidToken = jest.fn(() => Promise.resolve(true));

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: mockEnsureValidToken,
        isRefreshing: false,
      } as any);

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Flush promises to complete async validation
      await flushPromises();

      // Wait for loading spinner to disappear first
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Then wait for the component to complete validation
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(mockEnsureValidToken).toHaveBeenCalled();
    });

    it('should cleanup properly on unmount', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        logout: jest.fn(),
        refreshTokens: jest.fn(),
        ensureValidToken: jest.fn(() => Promise.resolve(true)),
        isRefreshing: false,
      } as any);

      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Flush promises to complete async validation
      await flushPromises();

      // Wait for loading spinner to disappear
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Wait for content to render
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
