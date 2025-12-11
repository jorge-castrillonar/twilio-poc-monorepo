import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SpaceXState {
  currentView: 'launches' | 'rockets' | 'capsules' | 'ships';
  launchesLimit: number;
  rocketsLimit: number;
}

const initialState: SpaceXState = {
  currentView: 'launches',
  launchesLimit: 20,
  rocketsLimit: 10,
};

const spacexSlice = createSlice({
  name: 'spacex',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<'launches' | 'rockets' | 'capsules' | 'ships'>) => {
      state.currentView = action.payload;
    },
    setLaunchesLimit: (state, action: PayloadAction<number>) => {
      state.launchesLimit = action.payload;
    },
    setRocketsLimit: (state, action: PayloadAction<number>) => {
      state.rocketsLimit = action.payload;
    },
  },
});

export const { setView, setLaunchesLimit, setRocketsLimit } = spacexSlice.actions;
export default spacexSlice.reducer;
