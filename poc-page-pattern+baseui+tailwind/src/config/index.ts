/**
 * Application Configuration
 * Environment-specific configuration settings
 */

// Helper to parse boolean from env
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

// Helper to parse number from env
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Environment variables (Vite)
const env = {
  API_URL: import.meta.env.VITE_API_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  PORT: import.meta.env.VITE_PORT,
  ENV: import.meta.env.MODE,
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
  BASE_URL: import.meta.env.BASE_URL,
  // Feature flags
  ENABLE_MFA: import.meta.env.VITE_ENABLE_MFA,
  ENABLE_FILE_UPLOAD: import.meta.env.VITE_ENABLE_FILE_UPLOAD,
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS,
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING,
  // Security
  TOKEN_EXPIRY_MS: import.meta.env.VITE_TOKEN_EXPIRY_MS,
  SESSION_TIMEOUT_MS: import.meta.env.VITE_SESSION_TIMEOUT_MS,
  MAX_LOGIN_ATTEMPTS: import.meta.env.VITE_MAX_LOGIN_ATTEMPTS,
  // Upload
  MAX_FILE_SIZE_BYTES: import.meta.env.VITE_MAX_FILE_SIZE_BYTES,
  // UI
  TOAST_DURATION: import.meta.env.VITE_TOAST_DURATION,
  DEBOUNCE_DELAY: import.meta.env.VITE_DEBOUNCE_DELAY,
};

/**
 * Application configuration
 */
export const config = {
  // API Configuration
  api: {
    url: env.API_URL || '/graphql',
    key: env.API_KEY || '',
    timeout: 30000,
  },

  // Environment
  env: {
    mode: env.ENV as 'development' | 'production' | 'test',
    isProd: env.IS_PROD,
    isDev: env.IS_DEV,
    baseUrl: env.BASE_URL,
  },

  // Features (feature flags)
  features: {
    enableMFA: parseBoolean(env.ENABLE_MFA, true),
    enableFileUpload: parseBoolean(env.ENABLE_FILE_UPLOAD, true),
    enableDevTools: parseBoolean(env.ENABLE_DEV_TOOLS, env.IS_DEV),
    enableLogging: parseBoolean(env.ENABLE_LOGGING, env.IS_DEV),
  },

  // Security
  security: {
    tokenExpiryMs: parseNumber(env.TOKEN_EXPIRY_MS, 3600000), // 1 hour
    refreshThresholdMs: 300000, // 5 minutes
    maxLoginAttempts: parseNumber(env.MAX_LOGIN_ATTEMPTS, 5),
    sessionTimeoutMs: parseNumber(env.SESSION_TIMEOUT_MS, 1800000), // 30 minutes
  },

  // File Upload
  upload: {
    maxSizeMb: 10,
    maxSizeBytes: parseNumber(env.MAX_FILE_SIZE_BYTES, 10485760),
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    chunked: false,
    chunkSizeBytes: 1048576, // 1MB
  },

  // UI
  ui: {
    toastDuration: parseNumber(env.TOAST_DURATION, 5000),
    debounceDelay: parseNumber(env.DEBOUNCE_DELAY, 300),
    searchMinLength: 3,
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Routes
  routes: {
    login: '/login',
    files: '/files',
    mfa: '/mfa',
    home: '/',
  },
} as const;

// Type for config
export type Config = typeof config;

// Helper to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

// Helper to get API URL
export const getApiUrl = (): string => {
  return config.api.url;
};

// Helper to check environment
export const isProd = (): boolean => {
  return config.env.isProd;
};

export const isDev = (): boolean => {
  return config.env.isDev;
};
