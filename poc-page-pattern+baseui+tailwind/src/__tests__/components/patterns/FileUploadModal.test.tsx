/**
 * Tests for FileUploadModal Component
 * Modal for uploading files with progress tracking
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploadModal } from '../../../components/patterns/FileUploadModal';

describe('FileUploadModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUploadSuccess = jest.fn();
  const mockUploadFile = jest.fn();

  const getFileInput = () => {
    // Modal uses Portal, so input is in document.body, not in container
    const input = document.querySelector('#file-upload') as HTMLInputElement;
    if (!input) throw new Error('File input not found');
    return input;
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnUploadSuccess.mockClear();
    mockUploadFile.mockClear();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      expect(screen.getByText('Upload File')).toBeInTheDocument();
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <FileUploadModal
          isOpen={false}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      expect(screen.queryByText('Upload File')).not.toBeInTheDocument();
    });
  });

  describe('File selection', () => {
    it('should handle file selection', () => {
      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('should display file size', () => {
      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['a'.repeat(1024)], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/KB/i)).toBeInTheDocument();
    });

    it('should handle no files', () => {
      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const input = getFileInput();
      fireEvent.change(input, { target: { files: [] } });

      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });
  });

  describe('Upload', () => {
    it('should upload successfully', async () => {
      mockUploadFile.mockResolvedValue({});

      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(file, expect.any(Function));
        expect(mockOnUploadSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show error without file', () => {
      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      // Should not call uploadFile
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    it('should handle upload error', async () => {
      mockUploadFile.mockRejectedValue(new Error('Upload failed'));

      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });
    });

    it('should handle non-Error rejection', async () => {
      mockUploadFile.mockRejectedValue('String error');

      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });
    });

    it('should show progress during upload', async () => {
      mockUploadFile.mockImplementation((_file, onProgress) => {
        if (onProgress) {
          onProgress(50);
        }
        return new Promise((resolve) => setTimeout(resolve, 100));
      });

      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /uploading/i })).toBeInTheDocument();
      });
    });

    it('should disable buttons during upload', async () => {
      mockUploadFile.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 100));
      });

      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeDisabled();
        expect(input).toBeDisabled();
      });
    });

    it('should clear error on new file selection', () => {
      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      // Trigger error by clicking upload without file
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);
      
      // Select file - this should clear the error and enable upload
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      // Upload button should now be enabled
      expect(uploadButton).not.toBeDisabled();
    });
  });

  describe('Cancel', () => {
    it('should call onClose when cancel clicked', () => {
      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable cancel during upload', async () => {
      mockUploadFile.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 100));
      });

      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      // Cancel button should be disabled during upload
      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeDisabled();
      });
    });
  });

  describe('UI states', () => {
    it('should show upload instructions when not uploading', () => {
      render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      expect(screen.getByText('Upload Process')).toBeInTheDocument();
    });

    it('should hide instructions during upload', async () => {
      mockUploadFile.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 100));
      });

      const { container } = render(
        <FileUploadModal
          isOpen={true}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
          uploadFile={mockUploadFile}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = getFileInput();
      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.queryByText('Upload Process')).not.toBeInTheDocument();
      });
    });
  });
});
