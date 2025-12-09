/**
 * Alert Component Tests
 * Tests for alert/notification component with Base UI Button
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../../../components/ui/Alert';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('renders alert with message', () => {
      render(<Alert type="info" message="This is an alert" />);
      expect(screen.getByText('This is an alert')).toBeInTheDocument();
    });

    it('renders with title and message', () => {
      render(<Alert type="info" title="Alert Title" message="Alert message" />);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('renders without title', () => {
      render(<Alert type="info" message="Just a message" />);
      expect(screen.getByText('Just a message')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Type Variants', () => {
    it('renders success variant with green colors', () => {
      const { container } = render(<Alert type="success" message="Success!" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('renders error variant with red colors', () => {
      const { container } = render(<Alert type="error" message="Error!" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('renders warning variant with yellow colors', () => {
      const { container } = render(<Alert type="warning" message="Warning!" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('renders info variant with blue colors', () => {
      const { container } = render(<Alert type="info" message="Info!" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('Icons', () => {
    it('renders success icon', () => {
      const { container } = render(<Alert type="success" message="Success" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5');
    });

    it('renders error icon', () => {
      const { container } = render(<Alert type="error" message="Error" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders warning icon', () => {
      const { container } = render(<Alert type="warning" message="Warning" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders info icon', () => {
      const { container } = render(<Alert type="info" message="Info" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('icon has correct color class for success', () => {
      const { container } = render(<Alert type="success" message="Success" />);
      const iconContainer = container.querySelector('.text-green-600');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('shows close button when onClose is provided', () => {
      render(<Alert type="info" message="Alert" onClose={() => {}} />);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('does not show close button when onClose is not provided', () => {
      render(<Alert type="info" message="Alert" />);
      const closeButton = screen.queryByRole('button');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();
      
      render(<Alert type="info" message="Alert" onClose={handleClose} />);
      const closeButton = screen.getByRole('button');
      
      await user.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('close button has X icon', () => {
      render(
        <Alert type="info" message="Alert" onClose={() => {}} />
      );
      
      const closeButton = screen.getByRole('button');
      const icon = closeButton.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5');
    });
  });

  describe('Base UI Button Integration', () => {
    it('close button uses Base UI Button component', () => {
      render(<Alert type="info" message="Alert" onClose={() => {}} />);
      const closeButton = screen.getByRole('button');
      
      // Base UI Button should be a button element
      expect(closeButton.tagName).toBe('BUTTON');
    });

    it('close button has focus styles', () => {
      render(<Alert type="info" message="Alert" onClose={() => {}} />);
      const closeButton = screen.getByRole('button');
      
      expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Layout', () => {
    it('has flex layout for content', () => {
      const { container } = render(<Alert type="info" message="Message" />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });

    it('icon is in flex-shrink-0 container', () => {
      const { container } = render(<Alert type="info" message="Message" />);
      const iconContainer = container.querySelector('.flex-shrink-0');
      expect(iconContainer).toBeInTheDocument();
    });

    it('content is in flex-1 container', () => {
      const { container } = render(<Alert type="info" message="Message" />);
      const contentContainer = container.querySelector('.flex-1');
      expect(contentContainer).toBeInTheDocument();
    });

    it('applies margin between icon and text', () => {
      const { container } = render(<Alert type="info" message="Message" />);
      const textContainer = container.querySelector('.ml-3');
      expect(textContainer).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('title has correct typography', () => {
      render(<Alert type="info" title="Title" message="Message" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-sm', 'font-medium');
    });

    it('message has correct text size', () => {
      render(<Alert type="info" message="Message" />);
      const message = screen.getByText('Message');
      expect(message).toHaveClass('text-sm');
    });

    it('applies margin-top to message when title exists', () => {
      render(<Alert type="info" title="Title" message="Message" />);
      const message = screen.getByText('Message');
      expect(message).toHaveClass('mt-1');
    });
  });

  describe('Accessibility', () => {
    it('has role="alert"', () => {
      const { container } = render(<Alert type="info" message="Alert" />);
      const alert = container.firstChild;
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('close button is keyboard accessible', () => {
      render(<Alert type="info" message="Alert" onClose={() => {}} />);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });

    it('can be dismissed with keyboard', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();
      
      render(<Alert type="info" message="Alert" onClose={handleClose} />);
      const closeButton = screen.getByRole('button');
      
      closeButton.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<Alert type="info" message="Alert" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('rounded-md');
    });

    it('has border', () => {
      const { container } = render(<Alert type="info" message="Alert" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('border');
    });

    it('has padding', () => {
      const { container } = render(<Alert type="info" message="Alert" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('p-4');
    });
  });

  describe('Text Colors', () => {
    it('success text is green', () => {
      render(<Alert type="success" message="Success message" />);
      const message = screen.getByText('Success message');
      expect(message).toHaveClass('text-green-800');
    });

    it('error text is red', () => {
      render(<Alert type="error" message="Error message" />);
      const message = screen.getByText('Error message');
      expect(message).toHaveClass('text-red-800');
    });

    it('warning text is yellow', () => {
      render(<Alert type="warning" message="Warning message" />);
      const message = screen.getByText('Warning message');
      expect(message).toHaveClass('text-yellow-800');
    });

    it('info text is blue', () => {
      render(<Alert type="info" message="Info message" />);
      const message = screen.getByText('Info message');
      expect(message).toHaveClass('text-blue-800');
    });
  });
});
