/**
 * FilesPage Component
 * File listing page following Twilio DataTablePage Pattern
 */

import { useState } from 'react';
import { DataTablePage } from '../components/patterns/DataTablePage';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { FileUploadModal } from '../components/patterns/FileUploadModal';
import { useFiles } from '../hooks/useFiles';
import { formatDate, formatFileSize } from '../utils/formatDate';
import { FileStatus } from '../types/files';
import { SUCCESS_MESSAGES, TOAST_DURATION } from '../constants';

export function FilesPage() {
  const { files, loading, error, totalCount, uploadFile } = useFiles();
  const [searchValue, setSearchValue] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUploadSuccess = () => {
    setSuccessMessage(SUCCESS_MESSAGES.UPLOAD_SUCCESS);
    setIsUploadModalOpen(false);
    setTimeout(() => setSuccessMessage(null), TOAST_DURATION);
  };

  // Filter files based on search
  const filteredFiles = files.filter((file) =>
    file.originalName.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusBadge = (status: FileStatus) => {
    const styles = {
      [FileStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [FileStatus.UPLOADING]: 'bg-yellow-100 text-yellow-800',
      [FileStatus.FAILED]: 'bg-red-100 text-red-800',
      [FileStatus.DELETED]: 'bg-twilio-gray-100 text-twilio-gray-800',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'File Name',
      width: '35%',
      render: (file: typeof files[0]) => (
        <div className="flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-twilio-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium">{file.originalName}</span>
        </div>
      ),
    },
    {
      key: 'contentType',
      header: 'Type',
      width: '15%',
      render: (file: typeof files[0]) => (
        <span className="text-twilio-gray-600">{file.contentType}</span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      width: '10%',
      render: (file: typeof files[0]) => (
        <span className="text-twilio-gray-600">{formatFileSize(file.size)}</span>
      ),
    },
    {
      key: 'uploadDate',
      header: 'Upload Date',
      width: '20%',
      render: (file: typeof files[0]) => (
        <span className="text-twilio-gray-600">{formatDate(file.uploadDate)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (file: typeof files[0]) => getStatusBadge(file.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '10%',
      render: () => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="!p-1 text-twilio-blue hover:text-blue-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTablePage
        title="Files"
        description={`Manage your uploaded files (${totalCount} total)`}
        actions={
          <Button onClick={() => setIsUploadModalOpen(true)} variant="primary">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload File
          </Button>
        }
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search files..."
        columns={columns}
        data={filteredFiles}
        loading={loading}
        emptyMessage={error || 'No files found. Upload your first file to get started!'}
        keyExtractor={(file) => file.id}
      />

      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        </div>
      )}

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        uploadFile={uploadFile}
      />
    </>
  );
}
