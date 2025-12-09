/**
 * Files Slice - Manages file upload state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FilesState {
  uploads: Record<string, FileUpload>;
}

const initialState: FilesState = {
  uploads: {},
};

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    startUpload: (
      state,
      action: PayloadAction<{
        id: string;
        fileName: string;
        fileSize: number;
      }>
    ) => {
      state.uploads[action.payload.id] = {
        id: action.payload.id,
        fileName: action.payload.fileName,
        fileSize: action.payload.fileSize,
        progress: 0,
        status: 'pending',
      };
    },
    updateProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const upload = state.uploads[action.payload.id];
      if (upload) {
        upload.progress = action.payload.progress;
        upload.status = 'uploading';
      }
    },
    completeUpload: (state, action: PayloadAction<{ id: string }>) => {
      const upload = state.uploads[action.payload.id];
      if (upload) {
        upload.progress = 100;
        upload.status = 'completed';
      }
    },
    failUpload: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
      const upload = state.uploads[action.payload.id];
      if (upload) {
        upload.status = 'error';
        upload.error = action.payload.error;
      }
    },
    clearUpload: (state, action: PayloadAction<{ id: string }>) => {
      delete state.uploads[action.payload.id];
    },
  },
});

export const {
  startUpload,
  updateProgress,
  completeUpload,
  failUpload,
  clearUpload,
} = filesSlice.actions;
export default filesSlice.reducer;
