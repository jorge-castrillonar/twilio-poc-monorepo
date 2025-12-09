/**
 * File Management Types
 * Type definitions for file operations (used by Redux and hooks)
 * 
 * Note: File management logic has been migrated to:
 * - Redux: src/store/slices/filesSlice.ts
 * - RTK Query: src/store/graphqlApi.ts (useGenerateUploadUrlMutation, useCompleteUploadMutation, useGetFilesQuery)
 * - Hooks: src/hooks/useFiles.ts
 */

export enum FileStatus {
  UPLOADING = 'UPLOADING',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  FAILED = 'FAILED',
}

export interface FileRecord {
  id: string;
  userId?: string;
  fileName?: string; // Alias for originalName
  originalName?: string;
  contentType?: string;
  status: FileStatus;
  uploadDate?: string;
  uploadedAt?: string; // Alias for uploadDate
  isPublic?: boolean;
  size?: number | null;
  fileSize?: number | null; // Alias for size
}

export interface UploadUrlResponse {
  fileId: string;
  uploadUrl: string;
  expiresIn?: number;
  createdAt?: string;
}

export interface FilesResponse {
  files: FileRecord[];
  totalCount: number;
  hasNextPage?: boolean;
  cursor?: string | null;
}

export interface FileUploadProgress {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

/**
 * @deprecated All file management functions have been migrated to RTK Query
 * Use the following instead:
 * - useGenerateUploadUrlMutation() for upload URL generation
 * - useCompleteUploadMutation() for completing uploads
 * - useGetFilesQuery() for fetching files
 * 
 * Or use the useFiles() hook for a complete file management interface
 */
