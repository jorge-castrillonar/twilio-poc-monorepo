/**
 * FileUploadModal Component
 * Modal for uploading files with progress tracking
 */

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { ERROR_MESSAGES } from '../../constants';
import { formatFileSize } from '../../utils/formatDate';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  uploadFile: (file: File, onProgress?: (progress: number) => void) => Promise<any>;
}

export function FileUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  uploadFile,
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(ERROR_MESSAGES.INVALID_FILE_TYPE);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      onUploadSuccess();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.UPLOAD_FAILED;
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? `Uploading... ${uploadProgress}%` : 'Upload'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error" message={error} />}

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-twilio-gray-700 mb-2">
            Select File
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-twilio-blue bg-blue-50'
                  : 'border-twilio-gray-300 bg-twilio-gray-50 hover:bg-twilio-gray-100'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-twilio-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-twilio-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-twilio-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-twilio-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-twilio-gray-500">Any file type</p>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-twilio-gray-700">
                Uploading...
              </span>
              <span className="text-sm font-medium text-twilio-blue">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-twilio-gray-200 rounded-full h-2">
              <div
                className="bg-twilio-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Steps Info */}
        {!uploading && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Upload Process</h3>
                <div className="mt-2 text-xs text-blue-700 space-y-1">
                  <p>1. File will be uploaded to secure cloud storage</p>
                  <p>2. Upload URL is generated with expiration</p>
                  <p>3. File is verified and activated</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
