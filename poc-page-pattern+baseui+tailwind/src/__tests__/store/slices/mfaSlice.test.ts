/**
 * Tests for mfaSlice
 * Redux slice for MFA state management
 */

import mfaReducer, {
  startMfaSetup,
  setMfaDetails,
  completeMfaSetup,
  cancelMfaSetup,
} from '../../../store/slices/mfaSlice';

describe('mfaSlice', () => {
  const initialState = {
    qrCodeUrl: null,
    secret: null,
    backupCodes: [],
    isSetupMode: false,
  };

  describe('Initial State', () => {
    it('should return the initial state', () => {
      expect(mfaReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should initialize with setup mode false', () => {
      const state = mfaReducer(undefined, { type: 'unknown' });
      expect(state.isSetupMode).toBe(false);
      expect(state.qrCodeUrl).toBeNull();
      expect(state.secret).toBeNull();
      expect(state.backupCodes).toEqual([]);
    });
  });

  describe('startMfaSetup', () => {
    it('should enter setup mode', () => {
      const state = mfaReducer(initialState, startMfaSetup());

      expect(state.isSetupMode).toBe(true);
      expect(state.qrCodeUrl).toBeNull();
      expect(state.secret).toBeNull();
    });

    it('should work when already in setup mode', () => {
      const stateInSetup = {
        ...initialState,
        isSetupMode: true,
        qrCodeUrl: 'old-url',
        secret: 'old-secret',
      };

      const state = mfaReducer(stateInSetup, startMfaSetup());

      expect(state.isSetupMode).toBe(true);
    });
  });

  describe('setMfaDetails', () => {
    it('should set MFA details', () => {
      const details = {
        qrCodeUrl: 'https://example.com/qr',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['ABC123', 'DEF456', 'GHI789'],
      };

      const state = mfaReducer(initialState, setMfaDetails(details));

      expect(state.qrCodeUrl).toBe('https://example.com/qr');
      expect(state.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(state.backupCodes).toEqual(['ABC123', 'DEF456', 'GHI789']);
      expect(state.isSetupMode).toBe(false); // setMfaDetails doesn't change setup mode
    });

    it('should update existing MFA details', () => {
      const oldState = {
        qrCodeUrl: 'old-url',
        secret: 'old-secret',
        backupCodes: ['OLD1', 'OLD2'],
        isSetupMode: true,
      };

      const newDetails = {
        qrCodeUrl: 'new-url',
        secret: 'new-secret',
        backupCodes: ['NEW1', 'NEW2', 'NEW3'],
      };

      const state = mfaReducer(oldState, setMfaDetails(newDetails));

      expect(state.qrCodeUrl).toBe('new-url');
      expect(state.secret).toBe('new-secret');
      expect(state.backupCodes).toHaveLength(3);
    });

    it('should handle empty backup codes', () => {
      const details = {
        qrCodeUrl: 'url',
        secret: 'secret',
        backupCodes: [],
      };

      const state = mfaReducer(initialState, setMfaDetails(details));

      expect(state.backupCodes).toEqual([]);
    });

    it('should handle many backup codes', () => {
      const details = {
        qrCodeUrl: 'url',
        secret: 'secret',
        backupCodes: Array.from({ length: 10 }, (_, i) => `CODE${i}`),
      };

      const state = mfaReducer(initialState, setMfaDetails(details));

      expect(state.backupCodes).toHaveLength(10);
    });
  });

  describe('completeMfaSetup', () => {
    it('should complete setup and clear details', () => {
      const stateWithDetails = {
        qrCodeUrl: 'url',
        secret: 'secret',
        backupCodes: ['CODE1', 'CODE2'],
        isSetupMode: true,
      };

      const state = mfaReducer(stateWithDetails, completeMfaSetup());

      expect(state.qrCodeUrl).toBeNull();
      expect(state.secret).toBeNull();
      expect(state.backupCodes).toEqual([]);
      expect(state.isSetupMode).toBe(false);
    });

    it('should work when already completed', () => {
      const state = mfaReducer(initialState, completeMfaSetup());

      expect(state.isSetupMode).toBe(false);
      expect(state.qrCodeUrl).toBeNull();
    });
  });

  describe('cancelMfaSetup', () => {
    it('should cancel setup and clear details', () => {
      const stateWithDetails = {
        qrCodeUrl: 'url',
        secret: 'secret',
        backupCodes: ['CODE1', 'CODE2'],
        isSetupMode: true,
      };

      const state = mfaReducer(stateWithDetails, cancelMfaSetup());

      expect(state.qrCodeUrl).toBeNull();
      expect(state.secret).toBeNull();
      expect(state.backupCodes).toEqual([]);
      expect(state.isSetupMode).toBe(false);
    });

    it('should work when not in setup mode', () => {
      const state = mfaReducer(initialState, cancelMfaSetup());

      expect(state.isSetupMode).toBe(false);
    });
  });

  describe('MFA Setup Lifecycle', () => {
    it('should handle complete setup flow', () => {
      let state: any = initialState;

      // Start setup
      state = mfaReducer(state, startMfaSetup());
      expect(state.isSetupMode).toBe(true);

      // Set details
      state = mfaReducer(
        state,
        setMfaDetails({
          qrCodeUrl: 'url',
          secret: 'secret',
          backupCodes: ['CODE1', 'CODE2'],
        })
      );
      expect(state.qrCodeUrl).toBe('url');
      expect(state.secret).toBe('secret');

      // Complete setup
      state = mfaReducer(state, completeMfaSetup());
      expect(state.isSetupMode).toBe(false);
      expect(state.qrCodeUrl).toBeNull();
    });

    it('should handle cancelled setup flow', () => {
      let state: any = initialState;

      // Start setup
      state = mfaReducer(state, startMfaSetup());
      expect(state.isSetupMode).toBe(true);

      // Set details
      state = mfaReducer(
        state,
        setMfaDetails({
          qrCodeUrl: 'url',
          secret: 'secret',
          backupCodes: ['CODE1'],
        })
      );
      expect(state.secret).toBe('secret');

      // Cancel setup
      state = mfaReducer(state, cancelMfaSetup());
      expect(state.isSetupMode).toBe(false);
      expect(state.secret).toBeNull();
    });

    it('should handle multiple setup attempts', () => {
      let state: any = initialState;

      // First attempt
      state = mfaReducer(state, startMfaSetup());
      state = mfaReducer(
        state,
        setMfaDetails({
          qrCodeUrl: 'url1',
          secret: 'secret1',
          backupCodes: ['A'],
        })
      );
      state = mfaReducer(state, cancelMfaSetup());

      // Second attempt
      state = mfaReducer(state, startMfaSetup());
      state = mfaReducer(
        state,
        setMfaDetails({
          qrCodeUrl: 'url2',
          secret: 'secret2',
          backupCodes: ['B', 'C'],
        })
      );
      expect(state.qrCodeUrl).toBe('url2');
      expect(state.backupCodes).toHaveLength(2);

      state = mfaReducer(state, completeMfaSetup());
      expect(state.isSetupMode).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long QR code URLs', () => {
      const longUrl = 'https://example.com/' + 'x'.repeat(500);
      
      const state = mfaReducer(
        initialState,
        setMfaDetails({
          qrCodeUrl: longUrl,
          secret: 'secret',
          backupCodes: [],
        })
      );

      expect(state.qrCodeUrl).toBe(longUrl);
      expect(state.qrCodeUrl?.length).toBeGreaterThan(500);
    });

    it('should handle special characters in secret', () => {
      const specialSecret = 'ABC123-456_789+xyz';

      const state = mfaReducer(
        initialState,
        setMfaDetails({
          qrCodeUrl: 'url',
          secret: specialSecret,
          backupCodes: [],
        })
      );

      expect(state.secret).toBe(specialSecret);
    });

    it('should handle backup codes with special characters', () => {
      const backupCodes = [
        'ABC-123',
        'DEF_456',
        'GHI+789',
        'JKL/012',
      ];

      const state = mfaReducer(
        initialState,
        setMfaDetails({
          qrCodeUrl: 'url',
          secret: 'secret',
          backupCodes,
        })
      );

      expect(state.backupCodes).toEqual(backupCodes);
    });
  });

  describe('Type Safety', () => {
    it('should maintain correct state structure', () => {
      const state = mfaReducer(
        initialState,
        setMfaDetails({
          qrCodeUrl: 'url',
          secret: 'secret',
          backupCodes: ['CODE1'],
        })
      );

      expect(state).toHaveProperty('qrCodeUrl');
      expect(state).toHaveProperty('secret');
      expect(state).toHaveProperty('backupCodes');
      expect(state).toHaveProperty('isSetupMode');
      expect(Object.keys(state)).toHaveLength(4);
    });

    it('should maintain backup codes as array', () => {
      const state = mfaReducer(
        initialState,
        setMfaDetails({
          qrCodeUrl: 'url',
          secret: 'secret',
          backupCodes: ['A', 'B', 'C'],
        })
      );

      expect(Array.isArray(state.backupCodes)).toBe(true);
      expect(state.backupCodes).toHaveLength(3);
    });
  });
});
