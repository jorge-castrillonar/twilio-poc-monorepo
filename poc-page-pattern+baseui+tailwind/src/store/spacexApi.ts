/**
 * SpaceX GraphQL API Slice
 * Professional RTK Query implementation for SpaceX public API
 * 
 * Features:
 * - Comprehensive error handling
 * - Request/response transformation
 * - Intelligent caching with tags
 * - Type-safe GraphQL queries
 * - Performance optimizations
 */

import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { Launch, Rocket, Capsule, LaunchFind, Ship } from '../graphql/spacex/models';

// Configuration
const SPACEX_ENDPOINT = import.meta.env.VITE_SPACEX_GRAPHQL_URL || 'https://main--spacex-l4uc6p.apollographos.net/graphql';
const DEFAULT_CACHE_TIME = 5 * 60; // 5 minutes
const DEFAULT_STALE_TIME = 2 * 60; // 2 minutes

// Enhanced base query with retry logic
const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: SPACEX_ENDPOINT,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  {
    maxRetries: 3,
  }
);

// GraphQL query fragments for reusability
const LAUNCH_FRAGMENT = `
  fragment LaunchDetails on Launch {
    id
    mission_name
    launch_date_utc
    launch_success
    details
    links {
      mission_patch
      mission_patch_small
      article_link
      video_link
      flickr_images
    }
    rocket {
      rocket_name
      rocket_type
    }
    launch_site {
      site_name_long
    }
  }
`;

const ROCKET_FRAGMENT = `
  fragment RocketDetails on Rocket {
    id
    name
    type
    active
    stages
    boosters
    cost_per_launch
    success_rate_pct
    first_flight
    country
    company
    height {
      meters
      feet
    }
    diameter {
      meters
      feet
    }
    mass {
      kg
      lb
    }
    description
  }
`;

