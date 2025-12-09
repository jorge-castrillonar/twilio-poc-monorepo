/**
 * Application Constants
 * Centralized constants used across the application
 */

// API Constants
export const API_URL = '/graphql';
export const API_TIMEOUT = 30000; // 30 seconds

// Token Constants
export const TOKEN_EXPIRY_DEFAULT = 3600000; // 1 hour in milliseconds
export const TOKEN_REFRESH_THRESHOLD = 300000; // 5 minutes in milliseconds

// File Upload Constants
export const FILE_SIZE_LIMIT = 10485760; // 10MB in bytes
export const FILE_SIZE_LIMIT_MB = 10;
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// UI Constants
export const TOAST_DURATION = 5000; // 5 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
export const SEARCH_MIN_LENGTH = 3;

// Route Constants
export const ROUTES = {
  LOGIN: '/login',
  FILES: '/files',
  MFA: '/mfa',
  MFA_VERIFICATION: '/mfa-verify',
  HOME: '/',
} as const;

// Storage Keys (for sessionStorage)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '__secure_access_token__',
  REFRESH_TOKEN: '__secure_refresh_token__',
  TOKEN_TYPE: '__secure_token_type__',
  EXPIRES_AT: '__secure_expires_at__',
  USER_DATA: '__secure_user_data__',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  FILE_TOO_LARGE: `File size exceeds ${FILE_SIZE_LIMIT_MB}MB limit.`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
  MFA_ENABLED: 'MFA enabled successfully.',
  MFA_DISABLED: 'MFA disabled successfully.',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
