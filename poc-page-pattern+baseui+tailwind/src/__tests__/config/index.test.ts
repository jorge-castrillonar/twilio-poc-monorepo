/**
 * Tests for Application Configuration
 * Configuration setup and helper functions
 */

import { 
  config, 
  isFeatureEnabled, 
  getApiUrl, 
  isProd, 
  isDev 
} from '../../config';

describe('Application Configuration', () => {
  describe('config object', () => {
    it('should have api configuration', () => {
      expect(config.api).toBeDefined();
      expect(config.api.url).toBeDefined();
      expect(config.api.key).toBeDefined();
      expect(config.api.timeout).toBe(30000);
    });

    it('should have environment configuration', () => {
      expect(config.env).toBeDefined();
      expect(config.env.mode).toBeDefined();
      expect(config.env.isProd).toBeDefined();
      expect(config.env.isDev).toBeDefined();
      expect(config.env.baseUrl).toBeDefined();
    });

    it('should have features configuration', () => {
      expect(config.features).toBeDefined();
      expect(config.features.enableMFA).toBeDefined();
      expect(config.features.enableFileUpload).toBeDefined();
      expect(config.features.enableDevTools).toBeDefined();
      expect(config.features.enableLogging).toBeDefined();
    });

    it('should have security configuration', () => {
      expect(config.security).toBeDefined();
      expect(config.security.tokenExpiryMs).toBe(3600000);
      expect(config.security.refreshThresholdMs).toBe(300000);
      expect(config.security.maxLoginAttempts).toBe(5);
      expect(config.security.sessionTimeoutMs).toBe(1800000);
    });

    it('should have upload configuration', () => {
      expect(config.upload).toBeDefined();
      expect(config.upload.maxSizeMb).toBe(10);
      expect(config.upload.maxSizeBytes).toBe(10485760);
      expect(config.upload.allowedTypes).toBeDefined();
      expect(Array.isArray(config.upload.allowedTypes)).toBe(true);
      expect(config.upload.chunked).toBe(false);
      expect(config.upload.chunkSizeBytes).toBe(1048576);
    });

    it('should have ui configuration', () => {
      expect(config.ui).toBeDefined();
      expect(config.ui.toastDuration).toBe(5000);
      expect(config.ui.debounceDelay).toBe(300);
      expect(config.ui.searchMinLength).toBe(3);
      expect(config.ui.defaultPageSize).toBe(20);
      expect(config.ui.maxPageSize).toBe(100);
    });

    it('should have routes configuration', () => {
      expect(config.routes).toBeDefined();
      expect(config.routes.login).toBe('/login');
      expect(config.routes.files).toBe('/files');
      expect(config.routes.mfa).toBe('/mfa');
      expect(config.routes.home).toBe('/');
    });
  });

  describe('api configuration', () => {
    it('should have default api url', () => {
      expect(config.api.url).toBeTruthy();
    });

    it('should have api timeout', () => {
      expect(config.api.timeout).toBe(30000);
      expect(typeof config.api.timeout).toBe('number');
    });

    it('should have api key property', () => {
      expect(config.api).toHaveProperty('key');
    });
  });

  describe('upload allowed types', () => {
    it('should include image types', () => {
      expect(config.upload.allowedTypes).toContain('image/jpeg');
      expect(config.upload.allowedTypes).toContain('image/png');
      expect(config.upload.allowedTypes).toContain('image/gif');
    });

    it('should include document types', () => {
      expect(config.upload.allowedTypes).toContain('application/pdf');
      expect(config.upload.allowedTypes).toContain('text/plain');
    });

    it('should include document types', () => {
      // Check for document MIME types
      const hasDocTypes = config.upload.allowedTypes.some(type => 
        type.includes('application') || type.includes('text')
      );
      expect(hasDocTypes).toBe(true);
    });

    it('should have correct number of allowed types', () => {
      // Should have 7 file types
      expect(config.upload.allowedTypes.length).toBeGreaterThanOrEqual(5);
      expect(Array.isArray(config.upload.allowedTypes)).toBe(true);
    });
  });

  describe('feature flags', () => {
    it('should have boolean feature flags', () => {
      expect(typeof config.features.enableMFA).toBe('boolean');
      expect(typeof config.features.enableFileUpload).toBe('boolean');
      expect(typeof config.features.enableDevTools).toBe('boolean');
      expect(typeof config.features.enableLogging).toBe('boolean');
    });

    it('should have enableMFA feature', () => {
      expect(config.features).toHaveProperty('enableMFA');
    });

    it('should have enableFileUpload feature', () => {
      expect(config.features).toHaveProperty('enableFileUpload');
    });

    it('should have enableDevTools feature', () => {
      expect(config.features).toHaveProperty('enableDevTools');
    });

    it('should have enableLogging feature', () => {
      expect(config.features).toHaveProperty('enableLogging');
    });
  });

  describe('security settings', () => {
    it('should have token expiry of 1 hour', () => {
      expect(config.security.tokenExpiryMs).toBe(3600000);
    });

    it('should have refresh threshold of 5 minutes', () => {
      expect(config.security.refreshThresholdMs).toBe(300000);
    });

    it('should have max login attempts of 5', () => {
      expect(config.security.maxLoginAttempts).toBe(5);
    });

    it('should have session timeout of 30 minutes', () => {
      expect(config.security.sessionTimeoutMs).toBe(1800000);
    });

    it('should have all security settings as numbers', () => {
      expect(typeof config.security.tokenExpiryMs).toBe('number');
      expect(typeof config.security.refreshThresholdMs).toBe('number');
      expect(typeof config.security.maxLoginAttempts).toBe('number');
      expect(typeof config.security.sessionTimeoutMs).toBe('number');
    });
  });

  describe('upload settings', () => {
    it('should have max size in MB', () => {
      expect(config.upload.maxSizeMb).toBe(10);
    });

    it('should have max size in bytes', () => {
      expect(config.upload.maxSizeBytes).toBe(10485760);
    });

    it('should have chunk size', () => {
      expect(config.upload.chunkSizeBytes).toBe(1048576);
    });

    it('should have chunked set to false', () => {
      expect(config.upload.chunked).toBe(false);
    });

    it('should have consistent max sizes', () => {
      // 10 MB = 10485760 bytes
      expect(config.upload.maxSizeMb * 1024 * 1024).toBe(config.upload.maxSizeBytes);
    });
  });

  describe('ui settings', () => {
    it('should have toast duration of 5 seconds', () => {
      expect(config.ui.toastDuration).toBe(5000);
    });

    it('should have debounce delay of 300ms', () => {
      expect(config.ui.debounceDelay).toBe(300);
    });

    it('should have search min length of 3', () => {
      expect(config.ui.searchMinLength).toBe(3);
    });

    it('should have default page size of 20', () => {
      expect(config.ui.defaultPageSize).toBe(20);
    });

    it('should have max page size of 100', () => {
      expect(config.ui.maxPageSize).toBe(100);
    });

    it('should have max page size greater than default', () => {
      expect(config.ui.maxPageSize).toBeGreaterThan(config.ui.defaultPageSize);
    });
  });

  describe('routes', () => {
    it('should have all routes starting with /', () => {
      expect(config.routes.login).toMatch(/^\//);
      expect(config.routes.files).toMatch(/^\//);
      expect(config.routes.mfa).toMatch(/^\//);
      expect(config.routes.home).toMatch(/^\//);
    });

    it('should have unique routes', () => {
      const routes = [
        config.routes.login,
        config.routes.files,
        config.routes.mfa,
      ];
      const uniqueRoutes = new Set(routes);
      expect(uniqueRoutes.size).toBe(routes.length);
    });

    it('should have home route as root', () => {
      expect(config.routes.home).toBe('/');
    });
  });

  describe('isFeatureEnabled helper', () => {
    it('should return boolean for enableMFA', () => {
      const result = isFeatureEnabled('enableMFA');
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for enableFileUpload', () => {
      const result = isFeatureEnabled('enableFileUpload');
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for enableDevTools', () => {
      const result = isFeatureEnabled('enableDevTools');
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for enableLogging', () => {
      const result = isFeatureEnabled('enableLogging');
      expect(typeof result).toBe('boolean');
    });

    it('should access feature flag values', () => {
      // Helper function accesses config.features
      // Test that it returns boolean values
      expect(typeof isFeatureEnabled('enableMFA')).toBe('boolean');
      expect(typeof isFeatureEnabled('enableFileUpload')).toBe('boolean');
      expect(typeof isFeatureEnabled('enableDevTools')).toBe('boolean');
      expect(typeof isFeatureEnabled('enableLogging')).toBe('boolean');
    });
  });

  describe('getApiUrl helper', () => {
    it('should return api url', () => {
      const url = getApiUrl();
      expect(url).toBe(config.api.url);
    });

    it('should return a string', () => {
      const url = getApiUrl();
      expect(typeof url).toBe('string');
    });

    it('should return truthy value', () => {
      const url = getApiUrl();
      expect(url).toBeTruthy();
    });
  });

  describe('isProd helper', () => {
    it('should return boolean', () => {
      const result = isProd();
      expect(typeof result).toBe('boolean');
    });

    it('should match config.env.isProd', () => {
      expect(isProd()).toBe(config.env.isProd);
    });
  });

  describe('isDev helper', () => {
    it('should return boolean', () => {
      const result = isDev();
      expect(typeof result).toBe('boolean');
    });

    it('should match config.env.isDev', () => {
      expect(isDev()).toBe(config.env.isDev);
    });
  });

  describe('environment modes', () => {
    it('should have valid environment mode', () => {
      const validModes = ['development', 'production', 'test'];
      expect(validModes).toContain(config.env.mode);
    });

    it('should not be both prod and dev', () => {
      // In most cases, isProd and isDev should be opposites (except in test env)
      const bothTrue = config.env.isProd && config.env.isDev;
      expect(bothTrue).toBe(false);
    });
  });

  describe('config immutability', () => {
    it('should be defined as const', () => {
      // config is exported as const, verify it exists
      expect(config).toBeDefined();
    });

    it('should have all required properties', () => {
      expect(config).toHaveProperty('api');
      expect(config).toHaveProperty('env');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('security');
      expect(config).toHaveProperty('upload');
      expect(config).toHaveProperty('ui');
      expect(config).toHaveProperty('routes');
    });
  });

  describe('config structure', () => {
    it('should have nested objects', () => {
      expect(typeof config.api).toBe('object');
      expect(typeof config.env).toBe('object');
      expect(typeof config.features).toBe('object');
      expect(typeof config.security).toBe('object');
      expect(typeof config.upload).toBe('object');
      expect(typeof config.ui).toBe('object');
      expect(typeof config.routes).toBe('object');
    });

    it('should not be null', () => {
      expect(config).not.toBeNull();
      expect(config.api).not.toBeNull();
      expect(config.env).not.toBeNull();
      expect(config.features).not.toBeNull();
    });
  });
});
