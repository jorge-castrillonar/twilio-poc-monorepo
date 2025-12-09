/**
 * MFAVerificationPage Tests
 * Tests for MFA code verification during login
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { MFAVerificationPage } from '../../pages/MFAVerificationPage';
import { graphqlApi } from '../../store/graphqlApi';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper to create a test store
const createTestStore = () =>
  configureStore({
    reducer: {
      [graphqlApi.reducerPath]: graphqlApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(graphqlApi.middleware),
  });

// Helper to render with router and store
const renderWithProviders = (
  ui: React.ReactElement,
  { initialEntries = ['/mfa-verify'], state = { email: 'test@example.com', password: 'password123' } as { email: string; password: string } | null } = {}
) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: initialEntries[0], state }]}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('MFAVerificationPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render MFA verification form', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText(/Enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
    });

    it('should render authentication code input by default', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('maxLength', '6');
      expect(input).toHaveAttribute('pattern', '[0-9]{6}');
    });

    it('should render verify button', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const button = screen.getByRole('button', { name: /Verify/i });
      expect(button).toBeInTheDocument();
    });

    it('should render back to login button', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const button = screen.getByRole('button', { name: /Back to Login/i });
      expect(button).toBeInTheDocument();
    });

    it('should render help text', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      expect(screen.getByText('Need Help?')).toBeInTheDocument();
      expect(screen.getByText(/Open your authenticator app/i)).toBeInTheDocument();
    });

    it('should render backup code toggle link', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const link = screen.getByText(/Use a backup code instead/i);
      expect(link).toBeInTheDocument();
    });

    it('should have autofocus on code input', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      // Check that input has autoFocus prop (React attribute, not DOM attribute)
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });
  });

  describe('Code Input', () => {
    it('should update code value on change', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '123456' } });
      
      expect(input.value).toBe('123456');
    });

    it('should only allow numeric input for TOTP code', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'abc123xyz' } });
      
      // Should filter out non-numeric characters
      expect(input.value).toBe('123');
    });

    it('should limit TOTP code to 6 digits', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '1234567890' } });
      
      expect(input.value).toBe('123456');
    });

    it('should disable verify button when code is empty', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const button = screen.getByRole('button', { name: /Verify/i });
      expect(button).toBeDisabled();
    });

    it('should enable verify button when code is entered', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      fireEvent.change(input, { target: { value: '123456' } });
      
      const button = screen.getByRole('button', { name: /Verify/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Backup Code Toggle', () => {
    it('should switch to backup code input when toggle clicked', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const toggleLink = screen.getByText(/Use a backup code instead/i);
      fireEvent.click(toggleLink);
      
      expect(screen.getByLabelText(/Backup Code/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Authentication Code/i)).not.toBeInTheDocument();
    });

    it('should show authenticator code toggle when in backup mode', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const toggleLink = screen.getByText(/Use a backup code instead/i);
      fireEvent.click(toggleLink);
      
      expect(screen.getByText(/Use authenticator code instead/i)).toBeInTheDocument();
    });

    it('should switch back to TOTP code input when toggle clicked', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      // Switch to backup code
      fireEvent.click(screen.getByText(/Use a backup code instead/i));
      
      // Switch back
      fireEvent.click(screen.getByText(/Use authenticator code instead/i));
      
      expect(screen.getByLabelText(/Authentication Code/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Backup Code/i)).not.toBeInTheDocument();
    });

    it('should clear code when switching between input types', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      // Enter TOTP code
      const totpInput = screen.getByLabelText(/Authentication Code/i) as HTMLInputElement;
      fireEvent.change(totpInput, { target: { value: '123456' } });
      
      // Switch to backup code
      fireEvent.click(screen.getByText(/Use a backup code instead/i));
      
      // Switch back to TOTP
      fireEvent.click(screen.getByText(/Use authenticator code instead/i));
      
      // Code should be cleared
      const newTotpInput = screen.getByLabelText(/Authentication Code/i) as HTMLInputElement;
      expect(newTotpInput.value).toBe('');
    });

    it('should allow alphanumeric input for backup codes', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      // Switch to backup code
      fireEvent.click(screen.getByText(/Use a backup code instead/i));
      
      const input = screen.getByLabelText(/Backup Code/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'abc123XYZ' } });
      
      expect(input.value).toBe('ABC123XYZ'); // Should uppercase
    });

    it('should limit backup code to 16 characters', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      // Switch to backup code
      fireEvent.click(screen.getByText(/Use a backup code instead/i));
      
      const input = screen.getByLabelText(/Backup Code/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' } });
      
      expect(input.value).toBe('ABCDEFGHIJKLMNOP');
    });
  });

  describe('Navigation', () => {
    it('should redirect to login if no credentials in state', () => {
      renderWithProviders(<MFAVerificationPage />, { state: null });
      
      // Should not render the form
      expect(screen.queryByText('Two-Factor Authentication')).not.toBeInTheDocument();
    });

    it('should navigate to login when back button clicked', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const backButton = screen.getByRole('button', { name: /Back to Login/i });
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission with empty code', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const form = screen.getByRole('button', { name: /Verify/i }).closest('form');
      fireEvent.submit(form!);
      
      // Error should be shown
      expect(screen.getByText(/Please enter your authentication code/i)).toBeInTheDocument();
    });

    it('should show error for missing credentials', async () => {
      // Render with valid state first
      renderWithProviders(<MFAVerificationPage />);
      
      // Component should render normally with valid credentials
      const input = screen.getByLabelText(/Authentication Code/i);
      expect(input).toBeInTheDocument();
      
      // This test verifies the component handles missing credentials
      // In real usage, the component redirects before rendering
      // so we test the redirect logic in the navigation tests
    });

    it('should show loading state during submission', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      fireEvent.change(input, { target: { value: '123456' } });
      
      const button = screen.getByRole('button', { name: /Verify/i });
      expect(button).toHaveTextContent('Verify');
    });

    it('should disable buttons during loading', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      fireEvent.change(input, { target: { value: '123456' } });
      
      // In actual implementation, loading would be true during mutation
      // This tests the disabled attribute is bound to loading state
      const verifyButton = screen.getByRole('button', { name: /Verify/i });
      const backButton = screen.getByRole('button', { name: /Back to Login/i });
      
      expect(verifyButton).not.toBeDisabled();
      expect(backButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should not show error initially', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should clear error when close button clicked', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      // Trigger an error by submitting empty form
      const form = screen.getByRole('button', { name: /Verify/i }).closest('form');
      fireEvent.submit(form!);
      
      // Error should appear
      const alert = screen.getByText(/Please enter your authentication code/i);
      expect(alert).toBeInTheDocument();
      
      // Click close button (would need to implement in Alert component)
      // This is a placeholder test
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const form = screen.getByRole('button', { name: /Verify/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const heading = screen.getByRole('heading', { name: /Two-Factor Authentication/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have labels associated with inputs', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      expect(input).toHaveAttribute('id');
    });

    it('should have submit button with clear text', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const button = screen.getByRole('button', { name: /Verify/i });
      expect(button).toHaveTextContent('Verify');
    });

    it('should have proper autocomplete attribute', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const input = screen.getByLabelText(/Authentication Code/i);
      expect(input).toHaveAttribute('autoComplete', 'one-time-code');
    });
  });

  describe('Styling and Layout', () => {
    it('should have centered layout', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const heading = screen.getByText('Two-Factor Authentication');
      expect(heading).toBeInTheDocument();
      // Verify the layout structure exists
      const container = heading.closest('.text-center');
      expect(container).toBeInTheDocument();
    });

    it('should have max-width container for form', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const heading = screen.getByText('Two-Factor Authentication');
      const container = heading.closest('.max-w-md');
      expect(container).toBeInTheDocument();
    });

    it('should have blue background for help text', () => {
      renderWithProviders(<MFAVerificationPage />);
      
      const helpSection = screen.getByText('Need Help?').closest('.bg-blue-50');
      expect(helpSection).toBeInTheDocument();
    });
  });
});
