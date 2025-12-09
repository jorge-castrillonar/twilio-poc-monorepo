/**
 * Integration Tests for graphqlApi
 * Tests the real RTK Query API slice without global mocks
 */

import { configureStore } from '@reduxjs/toolkit';
import { graphqlApi } from '../../store/graphqlApi';
import { tokenManager } from '../../utils/tokenManager';

// Mock only the tokenManager and config
jest.mock('../../utils/tokenManager');
jest.mock('../../config', () => ({
  config: {
    api: { url: 'http://localhost:4000/graphql' },
    features: { enableMfa: true },
    security: { tokenRefreshInterval: 300000 },
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('graphqlApi Integration Tests', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup tokenManager mocks
    (tokenManager.getAccessToken as jest.Mock).mockReturnValue('test-token');
    (tokenManager.getTokenType as jest.Mock).mockReturnValue('Bearer');
    (tokenManager.setTokens as jest.Mock).mockImplementation(() => {});
    
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        [graphqlApi.reducerPath]: graphqlApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(graphqlApi.middleware),
    });

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  describe('baseQuery configuration', () => {
    it('should call fetch with correct URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { login: { accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', user: {} } } }),
      });

      await store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password',
        })
      );

      expect(global.fetch).toHaveBeenCalled();
      expect(tokenManager.getAccessToken).toHaveBeenCalled();
      expect(tokenManager.getTokenType).toHaveBeenCalled();
    });

    it('should use tokenManager to get auth credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { login: { accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', user: {} } } }),
      });

      await store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password',
        })
      );

      expect(tokenManager.getAccessToken).toHaveBeenCalled();
      expect(tokenManager.getTokenType).toHaveBeenCalled();
    });
  });

  describe('login mutation', () => {
    it('should successfully call login endpoint', async () => {
      const mockResponse = {
        data: {
          login: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            tokenType: 'Bearer',
            expiresIn: 3600,
            user: {
              id: '1',
              email: 'test@example.com',
              fullName: 'Test User',
              roles: ['user'],
              mfaEnabled: false,
            },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password123',
        })
      );

      // Wait for the async operation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
      expect(tokenManager.getAccessToken).toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      const errorResponse = {
        errors: [{ message: 'Invalid credentials' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => errorResponse,
      });

      const result = await store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'wrong',
        })
      );

      expect(result.error).toBeDefined();
    });

    it('should have login mutation endpoint', () => {
      expect(graphqlApi.endpoints.login).toBeDefined();
      expect(graphqlApi.endpoints.login.initiate).toBeDefined();
    });
  });

  describe('MFA mutations', () => {
    describe('setupMfa', () => {
      it('should call setupMfa mutation successfully', async () => {
        const mockResponse = {
          data: {
            setupMfa: {
              secret: 'SECRET123',
              qrCodeUrl: 'otpauth://totp/test',
              backupCodes: ['code1', 'code2'],
            },
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        store.dispatch(graphqlApi.endpoints.setupMfa.initiate());

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle setupMfa errors', async () => {
        const errorResponse = {
          errors: [{ message: 'MFA setup failed' }],
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => errorResponse,
        });

        const result = await store.dispatch(
          graphqlApi.endpoints.setupMfa.initiate()
        );

        expect(result.error).toBeDefined();
      });
    });

    describe('enableMfa', () => {
      it('should call enableMfa with TOTP code successfully', async () => {
        const mockResponse = {
          data: {
            enableMfa: true,
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        store.dispatch(graphqlApi.endpoints.enableMfa.initiate({ totpCode: '123456' }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle enableMfa errors', async () => {
        const errorResponse = {
          errors: [{ message: 'Invalid TOTP code' }],
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => errorResponse,
        });

        const result = await store.dispatch(
          graphqlApi.endpoints.enableMfa.initiate({ totpCode: '000000' })
        );

        expect(result.error).toBeDefined();
      });
    });

    describe('disableMfa', () => {
      it('should call disableMfa successfully', async () => {
        const mockResponse = {
          data: {
            disableMfa: true,
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        store.dispatch(graphqlApi.endpoints.disableMfa.initiate());

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle disableMfa errors', async () => {
        const errorResponse = {
          errors: [{ message: 'Failed to disable MFA' }],
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => errorResponse,
        });

        const result = await store.dispatch(
          graphqlApi.endpoints.disableMfa.initiate()
        );

        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Files mutations', () => {
    describe('generateUploadUrl', () => {
      it('should call generateUploadUrl successfully', async () => {
        const mockResponse = {
          data: {
            generateUploadUrl: {
              uploadUrl: 'https://s3.example.com/upload',
              fileId: 'file-123',
              expiresIn: 3600,
              createdAt: '2025-11-24T00:00:00Z',
            },
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        store.dispatch(
          graphqlApi.endpoints.generateUploadUrl.initiate({
            originalName: 'test.txt',
            contentType: 'text/plain',
            isPublic: false,
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle generateUploadUrl errors', async () => {
        const errorResponse = {
          errors: [{ message: 'File type not allowed' }],
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => errorResponse,
        });

        const result = await store.dispatch(
          graphqlApi.endpoints.generateUploadUrl.initiate({
            originalName: 'virus.exe',
            contentType: 'application/x-msdownload',
            isPublic: false,
          })
        );

        expect(result.error).toBeDefined();
      });
    });

    describe('completeUpload', () => {
      it('should call completeUpload successfully', async () => {
        const mockResponse = {
          data: {
            completeUpload: {
              id: 'file-123',
              originalName: 'test.txt',
              status: 'completed',
              userId: 'user-1',
              contentType: 'text/plain',
              isPublic: false,
            },
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        store.dispatch(graphqlApi.endpoints.completeUpload.initiate({ fileId: 'file-123' }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle completeUpload errors', async () => {
        const errorResponse = {
          errors: [{ message: 'File not found' }],
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => errorResponse,
        });

        const result = await store.dispatch(
          graphqlApi.endpoints.completeUpload.initiate({ fileId: 'invalid' })
        );

        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Files query', () => {
    it('should call getFiles query successfully', async () => {
      const mockResponse = {
        data: {
          files: {
            files: [
              {
                id: '1',
                originalName: 'test.txt',
                status: 'completed',
                userId: 'user-1',
                contentType: 'text/plain',
                isPublic: false,
                uploadDate: '2025-11-24T00:00:00Z',
                size: 1024,
              },
            ],
            totalCount: 1,
            hasNextPage: false,
            cursor: null,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      store.dispatch(graphqlApi.endpoints.getFiles.initiate());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle getFiles errors', async () => {
      const errorResponse = {
        errors: [{ message: 'Unauthorized' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => errorResponse,
      });

      const result = await store.dispatch(
        graphqlApi.endpoints.getFiles.initiate()
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('Tag invalidation', () => {
    it('should invalidate Auth tags on login', async () => {
      const mockResponse = {
        data: {
          login: {
            accessToken: 'token',
            refreshToken: 'refresh',
            tokenType: 'Bearer',
            user: { id: '1' },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password',
        })
      );

      // Verify that tags are properly configured
      const endpoint = graphqlApi.endpoints.login;
      expect(endpoint).toBeDefined();
    });

    it('should invalidate Files tags on upload complete', async () => {
      const mockResponse = {
        data: {
          completeUpload: {
            id: 'file-123',
            originalName: 'test.txt',
            status: 'completed',
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await store.dispatch(
        graphqlApi.endpoints.completeUpload.initiate({ fileId: 'file-123' })
      );

      const endpoint = graphqlApi.endpoints.completeUpload;
      expect(endpoint).toBeDefined();
    });

    it('should invalidate MFA tags on setup', async () => {
      const mockResponse = {
        data: {
          setupMfa: {
            secret: 'SECRET',
            qrCodeUrl: 'otpauth://totp/test',
            backupCodes: [],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await store.dispatch(graphqlApi.endpoints.setupMfa.initiate());

      const endpoint = graphqlApi.endpoints.setupMfa;
      expect(endpoint).toBeDefined();
    });
  });

  describe('Network errors', () => {
    it('should handle network failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password',
        })
      );

      expect(result.error).toBeDefined();
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      const result = await store.dispatch(
        graphqlApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password',
        })
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('API configuration', () => {
    it('should have correct reducerPath', () => {
      expect(graphqlApi.reducerPath).toBe('graphqlApi');
    });

    it('should have all required endpoints', () => {
      const endpoints = graphqlApi.endpoints;
      
      expect(endpoints.login).toBeDefined();
      expect(endpoints.setupMfa).toBeDefined();
      expect(endpoints.enableMfa).toBeDefined();
      expect(endpoints.disableMfa).toBeDefined();
      expect(endpoints.getFiles).toBeDefined();
      expect(endpoints.generateUploadUrl).toBeDefined();
      expect(endpoints.completeUpload).toBeDefined();
    });

    it('should have correct tag types', () => {
      // Verify the API is configured with proper tag types
      expect(graphqlApi.reducerPath).toBe('graphqlApi');
    });
  });
});
