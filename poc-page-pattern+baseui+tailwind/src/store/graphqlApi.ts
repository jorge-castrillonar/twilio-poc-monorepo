/**
 * GraphQL API Slice using RTK Query
 * Centralized API layer for all GraphQL operations with caching and secure token handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenManager } from '../utils/tokenManager';
import { config } from '../config';

/**
 * Base query with secure authentication
 * Token is retrieved from secure tokenManager (memory + sessionStorage)
 */
const baseQuery = fetchBaseQuery({
  baseUrl: config.api.url,
  prepareHeaders: (headers) => {
    // Get token from secure token manager
    const token = tokenManager.getAccessToken();
    const tokenType = tokenManager.getTokenType();
    
    if (token) {
      headers.set('Authorization', `${tokenType} ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * Enhanced base query with automatic token refresh on 401 errors
 * 
 * This middleware intercepts 401 Unauthorized responses and attempts to:
 * 1. Refresh the access token using the refresh token
 * 2. Retry the original request with the new token
 * 3. Logout user if refresh fails
 */
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  // Try the initial request
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401) {
    console.log('[RTK Query] 401 error detected, attempting token refresh...');

    // Check if we have a refresh token
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      console.error('[RTK Query] No refresh token available, redirecting to login');
      // No refresh token, can't recover
      return result;
    }

    // Use tokenManager's refresh mechanism to prevent concurrent refreshes
    const refreshSuccess = await tokenManager.startRefresh(async () => {
      try {
        // Call refresh token mutation directly
        const refreshResult = await baseQuery(
          {
            url: '',
            method: 'POST',
            body: {
              query: `
                mutation RefreshToken($refreshToken: String!) {
                  refreshToken(refreshToken: $refreshToken) {
                    accessToken
                    refreshToken
                    tokenType
                    expiresIn
                  }
                }
              `,
              variables: { refreshToken },
            },
          },
          api,
          extraOptions
        );

        if (refreshResult.error) {
          throw new Error('Token refresh failed');
        }

        const data = (refreshResult.data as any).data.refreshToken;
        const expiresAt = Date.now() + (data.expiresIn * 1000);

        // Return token data for tokenManager
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenType: data.tokenType,
          expiresAt,
        };
      } catch (error) {
        console.error('[RTK Query] Token refresh error:', error);
        throw error;
      }
    });

    if (refreshSuccess) {
      console.log('[RTK Query] Token refreshed successfully, retrying original request');
      
      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.error('[RTK Query] Token refresh failed, user needs to re-authenticate');
      
      // Refresh failed, clear tokens (tokenManager already did this)
      // The app-level auth logic will handle redirect to login
    }
  }

  return result;
};

/**
 * GraphQL API slice with RTK Query
 * Uses baseQueryWithReauth for automatic token refresh on 401 errors
 */
export const graphqlApi = createApi({
  reducerPath: 'graphqlApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Files', 'MFA'],
  endpoints: (builder) => ({
    // AUTH ENDPOINTS
    login: builder.mutation<
      { accessToken: string; refreshToken: string; tokenType: string; expiresIn: number; user: any; mfaRequired: boolean },
      { email: string; password: string; mfaCode?: string }
    >({
      query: ({ email, password, mfaCode }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                accessToken
                refreshToken
                tokenType
                expiresIn
                user {
                  id
                  email
                  fullName
                  roles
                  mfaEnabled
                }
                mfaRequired
              }
            }
          `,
          variables: { 
            input: { email, password, ...(mfaCode && { mfaCode }) }
          },
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Login failed');
        }
        return response.data.login;
      },
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<
      { accessToken: string; refreshToken: string; tokenType: string; expiresIn: number },
      { refreshToken: string }
    >({
      query: ({ refreshToken }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation RefreshToken($refreshToken: String!) {
              refreshToken(refreshToken: $refreshToken) {
                accessToken
                refreshToken
                tokenType
                expiresIn
              }
            }
          `,
          variables: { refreshToken },
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Token refresh failed');
        }
        return response.data.refreshToken;
      },
      invalidatesTags: ['Auth'],
    }),

    // MFA ENDPOINTS
    setupMfa: builder.mutation<{ secret: string; qrCodeUrl: string; backupCodes: string[] }, void>({
      query: () => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation SetupMfa {
              setupMfa {
                secret
                qrCodeUrl
                backupCodes
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Setup MFA failed');
        }
        return response.data.setupMfa;
      },
      invalidatesTags: ['MFA'],
    }),

    enableMfa: builder.mutation<boolean, { totpCode: string }>({
      query: ({ totpCode }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation EnableMfa($input: EnableMfaInput!) {
              enableMfa(input: $input)
            }
          `,
          variables: { 
            input: { totpCode }
          },
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Enable MFA failed');
        }
        return response.data.enableMfa;
      },
      invalidatesTags: ['MFA', 'Auth'],
    }),

    disableMfa: builder.mutation<boolean, void>({
      query: () => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation DisableMfa {
              disableMfa
            }
          `,
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Disable MFA failed');
        }
        return response.data.disableMfa;
      },
      invalidatesTags: ['MFA', 'Auth'],
    }),

    // FILE ENDPOINTS
    generateUploadUrl: builder.mutation<
      { fileId: string; uploadUrl: string; expiresIn: number; createdAt: string },
      { originalName: string; contentType: string; isPublic?: boolean }
    >({
      query: ({ originalName, contentType, isPublic = false }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation GenerateUploadUrl($input: UploadRequest!) {
              generateUploadUrl(input: $input) {
                fileId
                uploadUrl
                expiresIn
                createdAt
              }
            }
          `,
          variables: { 
            input: { originalName, contentType, isPublic }
          },
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Generate upload URL failed');
        }
        return response.data.generateUploadUrl;
      },
    }),

    completeUpload: builder.mutation<any, { fileId: string }>({
      query: ({ fileId }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            mutation CompleteUpload($fileId: ID!) {
              completeUpload(fileId: $fileId) {
                id
                originalName
                status
                userId
                contentType
                isPublic
              }
            }
          `,
          variables: { fileId },
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Complete upload failed');
        }
        return response.data.completeUpload;
      },
      invalidatesTags: ['Files'],
    }),

    getFiles: builder.query<any[], void>({
      query: () => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetFiles {
              files {
                files {
                  id
                  originalName
                  status
                  userId
                  contentType
                  isPublic
                  uploadDate
                }
                totalCount
                hasNextPage
                cursor
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => {
        if (response.errors) {
          throw new Error(response.errors[0]?.message || 'Get files failed');
        }
        return response.data.files.files;
      },
      providesTags: ['Files'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useSetupMfaMutation,
  useEnableMfaMutation,
  useDisableMfaMutation,
  useGenerateUploadUrlMutation,
  useCompleteUploadMutation,
  useGetFilesQuery,
} = graphqlApi;
