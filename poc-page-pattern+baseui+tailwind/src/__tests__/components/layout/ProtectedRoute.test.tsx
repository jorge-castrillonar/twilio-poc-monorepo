/**
 * Tests for ProtectedRoute Component
 * Route wrapper that requires authentication
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import authReducer from '../../../store/slices/authSlice';
import mfaReducer from '../../../store/slices/mfaSlice';
import filesReducer from '../../../store/slices/filesSlice';
import { graphqlApi } from '../../../store/graphqlApi';

const createMockStore = (isAuthenticated: boolean) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      mfa: mfaReducer,
      files: filesReducer,
      [graphqlApi.reducerPath]: graphqlApi.reducer,
    },
    preloadedState: {
      auth: {
        token: isAuthenticated ? 'mock-token' : null,
        refreshToken: isAuthenticated ? 'mock-refresh' : null,
        user: isAuthenticated
          ? {
              id: '1',
              email: 'test@example.com',
              fullName: 'Test User',
              roles: ['user'],
              mfaEnabled: false,
            }
          : null,
        isAuthenticated,
      },
    },
  });
};

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const LoginComponent = () => <div>Login Page</div>;

  const renderWithRouter = (isAuthenticated: boolean) => {
    const store = createMockStore(isAuthenticated);

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  };

  describe('When authenticated', () => {
    it('should render children when user is authenticated', () => {
      renderWithRouter(true);
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not redirect to login when authenticated', () => {
      renderWithRouter(true);
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should render complex children content', () => {
      const store = createMockStore(true);

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div>
                      <h1>Dashboard</h1>
                      <p>Welcome back!</p>
                      <button>Action</button>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('When not authenticated', () => {
    it('should redirect to login when user is not authenticated', () => {
      renderWithRouter(false);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should not render protected content when not authenticated', () => {
      renderWithRouter(false);
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication state changes', () => {
    it('should handle initial unauthenticated state', () => {
      const store = createMockStore(false);

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginComponent />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle null children gracefully', () => {
      const store = createMockStore(true);

      render(
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<ProtectedRoute>{null}</ProtectedRoute>}
              />
            </Routes>
          </BrowserRouter>
        </Provider>
      );

      // Should not crash
      expect(true).toBe(true);
    });

    it('should handle fragment children', () => {
      const store = createMockStore(true);

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ProtectedRoute>
              <>
                <div>Part 1</div>
                <div>Part 2</div>
              </>
            </ProtectedRoute>
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByText('Part 1')).toBeInTheDocument();
      expect(screen.getByText('Part 2')).toBeInTheDocument();
    });
  });
});
