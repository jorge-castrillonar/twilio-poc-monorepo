/**
 * MFA Slice - Manages MFA setup state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MfaState {
  isSetupMode: boolean;
  qrCodeUrl: string | null;
  secret: string | null;
  backupCodes: string[];
}

const initialState: MfaState = {
  isSetupMode: false,
  qrCodeUrl: null,
  secret: null,
  backupCodes: [],
};

export const mfaSlice = createSlice({
  name: 'mfa',
  initialState,
  reducers: {
    startMfaSetup: (state) => {
      state.isSetupMode = true;
    },
    setMfaDetails: (
      state,
      action: PayloadAction<{ qrCodeUrl: string; secret: string; backupCodes: string[] }>
    ) => {
      state.qrCodeUrl = action.payload.qrCodeUrl;
      state.secret = action.payload.secret;
      state.backupCodes = action.payload.backupCodes;
    },
    completeMfaSetup: (state) => {
      state.isSetupMode = false;
      state.qrCodeUrl = null;
      state.secret = null;
      state.backupCodes = [];
    },
    cancelMfaSetup: (state) => {
      state.isSetupMode = false;
      state.qrCodeUrl = null;
      state.secret = null;
      state.backupCodes = [];
    },
  },
});

export const {
  startMfaSetup,
  setMfaDetails,
  completeMfaSetup,
  cancelMfaSetup,
} = mfaSlice.actions;
export default mfaSlice.reducer;
