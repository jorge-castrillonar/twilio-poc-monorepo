/**
 * SpaceX API Integration Tests
 */

// Mock import.meta.env before importing spacexApi
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SPACEX_GRAPHQL_URL: 'https://main--spacex-l4uc6p.apollographos.net/graphql'
      }
    }
  }
});

import { configureStore } from '@reduxjs/toolkit';
import { spacexApi } from '../../store/spacexApi';

// Mock fetch for testing
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const createTestStore = () =>
  configureStore({
    reducer: {
      [spacexApi.reducerPath]: spacexApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(spacexApi.middleware),
  });

describe('spacexApi Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getLaunches endpoint', () => {
    it('should fetch launches with correct GraphQL query', async () => {
      const mockLaunches = [
        {
          id: '1',
          mission_name: 'Starlink-1',
          launch_date_utc: '2020-01-01T00:00:00.000Z',
          launch_success: true,
          details: 'Test launch',
          links: {
            mission_patch_small: 'https://example.com/patch.png',
            article_link: 'https://example.com/article',
            video_link: 'https://example.com/video',
          },
          rocket: {
            rocket_name: 'Falcon 9',
            rocket_type: 'FT',
          },
          launch_site: {
            site_name_long: 'Kennedy Space Center',
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { launches: mockLaunches } }),
      } as Response);

      const result = await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10 })
      );

      expect(result.data).toEqual(mockLaunches);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('launches'),
        })
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.query).toContain('query GetLaunches');
      expect(requestBody.variables.limit).toBe(10);
    });

    it('should handle find parameter correctly', async () => {
      const findParams = { mission_name: 'Starlink' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { launches: [] } }),
      } as Response);

      await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10, find: findParams })
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.variables.find).toEqual(findParams);
    });
  });

  describe('getRockets endpoint', () => {
    it('should fetch rockets with correct GraphQL query', async () => {
      const mockRockets = [
        {
          id: '1',
          name: 'Falcon 9',
          type: 'rocket',
          active: true,
          stages: 2,
          boosters: 0,
          cost_per_launch: 62000000,
          success_rate_pct: 97,
          first_flight: '2010-06-04',
          country: 'United States',
          company: 'SpaceX',
          height: { meters: 70 },
          diameter: { meters: 3.7 },
          mass: { kg: 549054 },
          description: 'Falcon 9 description',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { rockets: mockRockets } }),
      } as Response);

      const result = await store.dispatch(
        spacexApi.endpoints.getRockets.initiate({ limit: 10 })
      );

      expect(result.data).toEqual(mockRockets);
      
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.query).toContain('query GetRockets');
      expect(requestBody.variables.limit).toBe(10);
    });
  });

  describe('getCapsules endpoint', () => {
    it('should fetch capsules with correct GraphQL query', async () => {
      const mockCapsules = [
        {
          id: 'C101',
          landings: 1,
          type: 'Dragon 1.0',
          status: 'retired',
          reuse_count: 0,
          original_launch: '2010-12-08T15:43:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { capsules: mockCapsules } }),
      } as Response);

      const result = await store.dispatch(
        spacexApi.endpoints.getCapsules.initiate({ limit: 10 })
      );

      expect(result.data).toEqual(mockCapsules);
      
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.query).toContain('query GetCapsules');
    });
  });

  describe('getShips endpoint', () => {
    it('should fetch ships with correct GraphQL query', async () => {
      const mockShips = [
        {
          id: 'GOMSTREE',
          name: 'GO Ms Tree',
          type: 'Cargo',
          active: true,
          home_port: 'Port Canaveral',
          year_built: 2015,
          image: 'https://example.com/ship.jpg',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ships: mockShips } }),
      } as Response);

      const result = await store.dispatch(
        spacexApi.endpoints.getShips.initiate({ limit: 10 })
      );

      expect(result.data).toEqual(mockShips);
      
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.query).toContain('query GetShips');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10 })
      );

      expect(result.error).toBeDefined();
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10 })
      );

      expect(result.error).toBeDefined();
    });

    it('should handle GraphQL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: 'GraphQL error' }],
          data: null,
        }),
      } as Response);

      const result = await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10 })
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('caching behavior', () => {
    it('should cache results and not refetch immediately', async () => {
      const mockLaunches = [{ id: '1', mission_name: 'Test' }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { launches: mockLaunches } }),
      } as Response);

      // First call
      await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10 })
      );

      // Second call with same parameters
      await store.dispatch(
        spacexApi.endpoints.getLaunches.initiate({ limit: 10 })
      );

      // Should only make one network request due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});