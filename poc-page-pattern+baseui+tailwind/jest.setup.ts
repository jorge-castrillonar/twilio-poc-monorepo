import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Suppress specific console errors/warnings that are expected in tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    
    // Suppress React act() warnings - these are expected in test environment
    if (
      message.includes('An update to LabelableProvider inside a test was not wrapped in act') ||
      message.includes('An update to') && message.includes('inside a test was not wrapped in act') ||
      message.includes('The current testing environment is not configured to support act') ||
      message.includes('You called act(async () => ...) without await') ||
      message.includes('act(async () => ...)') 
    ) {
      return;
    }
    
    // Suppress RTK Query test errors (mocked fetch doesn't return proper Response objects)
    if (
      message.includes('An unhandled error occurred processing a request for the endpoint') ||
      message.includes('response.clone is not a function') ||
      message.includes('Cannot read properties of undefined')
    ) {
      return;
    }
    
    // Suppress expected token errors in tests
    if (
      message.includes('Token refresh failed') ||
      message.includes('No refresh token available')
    ) {
      return;
    }
    
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    
    // Suppress React Router v7 future flag warnings
    if (
      message.includes('React Router Future Flag Warning') ||
      message.includes('v7_startTransition') ||
      message.includes('v7_relativeSplatPath')
    ) {
      return;
    }
    
    // Suppress expected route matching warnings in tests
    if (message.includes('No routes matched location')) {
      return;
    }
    
    // Suppress expected token warnings in tests
    if (
      message.includes('Access token expired') ||
      message.includes('Migrating tokens from localStorage')
    ) {
      return;
    }
    
    originalWarn.call(console, ...args);
  };
  
  console.log = (...args: any[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    
    // Suppress application logs in tests
    if (
      message.includes('Token needs refresh') ||
      message.includes('[useAuth]') ||
      message.includes('Migration complete') ||
      message.includes('FETCH CALLED')
    ) {
      return;
    }
    
    // Allow other logs through (useful for debugging tests)
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = jest.fn();

// Mock config module to avoid import.meta.env issues
jest.mock('./src/config', () => ({
  config: {
    api: {
      url: '/graphql',
      key: '',
      timeout: 30000,
    },
    env: {
      mode: 'test',
      isProd: false,
      isDev: false,
      baseUrl: '/',
    },
    features: {
      enableMFA: true,
      enableFileUpload: true,
      enableDevTools: false,
      enableLogging: false,
    },
    security: {
      tokenExpiryMs: 3600000,
      refreshThresholdMs: 300000,
      maxLoginAttempts: 5,
      sessionTimeoutMs: 1800000,
    },
    upload: {
      maxSizeMb: 10,
      maxSizeBytes: 10485760,
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
      ],
      chunked: false,
      chunkSizeBytes: 1048576,
    },
    ui: {
      toastDuration: 5000,
      debounceDelay: 300,
      searchMinLength: 3,
      defaultPageSize: 20,
      maxPageSize: 100,
    },
    routes: {
      login: '/login',
      files: '/files',
      mfa: '/mfa',
      home: '/',
    },
  },
  isFeatureEnabled: jest.fn(() => true),
  getApiUrl: jest.fn(() => '/graphql'),
  isProd: jest.fn(() => false),
  isDev: jest.fn(() => false),
}));
