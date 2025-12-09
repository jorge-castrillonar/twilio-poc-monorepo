/**
 * Tests for PageHeader Component
 * Header section for page with title, description, and actions
 */

import { render, screen } from '@testing-library/react';
import { PageHeader } from '../../../components/patterns/PageHeader';

describe('PageHeader', () => {
  describe('Basic rendering', () => {
    it('should render title', () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render title and description', () => {
      render(
        <PageHeader 
          title="Main Title" 
          description="This is a description" 
        />
      );

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should render title and actions', () => {
      render(
        <PageHeader 
          title="Page Title"
          actions={<button>Action Button</button>}
        />
      );

      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('should render all props together', () => {
      render(
        <PageHeader
          title="Complete Header"
          description="Full description text"
          actions={
            <div>
              <button>Button 1</button>
              <button>Button 2</button>
            </div>
          }
        />
      );

      expect(screen.getByText('Complete Header')).toBeInTheDocument();
      expect(screen.getByText('Full description text')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
    });
  });

  describe('Optional props', () => {
    it('should work with only title (no description)', () => {
      render(<PageHeader title="Only Title" />);
      expect(screen.getByText('Only Title')).toBeInTheDocument();
      expect(screen.queryByText('This is a description')).not.toBeInTheDocument();
    });

    it('should work with only title (no actions)', () => {
      render(<PageHeader title="Title Without Actions" />);
      expect(screen.getByText('Title Without Actions')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should work with title and description (no actions)', () => {
      render(
        <PageHeader 
          title="Title" 
          description="Description only" 
        />
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description only')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Content variations', () => {
    it('should render long titles', () => {
      const longTitle = 'This is a very long title that should still render correctly even with many characters';
      render(<PageHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should render long descriptions', () => {
      const longDescription = 'This is a very long description that contains multiple sentences. It should render correctly and handle all the text properly without any issues.';
      render(
        <PageHeader 
          title="Title"
          description={longDescription}
        />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should render special characters in title', () => {
      render(<PageHeader title="Title with @#$% special chars" />);
      expect(screen.getByText('Title with @#$% special chars')).toBeInTheDocument();
    });

    it('should render HTML entities in description', () => {
      render(
        <PageHeader 
          title="Title"
          description="Description with < > & quotes"
        />
      );
      expect(screen.getByText('Description with < > & quotes')).toBeInTheDocument();
    });
  });

  describe('Actions slot', () => {
    it('should render single action button', () => {
      render(
        <PageHeader 
          title="Title"
          actions={<button>Single Action</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Single Action' })).toBeInTheDocument();
    });

    it('should render multiple action buttons', () => {
      render(
        <PageHeader 
          title="Title"
          actions={
            <>
              <button>Action 1</button>
              <button>Action 2</button>
              <button>Action 3</button>
            </>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 3' })).toBeInTheDocument();
    });

    it('should render complex action components', () => {
      render(
        <PageHeader 
          title="Title"
          actions={
            <div className="flex gap-2">
              <button>Primary</button>
              <a href="/link">Link</a>
              <span>Text</span>
            </div>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct wrapper classes', () => {
      const { container } = render(<PageHeader title="Title" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('mb-8', 'border-b', 'border-twilio-gray-200', 'pb-6');
    });

    it('should apply correct title classes', () => {
      render(<PageHeader title="Title" />);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-twilio-gray-900');
    });

    it('should apply correct description classes when present', () => {
      render(<PageHeader title="Title" description="Description" />);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('mt-2', 'text-sm', 'text-twilio-gray-600');
    });
  });
});
