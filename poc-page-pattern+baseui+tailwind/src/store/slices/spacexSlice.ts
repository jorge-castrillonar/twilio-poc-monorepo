/**
 * SpaceX UI State Management Slice
 * Manages view state, pagination, and user preferences for SpaceX data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export type SpaceXView = 'launches' | 'rockets' | 'capsules' | 'ships';

export interface SpaceXFilters {
  searchTerm: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
}

export interface SpaceXPagination {
  launchesLimit: number;
  rocketsLimit: number;
  capsulesLimit: number;
  shipsLimit: number;
}

export interface SpaceXPreferences {
  defaultView: SpaceXView;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

export interface SpaceXState {
  // Current UI state
  currentView: SpaceXView;
  
  // Pagination settings
  pagination: SpaceXPagination;
  
  // Filter state
  filters: SpaceXFilters;
  
  // User preferences
  preferences: SpaceXPreferences;
  
  // UI state
  isFullscreen: boolean;
  selectedItems: {
    launches: string[];
    rockets: string[];
    capsules: string[];
    ships: string[];
  };
}

// Constants
const DEFAULT_LIMITS = {
  launchesLimit: 20,
  rocketsLimit: 10,
  capsulesLimit: 15,
  shipsLimit: 12,
} as const;

const initialState: SpaceXState = {
  currentView: 'launches',
  pagination: DEFAULT_LIMITS,
  filters: {
    searchTerm: '',
  },
  preferences: {
    defaultView: 'launches',
    autoRefresh: false,
    refreshInterval: 30,
  },
  isFullscreen: false,
  selectedItems: {
    launches: [],
    rockets: [],
    capsules: [],
    ships: [],
  },
};

const spacexSlice = createSlice({
  name: 'spacex',
  initialState,
  reducers: {
    // View management
    setView: (state, action: PayloadAction<SpaceXView>) => {
      state.currentView = action.payload;
      // Clear selections when switching views
      Object.keys(state.selectedItems).forEach(key => {
        state.selectedItems[key as keyof typeof state.selectedItems] = [];
      });
    },
    
    // Pagination management
    setLaunchesLimit: (state, action: PayloadAction<number>) => {
      state.pagination.launchesLimit = Math.max(1, Math.min(100, action.payload));
    },
    
    setRocketsLimit: (state, action: PayloadAction<number>) => {
      state.pagination.rocketsLimit = Math.max(1, Math.min(50, action.payload));
    },
    
    setCapsulesLimit: (state, action: PayloadAction<number>) => {
      state.pagination.capsulesLimit = Math.max(1, Math.min(50, action.payload));
    },
    
    setShipsLimit: (state, action: PayloadAction<number>) => {
      state.pagination.shipsLimit = Math.max(1, Math.min(50, action.payload));
    },
    
    // Filter management
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    
    setDateRange: (state, action: PayloadAction<{ start: string; end: string } | undefined>) => {
      state.filters.dateRange = action.payload;
    },
    
    setStatusFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.status = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
      };
    },
    
    // Selection management
    toggleItemSelection: (state, action: PayloadAction<{ view: SpaceXView; itemId: string }>) => {
      const { view, itemId } = action.payload;
      const selected = state.selectedItems[view];
      const index = selected.indexOf(itemId);
      
      if (index > -1) {
        selected.splice(index, 1);
      } else {
        selected.push(itemId);
      }
    },
    
    selectAllItems: (state, action: PayloadAction<{ view: SpaceXView; itemIds: string[] }>) => {
      const { view, itemIds } = action.payload;
      state.selectedItems[view] = [...itemIds];
    },
    
    clearSelection: (state, action: PayloadAction<SpaceXView>) => {
      state.selectedItems[action.payload] = [];
    },
    
    // Preferences management
    updatePreferences: (state, action: PayloadAction<Partial<SpaceXPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // UI state management
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    // Reset to defaults
    resetToDefaults: (state) => {
      return { ...initialState, preferences: state.preferences };
    },
  },
});

// Action creators
export const {
  setView,
  setLaunchesLimit,
  setRocketsLimit,
  setCapsulesLimit,
  setShipsLimit,
  setSearchTerm,
  setDateRange,
  setStatusFilter,
  clearFilters,
  toggleItemSelection,
  selectAllItems,
  clearSelection,
  updatePreferences,
  toggleFullscreen,
  resetToDefaults,
} = spacexSlice.actions;

// Selectors
export const selectCurrentView = (state: { spacex: SpaceXState }) => state.spacex.currentView;
export const selectPagination = (state: { spacex: SpaceXState }) => state.spacex.pagination;
export const selectFilters = (state: { spacex: SpaceXState }) => state.spacex.filters;
export const selectPreferences = (state: { spacex: SpaceXState }) => state.spacex.preferences;
export const selectSelectedItems = (state: { spacex: SpaceXState }) => state.spacex.selectedItems;
export const selectIsFullscreen = (state: { spacex: SpaceXState }) => state.spacex.isFullscreen;

// Complex selectors
export const selectCurrentLimit = (state: { spacex: SpaceXState }) => {
  const { currentView, pagination } = state.spacex;
  switch (currentView) {
    case 'launches': return pagination.launchesLimit;
    case 'rockets': return pagination.rocketsLimit;
    case 'capsules': return pagination.capsulesLimit;
    case 'ships': return pagination.shipsLimit;
    default: return 10;
  }
};

export const selectCurrentSelection = (state: { spacex: SpaceXState }) => {
  const { currentView, selectedItems } = state.spacex;
  return selectedItems[currentView];
};

export default spacexSlice.reducer;
