import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { SpaceXPage } from '../../pages/SpaceXPage';
import { spacexApi } from '../../store/spacexApi';
import spacexReducer from '../../store/slices/spacexSlice';

// Mock store for Storybook
const mockStore = configureStore({
  reducer: {
    [spacexApi.reducerPath]: spacexApi.reducer,
    spacex: spacexReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(spacexApi.middleware),
});

const meta: Meta<typeof SpaceXPage> = {
  title: 'Pages/SpaceXPage',
  component: SpaceXPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'SpaceX data explorer page with launches, rockets, capsules, and ships data from the public GraphQL API.',
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SpaceXPage>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default SpaceX page showing launches view.',
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    mockData: [
      {
        url: 'https://main--spacex-l4uc6p.apollographos.net/graphql',
        method: 'POST',
        status: 200,
        delay: 2000,
        response: {
          data: {
            launches: [],
            rockets: [],
            capsules: [],
            ships: [],
          },
        },
      },
    ],
    docs: {
      description: {
        story: 'SpaceX page in loading state.',
      },
    },
  },
};

export const WithData: Story = {
  parameters: {
    mockData: [
      {
        url: 'https://main--spacex-l4uc6p.apollographos.net/graphql',
        method: 'POST',
        status: 200,
        response: {
          data: {
            launches: [
              {
                id: '1',
                mission_name: 'Falcon Heavy Test Flight',
                launch_date_utc: '2018-02-06T20:45:00.000Z',
                launch_success: true,
                details: 'The Falcon Heavy test flight was the first attempt by SpaceX to launch their Falcon Heavy rocket.',
                links: {
                  mission_patch_small: 'https://images2.imgbox.com/3c/0e/T8iJcSN3_o.png',
                  article_link: 'https://spaceflightnow.com/2018/02/06/falcon-heavy-test-flight/',
                  video_link: 'https://www.youtube.com/watch?v=wbSwFU6tY1c',
                },
                rocket: {
                  rocket_name: 'Falcon Heavy',
                  rocket_type: 'FT',
                },
                launch_site: {
                  site_name_long: 'Kennedy Space Center Historic Launch Complex 39A',
                },
              },
            ],
            rockets: [
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
                description: 'Falcon 9 is a two-stage rocket designed and manufactured by SpaceX for the reliable and safe transport of satellites and the Dragon spacecraft into orbit.',
              },
            ],
          },
        },
      },
    ],
    docs: {
      description: {
        story: 'SpaceX page with sample data loaded.',
      },
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    mockData: [
      {
        url: 'https://main--spacex-l4uc6p.apollographos.net/graphql',
        method: 'POST',
        status: 500,
        response: {
          error: 'Internal Server Error',
        },
      },
    ],
    docs: {
      description: {
        story: 'SpaceX page in error state when API fails.',
      },
    },
  },
};