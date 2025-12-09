/**
 * Input Component Tests
 * Tests for Base UI Field-based input component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../../components/ui/Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email Address" />);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Input defaultValue="test@example.com" />);
      const input = screen.getByDisplayValue('test@example.com');
      expect(input).toBeInTheDocument();
    });

    it('renders with controlled value', () => {
      render(<Input value="controlled@example.com" onChange={() => {}} />);
      expect(screen.getByDisplayValue('controlled@example.com')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input label="Password" helperText="Must be at least 8 characters" />);
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('applies Field.Description styling to helper text', () => {
      render(<Input helperText="Helper message" />);
      const helperText = screen.getByText('Helper message');
      expect(helperText).toHaveClass('text-xs', 'text-twilio-gray-500');
    });

    it('does not show helper text when error is present', () => {
      render(<Input helperText="Helper text" error="Error message" />);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('renders error message when provided', () => {
      render(<Input label="Email" error="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('applies Field.Error styling to error message', () => {
      render(<Input error="Invalid email" />);
      const errorMessage = screen.getByText('Invalid email');
      expect(errorMessage).toHaveClass('text-xs', 'text-twilio-red');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('input has data-invalid attribute when error exists', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-invalid');
    });
  });

  describe('Required Field', () => {
    it('applies required attribute to input', () => {
      render(<Input label="Email" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('works with form validation', () => {
      render(
        <form>
          <Input label="Email" required />
        </form>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input label="Email" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('has data-disabled attribute when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-disabled');
    });

    it('applies disabled cursor styling', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Input Types', () => {
    it('renders as email input', () => {
      render(<Input label="Email" type="email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as password input', () => {
      render(<Input label="Password" type="password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders as number input', () => {
      render(<Input label="Age" type="number" />);
      const input = screen.getByLabelText('Age');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when user types', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input label="Email" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // one per character
    });

    it('updates value when user types (uncontrolled)', async () => {
      const user = userEvent.setup();
      
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'test@example.com');
      
      expect(input.value).toBe('test@example.com');
    });

    it('calls onBlur when input loses focus', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(<Input label="Email" onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus when input gains focus', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<Input label="Email" onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('Base UI Field Features', () => {
    it('uses Field.Root as wrapper', () => {
      const { container } = render(<Input label="Email" />);
      // Field.Root should be present in the structure
      expect(container.querySelector('[class*="w-full"]')).toBeInTheDocument();
    });

    it('uses Field.Label for label', () => {
      render(<Input label="Email Address" />);
      const label = screen.getByText('Email Address');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('text-sm', 'font-medium');
    });

    it('uses Field.Control for input', () => {
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      // Field.Control renders the input with data attributes
      expect(input).toBeInTheDocument();
    });

    it('uses Field.Error for error messages', () => {
      render(<Input error="Error message" />);
      const error = screen.getByText('Error message');
      // Field.Error should be rendered
      expect(error).toBeInTheDocument();
    });

    it('uses Field.Description for helper text', () => {
      render(<Input helperText="Helper text" />);
      const description = screen.getByText('Helper text');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input via htmlFor/id', () => {
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email');
      
      expect(label).toHaveAttribute('for', input.id);
    });

    it('has aria-invalid when error is present', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('can be focused via keyboard', async () => {
      const user = userEvent.setup();
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      
      await user.tab();
      
      expect(input).toHaveFocus();
    });
  });

  describe('Custom ClassName', () => {
    it('merges custom className with default styles', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('rounded-md'); // Default class
    });
  });

  describe('Additional Props', () => {
    it('forwards additional HTML props to input', () => {
      render(
        <Input 
          label="Email" 
          autoComplete="email"
          data-testid="email-input"
        />
      );
      const input = screen.getByTestId('email-input');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });

    it('supports maxLength prop', () => {
      render(<Input label="Username" maxLength={20} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxlength', '20');
    });

    it('supports name prop', () => {
      render(<Input name="email" label="Email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });
  });
});
