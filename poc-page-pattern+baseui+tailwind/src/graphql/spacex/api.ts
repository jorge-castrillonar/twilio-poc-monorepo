/**
 * SpaceX GraphQL API Slice
 * RTK Query integration for SpaceX public API
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Launch, Rocket, Capsule, LaunchFind, Ship } from './types';

const SPACEX_ENDPOINT = import.meta.env.VITE_SPACEX_GRAPHQL_URL || 'https://main--spacex-l4uc6p.apollographos.net/graphql';

export const spacexApi = createApi({
  reducerPath: 'spacexApi',
  baseQuery: fetchBaseQuery({
    baseUrl: SPACEX_ENDPOINT,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Launches', 'Rockets', 'Capsules', 'Ships'],
  endpoints: (builder) => ({
    getLaunches: builder.query<Launch[], { limit?: number; find?: LaunchFind }>({
      query: ({ limit = 10, find }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetLaunches($limit: Int, $find: LaunchFind) {
              launches(limit: $limit, find: $find) {
                id
                mission_name
                launch_date_utc
                launch_success
                details
                links {
                  mission_patch_small
                  article_link
                  video_link
                }
                rocket {
                  rocket_name
                  rocket_type
                }
                launch_site {
                  site_name_long
                }
              }
            }
          `,
          variables: { limit, find },
        },
      }),
      transformResponse: (response: any) => response.data.launches,
      providesTags: ['Launches'],
    }),

    getLaunch: builder.query<Launch, string>({
      query: (id) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetLaunch($id: ID!) {
              launch(id: $id) {
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
            }
          `,
          variables: { id },
        },
      }),
      transformResponse: (response: any) => response.data.launch,
      providesTags: ['Launches'],
    }),

    getRockets: builder.query<Rocket[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetRockets($limit: Int) {
              rockets(limit: $limit) {
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
                }
                diameter {
                  meters
                }
                mass {
                  kg
                }
                description
              }
            }
          `,
          variables: { limit },
        },
      }),
      transformResponse: (response: any) => response.data.rockets,
      providesTags: ['Rockets'],
    }),

    getCapsules: builder.query<Capsule[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query GetCapsules($limit: Int) {
              capsules(limit: $limit) {
                id
                landings
                type
                status
                reuse_count
                original_launch
              }
            }
          `,
          variables: { limit },
        },
      }),
      transformResponse: (response: any) => response.data.capsules,
      providesTags: ['Capsules'],
    }),

    getShips: builder.query<Ship[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
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
              }
            }
          `,
          variables: { limit },
        },
      }),
      transformResponse: (response: any) => response.data.ships,
      providesTags: ['Ships'],
    }),
  }),
});

export const {
  useGetLaunchesQuery,
  useGetLaunchQuery,
  useGetRocketsQuery,
  useGetCapsulesQuery,
  useGetShipsQuery,
} = spacexApi;
