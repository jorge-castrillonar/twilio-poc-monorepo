/**
 * Tests for Page Component
 * Simple container wrapper for page content
 */

import { render, screen } from '@testing-library/react';
import { Page } from '../../../components/patterns/Page';

describe('Page', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <Page>
          <div>Page Content</div>
        </Page>
      );

      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Page>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </Page>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('should render complex nested children', () => {
      render(
        <Page>
          <header>
            <h1>Title</h1>
            <p>Subtitle</p>
          </header>
          <main>
            <section>Content Section</section>
          </main>
          <footer>Footer Text</footer>
        </Page>
      );

      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Content Section')).toBeInTheDocument();
      expect(screen.getByText('Footer Text')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle null children', () => {
      render(<Page>{null}</Page>);
      // Should not crash
      expect(true).toBe(true);
    });

    it('should handle undefined children', () => {
      render(<Page>{undefined}</Page>);
      // Should not crash
      expect(true).toBe(true);
    });

    it('should handle fragment children', () => {
      render(
        <Page>
          <>
            <div>Fragment Part 1</div>
            <div>Fragment Part 2</div>
          </>
        </Page>
      );

      expect(screen.getByText('Fragment Part 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Part 2')).toBeInTheDocument();
    });

    it('should handle string children', () => {
      render(<Page>Simple text content</Page>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should handle number children', () => {
      render(<Page>{42}</Page>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct wrapper styles', () => {
      const { container } = render(
        <Page>
          <div>Content</div>
        </Page>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen', 'bg-twilio-gray-50');
    });
  });
});
