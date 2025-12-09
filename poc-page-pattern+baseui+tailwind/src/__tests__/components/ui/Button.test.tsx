/**
 * Button Component Tests
 * Tests for Base UI Button component wrapper
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('applies primary variant styles', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-twilio-blue');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-twilio-gray-200');
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-twilio-red');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-xs', 'px-3', 'py-1.5');
    });

    it('applies medium size styles (default)', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm', 'px-4', 'py-2');
    });

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-base', 'px-6', 'py-3');
    });
  });

  describe('Interaction', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styles with data-disabled attribute', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-disabled');
    });
  });

  describe('Base UI Features', () => {
    it('can be focusable when disabled (Base UI feature)', () => {
      render(<Button disabled focusableWhenDisabled>Focusable</Button>);
      const button = screen.getByRole('button');
      // Base UI with focusableWhenDisabled uses aria-disabled instead of disabled
      expect(button).toHaveAttribute('aria-disabled', 'true');
      // Maintains tab index for keyboard navigation
      expect(button).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Full Width', () => {
    it('applies full width styles when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Custom ClassName', () => {
    it('merges custom className with default styles', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('rounded-md'); // Default class
    });
  });
});
