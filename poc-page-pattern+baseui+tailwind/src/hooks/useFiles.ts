/**
 * useFiles Hook
 * Custom hook for file management with Redux
 */

import { 
  useGetFilesQuery, 
  useGenerateUploadUrlMutation,
  useCompleteUploadMutation 
} from '../store/graphqlApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  startUpload, 
  updateProgress, 
  completeUpload as completeUploadAction,
  failUpload 
} from '../store/slices/filesSlice';

export interface FileRecord {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
}

export function useFiles() {
  const dispatch = useAppDispatch();
  
  // RTK Query for fetching files (automatic caching and refetching)
  const { data: files = [], isLoading: loading, error: queryError, refetch } = useGetFilesQuery();
  
  // Get upload state from Redux
  const uploads = useAppSelector((state) => state.files.uploads);
  
  // RTK Query mutations
  const [generateUploadUrl] = useGenerateUploadUrlMutation();
  const [completeUpload] = useCompleteUploadMutation();

  const uploadFile = async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    const uploadId = `${Date.now()}-${file.name}`;
    
    try {
      // Start tracking upload in Redux
      dispatch(startUpload({
        id: uploadId,
        fileName: file.name,
        fileSize: file.size,
      }));

      // Get upload URL from GraphQL
      const { fileId, uploadUrl } = await generateUploadUrl({
        originalName: file.name,
        contentType: file.type || 'application/octet-stream',
        isPublic: false,
      }).unwrap();

      // Upload to S3 with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            dispatch(updateProgress({ id: uploadId, progress }));
            onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Complete the upload via GraphQL
      await completeUpload({ fileId }).unwrap();
      
      // Mark upload as completed in Redux
      dispatch(completeUploadAction({ id: uploadId }));

      // Return file record
      return {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'completed',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      dispatch(failUpload({ id: uploadId, error: message }));
      throw err;
    }
  };

  const refresh = () => {
    refetch();
  };

  return {
    files,
    loading,
    error: queryError ? 'Failed to fetch files' : null,
    totalCount: files.length,
    uploadFile,
    refresh,
    uploads: Object.values(uploads),
  };
}
