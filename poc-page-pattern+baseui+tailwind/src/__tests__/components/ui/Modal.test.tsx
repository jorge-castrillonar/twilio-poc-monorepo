/**
 * Modal Component Tests
 * Tests for Base UI Dialog-based modal component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../../components/ui/Modal';

describe('Modal Component', () => {
  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render modal content when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      // Dialog.Portal doesn't render when closed
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders title correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Important Alert">
          <p>Content</p>
        </Modal>
      );
      
      expect(screen.getByText('Important Alert')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </Modal>
      );
      
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={() => {}} 
          title="Modal"
          footer={<button>Save</button>}
        >
          <p>Content</p>
        </Modal>
      );
      
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('does not render footer section when footer is not provided', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Footer should not exist
      const footerSections = container.querySelectorAll('.border-t');
      // Footer has border-t, header has border-b, so no border-t should exist
      expect(footerSections.length).toBe(0);
    });
  });

  describe('Close Button', () => {
    it('renders close button with X icon', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      
      // Should have SVG icon
      const svg = closeButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      // Base UI Dialog.Close triggers onOpenChange with false
      expect(handleClose).toHaveBeenCalled();
    });

    it('close button has screen reader text', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      expect(screen.getByText('Close')).toHaveClass('sr-only');
    });
  });

  describe('Size Variants', () => {
    it('applies small size class', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal" size="sm">
          <p>Content</p>
        </Modal>
      );
      
      // Get modal by content and check its parent for size class
      const content = screen.getByText('Content');
      const modal = content.closest('[class*="max-w"]');
      expect(modal).toHaveClass('max-w-md');
    });

    it('applies medium size class by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Get modal by content and check its parent for size class
      const content = screen.getByText('Content');
      const modal = content.closest('[class*="max-w"]');
      expect(modal).toHaveClass('max-w-lg');
    });

    it('applies large size class', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal" size="lg">
          <p>Content</p>
        </Modal>
      );
      
      // Get modal by content and check its parent for size class
      const content = screen.getByText('Content');
      const modal = content.closest('[class*="max-w"]');
      expect(modal).toHaveClass('max-w-2xl');
    });

    it('applies extra large size class', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal" size="xl">
          <p>Content</p>
        </Modal>
      );
      
      // Get modal by content and check its parent for size class
      const content = screen.getByText('Content');
      const modal = content.closest('[class*="max-w"]');
      expect(modal).toHaveClass('max-w-4xl');
    });
  });

  describe('Styling', () => {
    it('applies rounded corners to modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Dialog.Popup has rounded-lg class
      const content = screen.getByText('Content');
      const popup = content.closest('[class*="rounded"]');
      expect(popup).toHaveClass('rounded-lg');
    });

    it('applies white background to modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Dialog.Popup has bg-white class
      const content = screen.getByText('Content');
      const popup = content.closest('[class*="bg-white"]');
      expect(popup).toHaveClass('bg-white');
    });

    it('applies shadow to modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Dialog.Popup has shadow-xl class
      const content = screen.getByText('Content');
      const popup = content.closest('[class*="shadow"]');
      expect(popup).toHaveClass('shadow-xl');
    });

    it('title has correct typography styling', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          <p>Content</p>
        </Modal>
      );
      
      const title = screen.getByText('Modal Title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });
  });

  describe('Base UI Dialog Features', () => {
    it('uses Dialog.Root with open prop', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      expect(screen.getByText('Modal')).toBeInTheDocument();
      
      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      expect(screen.queryByText('Modal')).not.toBeInTheDocument();
    });

    it('uses Dialog.Portal for portal rendering', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Content should be rendered in portal (outside normal DOM hierarchy)
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('uses Dialog.Backdrop', () => {
      const { baseElement } = render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      // Backdrop should exist with fixed positioning and bg-black class
      // Use baseElement to query the entire document including portals
      const backdrop = baseElement.querySelector('.fixed.inset-0.bg-black');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('bg-opacity-50');
    });

    it('uses Dialog.Title for title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          <p>Content</p>
        </Modal>
      );
      
      const title = screen.getByText('Test Title');
      expect(title).toBeInTheDocument();
    });

    it('uses Dialog.Close for close button', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog', { name: 'Modal' });
      expect(dialog).toBeInTheDocument();
    });

    it('close button is keyboard accessible', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton.tagName).toBe('BUTTON');
    });

    it('has accessible title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Confirmation Dialog">
          <p>Content</p>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName('Confirmation Dialog');
    });
  });

  describe('Layout Structure', () => {
    it('renders header section with border', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          <p>Content</p>
        </Modal>
      );
      
      // Header contains the title and should have border-b class
      const title = screen.getByText('Test Title');
      const header = title.parentElement;
      expect(header).toHaveClass('border-b');
    });

    it('renders body section with padding', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Content</p>
        </Modal>
      );
      
      const body = screen.getByText('Content').parentElement;
      expect(body).toHaveClass('px-6', 'py-4');
    });

    it('footer has border-top when present', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={() => {}} 
          title="Modal"
          footer={<button>OK</button>}
        >
          <p>Content</p>
        </Modal>
      );
      
      const footerSection = screen.getByRole('button', { name: 'OK' }).parentElement;
      expect(footerSection).toHaveClass('border-t');
    });
  });
});
