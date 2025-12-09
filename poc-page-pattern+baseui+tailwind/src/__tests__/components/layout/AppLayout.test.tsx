/**
 * Tests for AppLayout Component
 * Main layout with navigation and user menu
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppLayout } from '../../../components/layout/AppLayout';
import authReducer from '../../../store/slices/authSlice';
import mfaReducer from '../../../store/slices/mfaSlice';
import filesReducer from '../../../store/slices/filesSlice';
import { graphqlApi } from '../../../store/graphqlApi';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const createMockStore = (userOverrides = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      mfa: mfaReducer,
      files: filesReducer,
      [graphqlApi.reducerPath]: graphqlApi.reducer,
    },
    preloadedState: {
      auth: {
        token: 'mock-token',
        refreshToken: 'mock-refresh',
        user: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          roles: ['user'],
          mfaEnabled: false,
          ...userOverrides,
        },
        isAuthenticated: true,
      },
    },
  });
};

const renderWithProviders = (
  ui: React.ReactElement,
  { store = createMockStore() } = {}
) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe('AppLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render app title', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('CCAI Collections')).toBeInTheDocument();
    });

    it('should render children content', () => {
      renderWithProviders(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByRole('button', { name: 'Files' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'MFA Settings' })).toBeInTheDocument();
    });

    it('should render logout button', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  describe('User information', () => {
    it('should display user full name', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should display user email if no full name', () => {
      const store = createMockStore({ fullName: undefined });
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display user roles', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('should display multiple user roles', () => {
      const store = createMockStore({ roles: ['user', 'admin', 'moderator'] });
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      expect(screen.getByText('user, admin, moderator')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to Files page when Files button clicked', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const filesButton = screen.getByRole('button', { name: 'Files' });
      fireEvent.click(filesButton);

      expect(mockNavigate).toHaveBeenCalledWith('/files');
    });

    it('should navigate to MFA page when MFA Settings button clicked', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const mfaButton = screen.getByRole('button', { name: 'MFA Settings' });
      fireEvent.click(mfaButton);

      expect(mockNavigate).toHaveBeenCalledWith('/mfa');
    });
  });

  describe('Logout functionality', () => {
    it('should dispatch logout action when logout button clicked', () => {
      const store = createMockStore();
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Check that logout was dispatched (isAuthenticated should be false)
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
    });

    it('should navigate to login page after logout', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should clear user data after logout', () => {
      const store = createMockStore();
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.token).toBeNull();
    });
  });

  describe('Complex children', () => {
    it('should render nested children structure', () => {
      renderWithProviders(
        <AppLayout>
          <div>
            <header>
              <h1>Page Title</h1>
            </header>
            <main>
              <section>Main Content</section>
            </main>
          </div>
        </AppLayout>
      );

      expect(screen.getByRole('heading', { name: 'Page Title' })).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should render multiple child elements', () => {
      renderWithProviders(
        <AppLayout>
          <>
            <div>Child 1</div>
            <div>Child 2</div>
            <div>Child 3</div>
          </>
        </AppLayout>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle user with empty roles array', () => {
      const store = createMockStore({ roles: [] });
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      // Should render empty string without crashing
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should handle very long user names', () => {
      const longName = 'Very Long User Name That Should Still Display';
      const store = createMockStore({ fullName: longName });
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle special characters in user data', () => {
      const store = createMockStore({
        fullName: "User's Name & Co.",
        email: 'test+special@example.com',
      });
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>,
        { store }
      );

      expect(screen.getByText("User's Name & Co.")).toBeInTheDocument();
    });
  });
});
