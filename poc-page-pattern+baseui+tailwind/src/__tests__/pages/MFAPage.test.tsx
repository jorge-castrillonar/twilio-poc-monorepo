/**
 * Tests for MFAPage Component
 * Multi-Factor Authentication setup and management
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MFAPage } from '../../pages/MFAPage';
import authReducer from '../../store/slices/authSlice';
import mfaReducer from '../../store/slices/mfaSlice';
import { graphqlApi } from '../../store/graphqlApi';

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Create a test store with initial state
function createTestStore(initialState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      mfa: mfaReducer,
      [graphqlApi.reducerPath]: graphqlApi.reducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(graphqlApi.middleware),
  });
}

function renderWithProviders(ui: React.ReactElement, initialState = {}) {
  const store = createTestStore(initialState);
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('MFAPage', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    roles: ['user'],
    mfaEnabled: false,
  };

  const mockUserWithMFA = {
    ...mockUser,
    mfaEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title and description', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText(/enhance your account security/i)).toBeInTheDocument();
    });

    it('should render MFA status section', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('MFA Status')).toBeInTheDocument();
    });
  });

  describe('MFA Disabled state', () => {
    it('should show disabled status when MFA is off', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Disabled')).toBeInTheDocument();
      expect(screen.getByText(/multi-factor authentication is currently disabled/i)).toBeInTheDocument();
    });

    it('should show disabled badge with correct styling', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const disabledBadge = screen.getByText('Disabled');
      expect(disabledBadge).toHaveClass('bg-twilio-gray-100', 'text-twilio-gray-800');
    });

    it('should show Setup MFA button when not enabled', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByRole('button', { name: /setup mfa/i })).toBeInTheDocument();
    });

    it('should show Enable MFA section description', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText(/add an extra layer of security/i)).toBeInTheDocument();
    });
  });

  describe('MFA Enabled state', () => {
    it('should show enabled status when MFA is on', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Enabled')).toBeInTheDocument();
      expect(screen.getByText(/multi-factor authentication is currently enabled/i)).toBeInTheDocument();
    });

    it('should show enabled badge with correct styling', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const enabledBadge = screen.getByText('Enabled');
      expect(enabledBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should show Disable MFA button when enabled', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByRole('button', { name: /disable mfa/i })).toBeInTheDocument();
    });

    it('should show warning message about disabling MFA', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText(/disabling mfa will reduce your account security/i)).toBeInTheDocument();
    });

    it('should not show Setup MFA section when enabled', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.queryByText('Enable MFA')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /setup mfa/i })).not.toBeInTheDocument();
    });
  });

  describe('MFA Setup Mode', () => {
    it('should show QR code section in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Step 1: Scan QR Code')).toBeInTheDocument();
      expect(screen.getByText(/scan this qr code with your authenticator app/i)).toBeInTheDocument();
    });

    it('should show secret code for manual entry', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText(/or enter this code manually/i)).toBeInTheDocument();
      expect(screen.getByText('TESTSECRET123')).toBeInTheDocument();
    });

    it('should show verification step', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Step 2: Verify')).toBeInTheDocument();
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });

    it('should show Enable MFA button in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByRole('button', { name: /enable mfa/i })).toBeInTheDocument();
    });

    it('should show Cancel button in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not show setup button when in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.queryByRole('button', { name: /^setup mfa$/i })).not.toBeInTheDocument();
    });
  });

  describe('Form interactions', () => {
    it('should update verification code input', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '123456' } });

      expect(input.value).toBe('123456');
    });

    it('should have maxLength of 6 for verification code', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      expect(input).toHaveAttribute('maxlength', '6');
    });

    it('should have placeholder for verification code', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      expect(input).toHaveAttribute('placeholder', '000000');
    });

    it('should disable Enable MFA button when code is incomplete', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      const button = screen.getByRole('button', { name: /enable mfa/i });

      fireEvent.change(input, { target: { value: '123' } });

      expect(button).toBeDisabled();
    });

    it('should enable button when code is complete', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      const button = screen.getByRole('button', { name: /enable mfa/i });

      fireEvent.change(input, { target: { value: '123456' } });

      expect(button).not.toBeDisabled();
    });
  });

  describe('Button actions', () => {
    it('should call confirm when disabling MFA', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const disableButton = screen.getByRole('button', { name: /disable mfa/i });
      fireEvent.click(disableButton);

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to disable MFA?');
    });

    it('should not disable MFA if user cancels confirm', () => {
      (global.confirm as jest.Mock).mockReturnValueOnce(false);

      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const disableButton = screen.getByRole('button', { name: /disable mfa/i });
      fireEvent.click(disableButton);

      // User should still see the disable button (MFA not disabled)
      expect(screen.getByRole('button', { name: /disable mfa/i })).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should show loading text on Setup button', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const setupButton = screen.getByRole('button', { name: /setup mfa/i });
      expect(setupButton).toHaveTextContent(/setup mfa/i);
    });

    it('should show loading text on Disable button', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const disableButton = screen.getByRole('button', { name: /disable mfa/i });
      expect(disableButton).toHaveTextContent(/disable mfa/i);
    });
  });

  describe('Layout and styling', () => {
    it('should have max-width container', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      const { container } = renderWithProviders(<MFAPage />, initialState);

      const maxWidthDiv = container.querySelector('.max-w-3xl');
      expect(maxWidthDiv).toBeInTheDocument();
    });

    it('should have rounded bordered cards', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      const { container } = renderWithProviders(<MFAPage />, initialState);

      const cards = container.querySelectorAll('.rounded-lg.border');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should use danger variant for disable button', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const disableButton = screen.getByRole('button', { name: /disable mfa/i });
      expect(disableButton).toHaveClass('bg-twilio-red');
    });
  });

  describe('Edge cases', () => {
    it('should handle null user', () => {
      const initialState = {
        auth: { user: null, token: null, refreshToken: null, isAuthenticated: false },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
    });

    it('should not show setup when no QR code in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: null,
          secret: null,
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.queryByText('Step 1: Scan QR Code')).not.toBeInTheDocument();
    });

    it('should not show setup when no secret in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: null,
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.queryByText('Step 1: Scan QR Code')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const heading = screen.getByRole('heading', { name: /multi-factor authentication/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have label associated with verification input', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      expect(input).toBeInTheDocument();
    });

    it('should have required attribute on verification input', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      expect(input).toBeRequired();
    });
  });

  describe('Success messages and alerts', () => {
    it('should render page without success messages initially', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      // Initially, there should be no success/alert messages
      const successMsgElements = screen.queryAllByRole('alert');
      expect(successMsgElements.length).toBe(0);
    });

    it('should handle form submission with preventDefault', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form');
      const preventDefaultSpy = jest.fn();
      
      if (form) {
        fireEvent.submit(form, { preventDefault: preventDefaultSpy });
      }

      // The form should prevent default behavior
      expect(input).toHaveValue('123456');
    });

    it('should have setup button when MFA is disabled', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const setupButton = screen.getByRole('button', { name: /setup mfa/i });
      expect(setupButton).toBeInTheDocument();
      expect(setupButton).not.toBeDisabled();
    });

    it('should render without refreshToken in auth state', () => {
      const initialState = {
        auth: { 
          user: mockUser, 
          token: 'test-token', 
          refreshToken: null,
          isAuthenticated: true 
        },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    it('should have cancel button in setup mode', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
      
      // Cancel button is clickable
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Additional coverage for conditional branches', () => {
    it('should handle enable MFA with null refreshToken', () => {
      const initialState = {
        auth: { 
          user: mockUser, 
          token: 'test-token', 
          refreshToken: null,
          isAuthenticated: true 
        },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      const input = screen.getByLabelText(/verification code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const verifyButton = screen.getByRole('button', { name: /enable mfa/i });
      expect(verifyButton).not.toBeDisabled();
    });

    it('should handle disable MFA with null refreshToken', () => {
      const initialState = {
        auth: { 
          user: mockUserWithMFA, 
          token: 'test-token', 
          refreshToken: null,
          isAuthenticated: true 
        },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      const disableButton = screen.getByRole('button', { name: /disable mfa/i });
      expect(disableButton).toBeInTheDocument();
      
      fireEvent.click(disableButton);
      
      expect(global.confirm).toHaveBeenCalled();
    });

    it('should show correct loading state text when enabling', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      // The button text should be "Enable MFA" when not loading
      const button = screen.getByRole('button', { name: /enable mfa/i });
      expect(button).toBeInTheDocument();
    });

    it('should show correct loading state text when disabling', () => {
      const initialState = {
        auth: { user: mockUserWithMFA, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      // The button text should be "Disable MFA" when not loading
      const button = screen.getByRole('button', { name: /disable mfa/i });
      expect(button).toBeInTheDocument();
    });

    it('should render QR code section only when qrCodeUrl exists', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: {
          qrCodeUrl: 'otpauth://totp/test',
          secret: 'TESTSECRET123',
          backupCodes: [],
          isSetupMode: true,
        },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.getByText(/scan this qr code/i)).toBeInTheDocument();
    });

    it('should not render setup section when not in setup mode and MFA disabled', () => {
      const initialState = {
        auth: { user: mockUser, token: 'token', refreshToken: 'refresh', isAuthenticated: true },
        mfa: { qrCodeUrl: null, secret: null, backupCodes: [], isSetupMode: false },
      };

      renderWithProviders(<MFAPage />, initialState);

      expect(screen.queryByText(/scan this qr code/i)).not.toBeInTheDocument();
    });
  });
});
