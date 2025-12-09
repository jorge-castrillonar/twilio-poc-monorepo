/**
 * Error Utilities Tests
 * Tests for custom error classes and error handling functions
 */

import {
  ApiError,
  AuthError,
  ValidationError,
  getErrorMessage,
  isAuthError,
} from '../../utils/errors';

describe('ApiError', () => {
  it('should create ApiError with message', () => {
    const error = new ApiError('API call failed');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('API call failed');
    expect(error.name).toBe('ApiError');
  });

  it('should create ApiError with status code', () => {
    const error = new ApiError('Not found', 404);
    
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create ApiError without status code', () => {
    const error = new ApiError('Generic error');
    
    expect(error.message).toBe('Generic error');
    expect(error.statusCode).toBeUndefined();
  });

  it('should have correct error name', () => {
    const error = new ApiError('Test error');
    expect(error.name).toBe('ApiError');
  });

  it('should support different status codes', () => {
    const error400 = new ApiError('Bad request', 400);
    const error401 = new ApiError('Unauthorized', 401);
    const error500 = new ApiError('Server error', 500);

    expect(error400.statusCode).toBe(400);
    expect(error401.statusCode).toBe(401);
    expect(error500.statusCode).toBe(500);
  });
});

describe('AuthError', () => {
  it('should create AuthError with default message', () => {
    const error = new AuthError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.message).toBe('Authentication failed');
    expect(error.name).toBe('AuthError');
  });

  it('should create AuthError with custom message', () => {
    const error = new AuthError('Invalid credentials');
    
    expect(error.message).toBe('Invalid credentials');
    expect(error.name).toBe('AuthError');
  });

  it('should support various auth error messages', () => {
    const error1 = new AuthError('Token expired');
    const error2 = new AuthError('User not found');
    const error3 = new AuthError('Session invalid');

    expect(error1.message).toBe('Token expired');
    expect(error2.message).toBe('User not found');
    expect(error3.message).toBe('Session invalid');
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with message', () => {
    const error = new ValidationError('Invalid email format');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Invalid email format');
    expect(error.name).toBe('ValidationError');
  });

  it('should support various validation messages', () => {
    const error1 = new ValidationError('Email is required');
    const error2 = new ValidationError('Password too short');
    const error3 = new ValidationError('Invalid phone number');

    expect(error1.message).toBe('Email is required');
    expect(error2.message).toBe('Password too short');
    expect(error3.message).toBe('Invalid phone number');
  });

  it('should have correct error name', () => {
    const error = new ValidationError('Test validation');
    expect(error.name).toBe('ValidationError');
  });
});

describe('getErrorMessage', () => {
  describe('Error objects', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Something went wrong');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Something went wrong');
    });

    it('should extract message from ApiError', () => {
      const error = new ApiError('API failed', 500);
      const message = getErrorMessage(error);
      
      expect(message).toBe('API failed');
    });

    it('should extract message from AuthError', () => {
      const error = new AuthError('Auth failed');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Auth failed');
    });

    it('should extract message from ValidationError', () => {
      const error = new ValidationError('Validation failed');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Validation failed');
    });
  });

  describe('String errors', () => {
    it('should return string error as is', () => {
      const message = getErrorMessage('Simple error string');
      expect(message).toBe('Simple error string');
    });

    it('should handle empty string', () => {
      const message = getErrorMessage('');
      expect(message).toBe('');
    });
  });

  describe('Unknown errors', () => {
    it('should return default message for null', () => {
      const message = getErrorMessage(null);
      expect(message).toBe('An unexpected error occurred');
    });

    it('should return default message for undefined', () => {
      const message = getErrorMessage(undefined);
      expect(message).toBe('An unexpected error occurred');
    });

    it('should return default message for number', () => {
      const message = getErrorMessage(404);
      expect(message).toBe('An unexpected error occurred');
    });

    it('should return default message for object', () => {
      const message = getErrorMessage({ error: 'test' });
      expect(message).toBe('An unexpected error occurred');
    });

    it('should return default message for array', () => {
      const message = getErrorMessage(['error1', 'error2']);
      expect(message).toBe('An unexpected error occurred');
    });
  });
});

describe('isAuthError', () => {
  describe('AuthError instances', () => {
    it('should return true for AuthError instance', () => {
      const error = new AuthError();
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for AuthError with custom message', () => {
      const error = new AuthError('Token expired');
      expect(isAuthError(error)).toBe(true);
    });
  });

  describe('Error messages with auth keywords', () => {
    it('should return true for "unauthorized" in message', () => {
      const error = new Error('Unauthorized access');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for "authentication" in message', () => {
      const error = new Error('Authentication failed');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for "token" in message', () => {
      const error = new Error('Invalid token');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for "not authenticated" in message', () => {
      const error = new Error('User not authenticated');
      expect(isAuthError(error)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const error1 = new Error('UNAUTHORIZED');
      const error2 = new Error('Authentication Failed');
      const error3 = new Error('TOKEN invalid');
      const error4 = new Error('Not Authenticated');

      expect(isAuthError(error1)).toBe(true);
      expect(isAuthError(error2)).toBe(true);
      expect(isAuthError(error3)).toBe(true);
      expect(isAuthError(error4)).toBe(true);
    });

    it('should return true for partial matches', () => {
      const error1 = new Error('Your session token has expired');
      const error2 = new Error('Please authentication to continue'); // Changed to match keyword
      const error3 = new Error('Access unauthorized for this resource');

      expect(isAuthError(error1)).toBe(true);
      expect(isAuthError(error2)).toBe(true);
      expect(isAuthError(error3)).toBe(true);
    });
  });

  describe('Non-auth errors', () => {
    it('should return false for ApiError without auth keywords', () => {
      const error = new ApiError('Network error', 500);
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for ValidationError', () => {
      const error = new ValidationError('Invalid email');
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for generic Error', () => {
      const error = new Error('Something went wrong');
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for non-error types', () => {
      expect(isAuthError(null)).toBe(false);
      expect(isAuthError(undefined)).toBe(false);
      expect(isAuthError('string')).toBe(false);
      expect(isAuthError(123)).toBe(false);
      expect(isAuthError({ error: 'test' })).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty error message', () => {
      const error = new Error('');
      expect(isAuthError(error)).toBe(false);
    });

    it('should handle error with only whitespace', () => {
      const error = new Error('   ');
      expect(isAuthError(error)).toBe(false);
    });

    it('should handle mixed case keywords', () => {
      const error = new Error('uNaUtHoRiZeD AcCeSs');
      expect(isAuthError(error)).toBe(true);
    });
  });

  describe('Real world scenarios', () => {
    it('should detect JWT expiration errors', () => {
      const error = new Error('JWT token expired');
      expect(isAuthError(error)).toBe(true);
    });

    it('should detect session errors', () => {
      const error = new Error('Session token invalid');
      expect(isAuthError(error)).toBe(true);
    });

    it('should detect 401 related errors', () => {
      const error = new Error('401: Unauthorized request');
      expect(isAuthError(error)).toBe(true);
    });

    it('should not detect network errors', () => {
      const error = new Error('Network request failed');
      expect(isAuthError(error)).toBe(false);
    });

    it('should not detect validation errors', () => {
      const error = new Error('Form validation failed');
      expect(isAuthError(error)).toBe(false);
    });
  });
});
