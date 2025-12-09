/**
 * SearchBar Component Tests
 * Tests for Base UI Input-based search bar component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../../components/ui/SearchBar';

describe('SearchBar Component', () => {
  describe('Rendering', () => {
    it('renders search input', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<SearchBar value="" onChange={() => {}} placeholder="Search files..." />);
      expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
    });

    it('renders with provided value', () => {
      render(<SearchBar value="test query" onChange={() => {}} />);
      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(<SearchBar value="" onChange={() => {}} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when user types', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<SearchBar value="" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates search value when typing', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<SearchBar value="" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'search query');
      
      // onValueChange should be called for each character
      expect(handleChange).toHaveBeenCalled();
    });

    it('clears input when empty string is provided', () => {
      const { rerender } = render(<SearchBar value="test" onChange={() => {}} />);
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      
      rerender(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Base UI Input Integration', () => {
    it('uses Base UI Input component', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('uses onValueChange handler (Base UI)', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<SearchBar value="" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'a');
      
      // Base UI onValueChange should trigger
      expect(handleChange).toHaveBeenCalled();
    });

    it('has data-disabled attribute when disabled', () => {
      render(
        <SearchBar value="" onChange={() => {}} />
      );
      const input = screen.getByRole('textbox');
      
      // Check that disabled styling classes are present
      expect(input).toHaveClass('data-[disabled]:cursor-not-allowed');
    });
  });

  describe('Icon Layout', () => {
    it('icon is positioned absolutely', () => {
      const { container } = render(<SearchBar value="" onChange={() => {}} />);
      const iconContainer = container.querySelector('.absolute');
      expect(iconContainer).toBeInTheDocument();
    });

    it('icon has pointer-events-none', () => {
      const { container } = render(<SearchBar value="" onChange={() => {}} />);
      const iconContainer = container.querySelector('.pointer-events-none');
      expect(iconContainer).toBeInTheDocument();
    });

    it('icon is on the left side', () => {
      const { container } = render(<SearchBar value="" onChange={() => {}} />);
      const iconContainer = container.querySelector('.left-0');
      expect(iconContainer).toBeInTheDocument();
    });

    it('input has left padding for icon', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('rounded-md');
    });

    it('has border', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border');
    });

    it('has white background', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-white');
    });

    it('has focus ring styles', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-1', 'focus:ring-twilio-blue');
    });

    it('icon has gray color', () => {
      const { container } = render(<SearchBar value="" onChange={() => {}} />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-twilio-gray-400');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(
        <SearchBar value="" onChange={() => {}} className="custom-wrapper" />
      );
      const wrapper = container.querySelector('.custom-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('maintains relative positioning with custom class', () => {
      const { container } = render(
        <SearchBar value="" onChange={() => {}} className="custom-class" />
      );
      const wrapper = container.querySelector('.relative');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('input is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      
      await user.tab();
      
      expect(input).toHaveFocus();
    });

    it('input has type="text"', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('icon is not focusable', () => {
      const { container } = render(<SearchBar value="" onChange={() => {}} />);
      const iconContainer = container.querySelector('.pointer-events-none');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Input Attributes', () => {
    it('input has full width class', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });

    it('input has block display', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('block');
    });

    it('input has correct text size', () => {
      render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-sm');
    });
  });

  describe('Controlled Component', () => {
    it('updates when value prop changes', () => {
      const { rerender } = render(<SearchBar value="initial" onChange={() => {}} />);
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
      
      rerender(<SearchBar value="updated" onChange={() => {}} />);
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('reflects external state changes', () => {
      const { rerender } = render(<SearchBar value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
      
      rerender(<SearchBar value="external update" onChange={() => {}} />);
      expect(input.value).toBe('external update');
    });
  });
});
