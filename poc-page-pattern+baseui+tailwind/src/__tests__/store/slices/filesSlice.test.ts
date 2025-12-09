/**
 * Tests for filesSlice
 * Redux slice for file upload state management
 */

import filesReducer, {
  startUpload,
  updateProgress,
  completeUpload,
  failUpload,
  clearUpload,
} from '../../../store/slices/filesSlice';

describe('filesSlice', () => {
  const initialState = {
    uploads: {},
  };

  describe('Initial State', () => {
    it('should return the initial state', () => {
      expect(filesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('startUpload', () => {
    it('should add a new upload to state', () => {
      const upload = {
        id: 'upload-1',
        fileName: 'test.txt',
        fileSize: 1024,
      };

      const state = filesReducer(initialState, startUpload(upload));

      expect(state.uploads['upload-1']).toEqual({
        id: 'upload-1',
        fileName: 'test.txt',
        fileSize: 1024,
        progress: 0,
        status: 'pending',
      });
    });

    it('should maintain existing uploads when adding new one', () => {
      const stateWithUpload = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'first.txt',
            fileSize: 512,
            progress: 50,
            status: 'uploading' as const,
          },
        },
      };

      const newUpload = {
        id: 'upload-2',
        fileName: 'second.txt',
        fileSize: 1024,
      };

      const state = filesReducer(stateWithUpload, startUpload(newUpload));

      expect(Object.keys(state.uploads)).toHaveLength(2);
      expect(state.uploads['upload-1']).toBeDefined();
      expect(state.uploads['upload-2']).toBeDefined();
    });
  });

  describe('updateProgress', () => {
    it('should update progress for existing upload', () => {
      const stateWithUpload = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'test.txt',
            fileSize: 1024,
            progress: 0,
            status: 'pending' as const,
          },
        },
      };

      const state = filesReducer(
        stateWithUpload,
        updateProgress({ id: 'upload-1', progress: 50 })
      );

      expect(state.uploads['upload-1'].progress).toBe(50);
      expect(state.uploads['upload-1'].status).toBe('uploading');
    });

    it('should not crash for non-existent upload', () => {
      const state = filesReducer(
        initialState,
        updateProgress({ id: 'non-existent', progress: 50 })
      );

      expect(state.uploads).toEqual({});
    });

    it('should handle progress updates from 0 to 100', () => {
      let state: any = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'test.txt',
            fileSize: 1024,
            progress: 0,
            status: 'pending' as const,
          },
        },
      };

      // Update progress incrementally
      state = filesReducer(state, updateProgress({ id: 'upload-1', progress: 25 }));
      expect(state.uploads['upload-1'].progress).toBe(25);

      state = filesReducer(state, updateProgress({ id: 'upload-1', progress: 75 }));
      expect(state.uploads['upload-1'].progress).toBe(75);

      state = filesReducer(state, updateProgress({ id: 'upload-1', progress: 100 }));
      expect(state.uploads['upload-1'].progress).toBe(100);
    });
  });

  describe('completeUpload', () => {
    it('should mark upload as completed', () => {
      const stateWithUpload = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'test.txt',
            fileSize: 1024,
            progress: 90,
            status: 'uploading' as const,
          },
        },
      };

      const state = filesReducer(
        stateWithUpload,
        completeUpload({ id: 'upload-1' })
      );

      expect(state.uploads['upload-1'].progress).toBe(100);
      expect(state.uploads['upload-1'].status).toBe('completed');
    });

    it('should not crash for non-existent upload', () => {
      const state = filesReducer(
        initialState,
        completeUpload({ id: 'non-existent' })
      );

      expect(state.uploads).toEqual({});
    });
  });

  describe('failUpload', () => {
    it('should mark upload as failed with error message', () => {
      const stateWithUpload = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'test.txt',
            fileSize: 1024,
            progress: 50,
            status: 'uploading' as const,
          },
        },
      };

      const state = filesReducer(
        stateWithUpload,
        failUpload({ id: 'upload-1', error: 'Network error' })
      );

      expect(state.uploads['upload-1'].status).toBe('error');
      expect(state.uploads['upload-1'].error).toBe('Network error');
    });

    it('should handle different error messages', () => {
      const stateWithUpload = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'test.txt',
            fileSize: 1024,
            progress: 50,
            status: 'uploading' as const,
          },
        },
      };

      const errors = [
        'Network timeout',
        'File too large',
        'Unauthorized',
        'Server error',
      ];

      errors.forEach((errorMsg) => {
        const state = filesReducer(
          stateWithUpload,
          failUpload({ id: 'upload-1', error: errorMsg })
        );

        expect(state.uploads['upload-1'].error).toBe(errorMsg);
      });
    });

    it('should not crash for non-existent upload', () => {
      const state = filesReducer(
        initialState,
        failUpload({ id: 'non-existent', error: 'Some error' })
      );

      expect(state.uploads).toEqual({});
    });
  });

  describe('clearUpload', () => {
    it('should remove upload from state', () => {
      const stateWithUpload = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'test.txt',
            fileSize: 1024,
            progress: 100,
            status: 'completed' as const,
          },
        },
      };

      const state = filesReducer(
        stateWithUpload,
        clearUpload({ id: 'upload-1' })
      );

      expect(state.uploads['upload-1']).toBeUndefined();
      expect(Object.keys(state.uploads)).toHaveLength(0);
    });

    it('should only remove specified upload', () => {
      const stateWithUploads = {
        uploads: {
          'upload-1': {
            id: 'upload-1',
            fileName: 'first.txt',
            fileSize: 512,
            progress: 100,
            status: 'completed' as const,
          },
          'upload-2': {
            id: 'upload-2',
            fileName: 'second.txt',
            fileSize: 1024,
            progress: 100,
            status: 'completed' as const,
          },
        },
      };

      const state = filesReducer(
        stateWithUploads,
        clearUpload({ id: 'upload-1' })
      );

      expect(state.uploads['upload-1']).toBeUndefined();
      expect(state.uploads['upload-2']).toBeDefined();
      expect(Object.keys(state.uploads)).toHaveLength(1);
    });

    it('should not crash for non-existent upload', () => {
      const state = filesReducer(
        initialState,
        clearUpload({ id: 'non-existent' })
      );

      expect(state.uploads).toEqual({});
    });
  });

  describe('Upload Lifecycle', () => {
    it('should handle complete upload lifecycle', () => {
      let state: any = initialState;

      // Start upload
      state = filesReducer(
        state,
        startUpload({
          id: 'upload-1',
          fileName: 'document.pdf',
          fileSize: 2048,
        })
      );
      expect(state.uploads['upload-1'].status).toBe('pending');
      expect(state.uploads['upload-1'].progress).toBe(0);

      // Update progress
      state = filesReducer(
        state,
        updateProgress({ id: 'upload-1', progress: 30 })
      );
      expect(state.uploads['upload-1'].status).toBe('uploading');
      expect(state.uploads['upload-1'].progress).toBe(30);

      state = filesReducer(
        state,
        updateProgress({ id: 'upload-1', progress: 70 })
      );
      expect(state.uploads['upload-1'].progress).toBe(70);

      // Complete upload
      state = filesReducer(state, completeUpload({ id: 'upload-1' }));
      expect(state.uploads['upload-1'].status).toBe('completed');
      expect(state.uploads['upload-1'].progress).toBe(100);

      // Clear upload
      state = filesReducer(state, clearUpload({ id: 'upload-1' }));
      expect(state.uploads['upload-1']).toBeUndefined();
    });

    it('should handle failed upload lifecycle', () => {
      let state: any = initialState;

      // Start upload
      state = filesReducer(
        state,
        startUpload({
          id: 'upload-1',
          fileName: 'image.jpg',
          fileSize: 4096,
        })
      );

      // Update progress
      state = filesReducer(
        state,
        updateProgress({ id: 'upload-1', progress: 45 })
      );

      // Fail upload
      state = filesReducer(
        state,
        failUpload({ id: 'upload-1', error: 'Connection lost' })
      );
      expect(state.uploads['upload-1'].status).toBe('error');
      expect(state.uploads['upload-1'].error).toBe('Connection lost');

      // Clear failed upload
      state = filesReducer(state, clearUpload({ id: 'upload-1' }));
      expect(state.uploads['upload-1']).toBeUndefined();
    });
  });
});