export const spacexApi = createApi({
  reducerPath: 'spacexApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Launch', 'Rocket', 'Capsule', 'Ship', 'Company'],
  keepUnusedDataFor: DEFAULT_CACHE_TIME,
  refetchOnMountOrArgChange: DEFAULT_STALE_TIME,
  endpoints: (builder) => ({
    // Launches endpoints
    getLaunches: builder.query<Launch[], { 
      limit?: number; 
      find?: LaunchFind;
      sort?: string;
      order?: 'asc' | 'desc';
    }>({
      query: ({ limit = 10, find, sort = 'launch_date_utc', order = 'desc' }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            ${LAUNCH_FRAGMENT}
            query GetLaunches($limit: Int, $find: LaunchFind, $sort: String, $order: String) {
              launches(limit: $limit, find: $find, sort: $sort, order: $order) {
                ...LaunchDetails
              }
            }
          `,
          variables: { limit: Math.min(limit, 100), find, sort, order },
        },
      }),
      transformResponse: (response: any) => {
        if (!response?.data?.launches) {
          throw new Error('Invalid response format');
        }
        return response.data.launches.filter(Boolean); // Remove null entries
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response?.data?.errors?.[0]?.message || 'Failed to fetch launches',
        timestamp: new Date().toISOString(),
      }),
      providesTags: (result) => [
        'Launch',
        ...(result?.map(({ id }) => ({ type: 'Launch' as const, id: id || 'unknown' })) ?? []),
      ],
      keepUnusedDataFor: DEFAULT_CACHE_TIME,
    }),

    getLaunch: builder.query<Launch, string>({
      query: (id) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            ${LAUNCH_FRAGMENT}
            query GetLaunch($id: ID!) {
              launch(id: $id) {
                ...LaunchDetails
              }
            }
          `,
          variables: { id },
        },
      }),
      transformResponse: (response: any) => {
        if (!response?.data?.launch) {
          throw new Error(`Launch with ID ${response.variables?.id} not found`);
        }
        return response.data.launch;
      },
      providesTags: (result, error, id) => [{ type: 'Launch', id }],
      keepUnusedDataFor: DEFAULT_CACHE_TIME * 2, // Cache individual launches longer
    }),

    getRockets: builder.query<Rocket[], { 
      limit?: number;
      active?: boolean;
    }>({
      query: ({ limit = 10, active }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            ${ROCKET_FRAGMENT}
            query GetRockets($limit: Int) {
              rockets(limit: $limit) {
                ...RocketDetails
              }
            }
          `,
          variables: { limit: Math.min(limit, 50) },
        },
      }),
      transformResponse: (response: any, meta, arg) => {
        if (!response?.data?.rockets) {
          throw new Error('Invalid response format');
        }
        let rockets = response.data.rockets.filter(Boolean);
        
        // Client-side filtering for active status if specified
        if (typeof arg.active === 'boolean') {
          rockets = rockets.filter((rocket: Rocket) => rocket.active === arg.active);
        }
        
        return rockets;
      },
      providesTags: (result) => [
        'Rocket',
        ...(result?.map(({ id }) => ({ type: 'Rocket' as const, id: id || 'unknown' })) ?? []),
      ],
      keepUnusedDataFor: DEFAULT_CACHE_TIME * 3, // Cache rockets longer as they change less frequently
    }),

    getCapsules: builder.query<Capsule[], { 
      limit?: number;
      status?: string;
      type?: string;
    }>({
      query: ({ limit = 15, status, type }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetCapsules($limit: Int, $status: String, $type: String) {
              capsules(limit: $limit, status: $status, type: $type) {
                id
                landings
                type
                status
                reuse_count
                original_launch
                missions {
                  name
                  flight
                }
              }
            }
          `,
          variables: { limit: Math.min(limit, 50), status, type },
        },
      }),
      transformResponse: (response: any) => {
        if (!response?.data?.capsules) {
          throw new Error('Invalid response format');
        }
        return response.data.capsules.filter(Boolean);
      },
      providesTags: (result) => [
        'Capsule',
        ...(result?.map(({ id }) => ({ type: 'Capsule' as const, id: id || 'unknown' })) ?? []),
      ],
    }),

    getShips: builder.query<Ship[], { 
      limit?: number;
      active?: boolean;
      type?: string;
    }>({
      query: ({ limit = 12, active, type }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetShips($limit: Int) {
              ships(limit: $limit) {
                id
                name
                type
                active
                home_port
                year_built
                image
                missions {
                  name
                  flight
                }
                position {
                  latitude
                  longitude
                }
              }
            }
          `,
          variables: { limit: Math.min(limit, 50) },
        },
      }),
      transformResponse: (response: any, meta, arg) => {
        if (!response?.data?.ships) {
          throw new Error('Invalid response format');
        }
        let ships = response.data.ships.filter(Boolean);
        
        // Client-side filtering
        if (typeof arg.active === 'boolean') {
          ships = ships.filter((ship: Ship) => ship.active === arg.active);
        }
        if (arg.type) {
          ships = ships.filter((ship: Ship) => 
            ship.type?.toLowerCase().includes(arg.type!.toLowerCase())
          );
        }
        
        return ships;
      },
      providesTags: (result) => [
        'Ship',
        ...(result?.map(({ id }) => ({ type: 'Ship' as const, id: id || 'unknown' })) ?? []),
      ],
    }),
    
    // Company info endpoint
    getCompanyInfo: builder.query<any, void>({
      query: () => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetCompanyInfo {
              company {
                name
                founder
                founded
                employees
                vehicles
                launch_sites
                test_sites
                ceo
                cto
                coo
                cto_propulsion
                valuation
                headquarters {
                  address
                  city
                  state
                }
                summary
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => response.data.company,
      providesTags: ['Company'],
      keepUnusedDataFor: DEFAULT_CACHE_TIME * 6, // Cache company info for 30 minutes
    }),
  }),
});

// Export hooks with enhanced names for clarity
export const {
  useGetLaunchesQuery,
  useGetLaunchQuery,
  useGetRocketsQuery,
  useGetCapsulesQuery,
  useGetShipsQuery,
  useGetCompanyInfoQuery,
  
  // Lazy query hooks for on-demand fetching
  useLazyGetLaunchesQuery,
  useLazyGetLaunchQuery,
  useLazyGetRocketsQuery,
  useLazyGetCapsulesQuery,
  useLazyGetShipsQuery,
  
  // Prefetch hooks for performance optimization
  usePrefetch,
} = spacexApi;

// Utility functions for cache management
export const {
  util: { 
    getRunningQueriesThunk,
    invalidateTags: invalidateTagsAction,
  },
} = spacexApi;

// Enhanced error handling utility
export const isSpaceXApiError = (error: any): error is { status: number; message: string; timestamp: string } => {
  return error && typeof error === 'object' && 'status' in error && 'message' in error;
};

// Cache warming utility
export const warmSpaceXCache = () => (dispatch: any) => {
  // Prefetch commonly accessed data
  dispatch(spacexApi.util.prefetch('getLaunches', { limit: 20 }, { force: false }));
  dispatch(spacexApi.util.prefetch('getRockets', { limit: 10 }, { force: false }));
  dispatch(spacexApi.util.prefetch('getCompanyInfo', undefined, { force: false }));
};

export default spacexApi;