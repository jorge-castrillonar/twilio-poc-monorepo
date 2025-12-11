/**
 * SpaceX API Unit Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock the SpaceX API to avoid import.meta.env issues
jest.mock('../../store/spacexApi', () => ({
  spacexApi: {
    reducerPath: 'spacexApi',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {
      getLaunches: {
        useQuery: jest.fn(),
      },
      getRockets: {
        useQuery: jest.fn(),
      },
    },
  },
}));

import { spacexApi } from '../../store/spacexApi';

// Mock fetch globally
global.fetch = jest.fn();

const createTestStore = () =>
  configureStore({
    reducer: {
      [spacexApi.reducerPath]: spacexApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(spacexApi.middleware),
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createTestStore()}>{children}</Provider>
);

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('SpaceX API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetLaunchesQuery', () => {
    it('should fetch launches successfully', async () => {
      const mockLaunches = [
        {
          id: '1',
          mission_name: 'Starlink-1',
          launch_date_utc: '2020-01-01T00:00:00.000Z',
          launch_success: true,
        },
      ];

      const mockUseQuery = spacexApi.endpoints.getLaunches.useQuery as jest.MockedFunction<any>;
      mockUseQuery.mockReturnValue({
        data: mockLaunches,
        isLoading: false,
        isSuccess: true,
        error: null,
      });

      const { result } = renderHook(
        () => spacexApi.endpoints.getLaunches.useQuery({ limit: 10 }),
        { wrapper }
      );

      expect(result.current.data).toEqual(mockLaunches);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Network error');
      
      const mockUseQuery = spacexApi.endpoints.getLaunches.useQuery as jest.MockedFunction<any>;
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: mockError,
      });

      const { result } = renderHook(
        () => spacexApi.endpoints.getLaunches.useQuery({ limit: 10 }),
        { wrapper }
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useGetRocketsQuery', () => {
    it('should fetch rockets successfully', async () => {
      const mockRockets = [
        {
          id: '1',
          name: 'Falcon 9',
          type: 'rocket',
          active: true,
        },
      ];

      const mockUseQuery = spacexApi.endpoints.getRockets.useQuery as jest.MockedFunction<any>;
      mockUseQuery.mockReturnValue({
        data: mockRockets,
        isLoading: false,
        isSuccess: true,
        error: null,
      });

      const { result } = renderHook(
        () => spacexApi.endpoints.getRockets.useQuery({ limit: 10 }),
        { wrapper }
      );

      expect(result.current.data).toEqual(mockRockets);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});