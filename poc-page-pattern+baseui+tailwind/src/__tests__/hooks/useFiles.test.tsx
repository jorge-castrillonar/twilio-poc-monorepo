/**
 * Tests for useFiles Hook
 * Complex orchestration hook for file upload   beforeEach(() => {
    // Mock fetch for RTK Query with proper Response handling
    // RTK Query sends a Request object, not (url, options)
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      let body: any = {};
      let query = '';

      // Handle Request object (RTK Query uses this)
      if (input instanceof Request) {
        try {
          const clonedRequest = input.clone();
          const bodyText = await clonedRequest.text();
          body = bodyText ? JSON.parse(bodyText) : {};
          query = (body.query || '').trim();
        } catch (e) {
          // If body is already consumed, use empty query
          query = '';
        }
      } else {
        // Fallback for (url, options) signature
        if (init?.body) {
          body = JSON.parse(init.body as string);
          query = (body.query || '').trim();
        }
      }

      let responseData: any = { data: {} };

      const queryLower = query.toLowerCase();ty
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useFiles } from '../../hooks/useFiles';
import authReducer from '../../store/slices/authSlice';
import mfaReducer from '../../store/slices/mfaSlice';
import filesReducer from '../../store/slices/filesSlice';
import { graphqlApi } from '../../store/graphqlApi';

// Mock config
jest.mock('../../config', () => ({
  config: {
    api: { url: 'http://localhost:4000/graphql' },
    features: { enableMfa: true },
    security: { tokenRefreshInterval: 300000 },
  },
}));

// Mock tokenManager
jest.mock('../../utils/tokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(() => 'test-token'),
    getRefreshToken: jest.fn(() => 'test-refresh-token'),
    getTokenType: jest.fn(() => 'Bearer'),
    hasValidTokens: jest.fn(() => false),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    updateAccessToken: jest.fn(),
  },
}));

// Mock XMLHttpRequest for S3 uploads
class MockXMLHttpRequest {
  upload = { addEventListener: jest.fn() };
  addEventListener = jest.fn();
  open = jest.fn();
  send = jest.fn();
  setRequestHeader = jest.fn();
  status = 200;
  onProgressHandler: ((e: any) => void) | null = null;
  onLoadHandler: (() => void) | null = null;

  constructor() {
    // Capture event handlers
    this.upload.addEventListener.mockImplementation((event: string, handler: any) => {
      if (event === 'progress') this.onProgressHandler = handler;
    });
    this.addEventListener.mockImplementation((event: string, handler: any) => {
      if (event === 'load') this.onLoadHandler = handler;
    });
  }

  // Trigger progress event
  triggerProgress(loaded: number, total: number) {
    if (this.onProgressHandler) {
      this.onProgressHandler({ lengthComputable: true, loaded, total });
    }
  }

  // Trigger load event (success)
  triggerLoad() {
    if (this.onLoadHandler) {
      this.onLoadHandler();
    }
  }
}

describe('useFiles Hook', () => {
  let store: ReturnType<typeof configureStore>;
  let wrapper: React.FC<{ children: React.ReactNode }>;
  let xhrInstance: MockXMLHttpRequest | null = null;

  beforeEach(() => {
    // Mock fetch for RTK Query with proper Response handling
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      // Handle Request object from RTK Query
      let bodyText = '';
      if (input instanceof Request) {
        bodyText = await input.clone().text();
      } else if (init?.body) {
        bodyText = init.body as string;
      }
      
      const body = bodyText ? JSON.parse(bodyText) : {};
      const query = (body.query || '').trim();

      console.log('� FETCH CALLED with query:', query.substring(0, 80));

      let responseData: any = { data: {} };

      const queryLower = query.toLowerCase();

      // Mock getFiles query
      if (queryLower.includes('query') && queryLower.includes('files')) {
        responseData = {
          data: {
            files: {
              files: [
                {
                  id: 'file-1',
                  fileName: 'test.txt',
                  fileSize: 1024,
                  uploadedAt: '2024-01-01T00:00:00Z',
                  status: 'completed',
                },
              ],
              cursor: null,
            },
          },
        };
      }

      // Mock generateUploadUrl mutation (case-insensitive)
      if (queryLower.includes('mutation') && queryLower.includes('generateuploadurl')) {
        responseData = {
          data: {
            generateUploadUrl: {
              fileId: 'new-file-id',
              uploadUrl: 'https://s3.amazonaws.com/bucket/file',
              expiresIn: 3600,
              createdAt: new Date().toISOString(),
            },
          },
        };
      }

      // Mock completeUpload mutation (case-insensitive)
      if (queryLower.includes('mutation') && queryLower.includes('completeupload')) {
        responseData = {
          data: {
            completeUpload: {
              success: true,
            },
          },
        };
      }

      const response = {
        ok: true,
        status: 200,
        json: async () => responseData,
        text: async () => JSON.stringify(responseData),
        clone: function () {
          return this;
        },
      } as Response;

      return Promise.resolve(response);
    });

    // Mock XMLHttpRequest for S3 uploads
    xhrInstance = null;
    global.XMLHttpRequest = jest.fn().mockImplementation(() => {
      xhrInstance = new MockXMLHttpRequest();
      return xhrInstance;
    }) as any;

    // Create fresh store for each test
    store = configureStore({
      reducer: {
        auth: authReducer,
        mfa: mfaReducer,
        files: filesReducer,
        [graphqlApi.reducerPath]: graphqlApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(graphqlApi.middleware),
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    xhrInstance = null;
  });

  describe('Basic Functionality', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });

      // Wait for initial query to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should load mocked file from getFiles query
      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toMatchObject({
        id: 'file-1',
        fileName: 'test.txt',
        fileSize: 1024,
        status: 'completed',
      });
      expect(result.current.error).toBeNull();
      expect(result.current.totalCount).toBe(1);
      expect(result.current.uploads).toEqual([]);
      expect(typeof result.current.uploadFile).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should have all required methods', () => {
      const { result } = renderHook(() => useFiles(), { wrapper });

      expect(result.current).toHaveProperty('files');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('totalCount');
      expect(result.current).toHaveProperty('uploadFile');
      expect(result.current).toHaveProperty('refresh');
      expect(result.current).toHaveProperty('uploads');
    });
  });

  describe('File Upload Orchestration', () => {
    it('should track upload progress in Redux state', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });

      // Wait for hook to initialize
      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      let uploadPromise: Promise<any>;

      // Start upload
      await act(async () => {
        uploadPromise = result.current.uploadFile(mockFile);
        
        // Trigger XHR progress and load events
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        if (xhrInstance) {
          xhrInstance.triggerProgress(50, 100);
          xhrInstance.triggerLoad();
        }
      });

      // Complete the upload
      await act(async () => {
        await uploadPromise!;
      });

      // Verify upload was tracked in Redux
      const state = store.getState() as any;
      const uploadValues = Object.values(state.files.uploads) as any[];
      expect(uploadValues.length).toBeGreaterThan(0);
      expect(uploadValues[0]).toMatchObject({
        fileName: 'test.txt',
        fileSize: mockFile.size,
        status: 'completed',
      });
    });

    it('should call progress callback during upload', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const onProgress = jest.fn();
      let uploadPromise: Promise<any>;

      await act(async () => {
        uploadPromise = result.current.uploadFile(mockFile, onProgress);
        
        // Trigger progress events
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        if (xhrInstance) {
          xhrInstance.triggerProgress(25, 100);
          xhrInstance.triggerProgress(50, 100);
          xhrInstance.triggerProgress(100, 100);
          xhrInstance.triggerLoad();
        }
      });

      await act(async () => {
        await uploadPromise!;
      });

      // Verify progress callback was called
      expect(onProgress).toHaveBeenCalled();
      expect(onProgress.mock.calls.length).toBeGreaterThan(0);
    });

    it('should provide upload tracking via Redux', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Initially empty
      expect(result.current.uploads).toEqual([]);

      const mockFile = new File(['test'], 'upload-test.txt', { type: 'text/plain' });
      let uploadPromise: Promise<any>;

      await act(async () => {
        uploadPromise = result.current.uploadFile(mockFile);
        
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        if (xhrInstance) {
          xhrInstance.triggerLoad();
        }
      });

      await act(async () => {
        await uploadPromise!;
      });

      // Should now have upload tracked
      expect(result.current.uploads.length).toBeGreaterThan(0);
      expect(result.current.uploads[0]).toMatchObject({
        fileName: 'upload-test.txt',
        status: 'completed',
      });
    });
  });

  describe('File Listing', () => {
    it('should return files from RTK Query', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.files)).toBe(true);
      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].fileName).toBe('test.txt');
    });

    it('should calculate total count correctly', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalCount).toBe(result.current.files.length);
      expect(result.current.totalCount).toBe(1);
    });

    it('should provide refresh function', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refresh).toBe('function');

      // Should not throw and should trigger refetch
      await act(async () => {
        result.current.refresh();
      });

      // Verify fetch was called again
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      expect(fetchCalls.length).toBeGreaterThan(1);
    });
  });

  describe('Upload State Management', () => {
    it('should support multiple concurrent uploads', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

      // Start first upload
      let upload1Promise: Promise<any>;
      await act(async () => {
        upload1Promise = result.current.uploadFile(file1);
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        const xhr1 = xhrInstance;
        
        // Start second upload (creates new XHR instance)
        const upload2Promise = result.current.uploadFile(file2);
        
        // Complete both uploads
        if (xhr1) xhr1.triggerLoad();
        await waitFor(() => expect(xhrInstance).not.toBe(xhr1));
        if (xhrInstance) xhrInstance.triggerLoad();
        
        await Promise.all([upload1Promise!, upload2Promise]);
      });

      // Both uploads should be tracked
      expect(result.current.uploads.length).toBe(2);
      expect(result.current.uploads[0].fileName).toBe('file1.txt');
      expect(result.current.uploads[1].fileName).toBe('file2.txt');
    });

    it('should return upload objects with correct structure', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Initially empty
      expect(Array.isArray(result.current.uploads)).toBe(true);
      expect(result.current.uploads).toEqual([]);

      const mockFile = new File(['test'], 'structured.txt', { type: 'text/plain' });
      let uploadPromise: Promise<any>;

      await act(async () => {
        uploadPromise = result.current.uploadFile(mockFile);
        
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        if (xhrInstance) xhrInstance.triggerLoad();
      });

      await act(async () => {
        await uploadPromise!;
      });

      // Check structure
      expect(result.current.uploads.length).toBe(1);
      const upload = result.current.uploads[0];
      expect(upload).toHaveProperty('id');
      expect(upload).toHaveProperty('fileName');
      expect(upload).toHaveProperty('fileSize');
      expect(upload).toHaveProperty('progress');
      expect(upload).toHaveProperty('status');
      expect(upload.fileName).toBe('structured.txt');
      expect(upload.status).toBe('completed');
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors and track in Redux', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockFile = new File(['test'], 'error.txt', { type: 'text/plain' });

      // Mock XHR to fail
      global.XMLHttpRequest = jest.fn().mockImplementation(() => {
        const failingXhr = new MockXMLHttpRequest();
        failingXhr.status = 500;
        // Override to trigger error
        failingXhr.addEventListener.mockImplementation((event: string, handler: any) => {
          if (event === 'error') {
            setTimeout(() => handler(), 10);
          }
        });
        xhrInstance = failingXhr;
        return failingXhr;
      }) as any;

      let uploadError: any;
      await act(async () => {
        try {
          await result.current.uploadFile(mockFile);
        } catch (err) {
          uploadError = err;
        }
      });

      // Should have caught error
      expect(uploadError).toBeDefined();
      
      // Error should be tracked in Redux
      const state = store.getState() as any;
      const uploads = Object.values(state.files.uploads) as any[];
      expect(uploads.length).toBeGreaterThan(0);
      expect(uploads[0].status).toBe('error');
      expect(uploads[0].error).toBeDefined();
    });

    it('should handle RTK Query errors gracefully', async () => {
      // Mock fetch to return error
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ errors: [{ message: 'Server error' }] }),
        text: () => Promise.resolve('{}'),
        clone: function () { return this; },
      } as Response);

      // Create new store with error response
      const errorStore = configureStore({
        reducer: {
          auth: authReducer,
          mfa: mfaReducer,
          files: filesReducer,
          [graphqlApi.reducerPath]: graphqlApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(graphqlApi.middleware),
      });

      const errorWrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={errorStore}>{children}</Provider>
      );

      const { result } = renderHook(() => useFiles(), { wrapper: errorWrapper });

      // Wait for query to fail
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should expose error from RTK Query
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Content Type Handling', () => {
    it('should use file type when available', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      let uploadPromise: Promise<any>;
      await act(async () => {
        uploadPromise = result.current.uploadFile(mockFile);
        
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        if (xhrInstance) xhrInstance.triggerLoad();
      });

      await act(async () => {
        await uploadPromise!;
      });

      // Verify fetch was called with correct content type
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      const uploadUrlCall = await Promise.all(fetchCalls.map(async (call) => {
        let bodyText = '';
        if (call[0] instanceof Request) {
          bodyText = await call[0].clone().text();
        } else if (call[1]?.body) {
          bodyText = call[1].body;
        }
        const body = bodyText ? JSON.parse(bodyText) : {};
        return body.query?.includes('generateUploadUrl') ? { body: bodyText, ...body } : null;
      })).then(results => results.find(r => r !== null));
      
      expect(uploadUrlCall).toBeDefined();
      const requestBody = JSON.parse(uploadUrlCall!.body);
      expect(requestBody.variables.input.contentType).toBe('application/pdf');
    });

    it('should default to octet-stream when type is empty', async () => {
      const { result } = renderHook(() => useFiles(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockFile = new File(['test'], 'unknown.bin', { type: '' });

      let uploadPromise: Promise<any>;
      await act(async () => {
        uploadPromise = result.current.uploadFile(mockFile);
        
        await waitFor(() => expect(xhrInstance).not.toBeNull());
        if (xhrInstance) xhrInstance.triggerLoad();
      });

      await act(async () => {
        await uploadPromise!;
      });

      // Verify fetch was called with default content type
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      const uploadUrlCall = await Promise.all(fetchCalls.map(async (call) => {
        let bodyText = '';
        if (call[0] instanceof Request) {
          bodyText = await call[0].clone().text();
        } else if (call[1]?.body) {
          bodyText = call[1].body;
        }
        const body = bodyText ? JSON.parse(bodyText) : {};
        return body.query?.includes('generateUploadUrl') ? { body: bodyText, ...body } : null;
      })).then(results => results.find(r => r !== null));
      
      expect(uploadUrlCall).toBeDefined();
      const requestBody = JSON.parse(uploadUrlCall!.body);
      expect(requestBody.variables.input.contentType).toBe('application/octet-stream');
    });
  });
});
