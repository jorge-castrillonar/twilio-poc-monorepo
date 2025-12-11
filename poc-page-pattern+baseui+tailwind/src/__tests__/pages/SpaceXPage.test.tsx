/**
 * SpaceXPage Unit Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { SpaceXPage } from '../../pages/SpaceXPage';
import spacexReducer from '../../store/slices/spacexSlice';

// Mock the SpaceX API completely to avoid import.meta.env issues
jest.mock('../../store/spacexApi', () => ({
  spacexApi: {
    reducerPath: 'spacexApi',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
}));

// Mock the SpaceX API hooks
jest.mock('../../graphql/spacex', () => ({
  useGetLaunchesQuery: jest.fn(),
  useGetRocketsQuery: jest.fn(),
  useGetCapsulesQuery: jest.fn(),
  useGetShipsQuery: jest.fn(),
}));

import { useGetLaunchesQuery, useGetRocketsQuery, useGetCapsulesQuery, useGetShipsQuery } from '../../graphql/spacex';
import { spacexApi } from '../../store/spacexApi';

const mockLaunches = [
  {
    id: '1',
    mission_name: 'Starlink-1',
    launch_date_utc: '2020-01-01T00:00:00.000Z',
    launch_success: true,
    details: 'Test launch',
    links: {
      mission_patch_small: 'https://example.com/patch.png',
    },
    rocket: {
      rocket_name: 'Falcon 9',
    },
  },
];

const mockRockets = [
  {
    id: '1',
    name: 'Falcon 9',
    type: 'rocket',
    active: true,
    country: 'United States',
    company: 'SpaceX',
    first_flight: '2010-06-04',
    success_rate_pct: 97,
    cost_per_launch: 50000000,
    description: 'Reusable rocket',
  },
];

const createTestStore = () =>
  configureStore({
    reducer: {
      spacex: spacexReducer,
      [spacexApi.reducerPath]: spacexApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(spacexApi.middleware),
  });

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

const mockUseGetLaunchesQuery = useGetLaunchesQuery as jest.MockedFunction<typeof useGetLaunchesQuery>;
const mockUseGetRocketsQuery = useGetRocketsQuery as jest.MockedFunction<typeof useGetRocketsQuery>;
const mockUseGetCapsulesQuery = useGetCapsulesQuery as jest.MockedFunction<typeof useGetCapsulesQuery>;
const mockUseGetShipsQuery = useGetShipsQuery as jest.MockedFunction<typeof useGetShipsQuery>;

describe('SpaceXPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock returns
    mockUseGetCapsulesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetShipsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render page title and description', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    expect(screen.getByText('SpaceX Data Explorer')).toBeInTheDocument();
    expect(screen.getByText(/Explore SpaceX launches, rockets, capsules, and ships/i)).toBeInTheDocument();
  });

  it('should render view toggle buttons with counts', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: mockLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: mockRockets,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    expect(screen.getByText(/Launches \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Rockets \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Capsules \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Ships \(0\)/)).toBeInTheDocument();
  });

  it('should display launches by default', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: mockLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    expect(screen.getByText('Recent Launches')).toBeInTheDocument();
  });

  it('should display launches table with data', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: mockLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    expect(screen.getByText('Starlink-1')).toBeInTheDocument();
    expect(screen.getByText('Falcon 9')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should switch to rockets view', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: mockLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: mockRockets,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const rocketsButton = screen.getByRole('button', { name: /rockets/i });
    fireEvent.click(rocketsButton);
    
    expect(screen.getByRole('heading', { name: 'Rockets' })).toBeInTheDocument();
  });

  it('should display rockets grid with data', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: mockRockets,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const rocketsButton = screen.getByRole('button', { name: /rockets/i });
    fireEvent.click(rocketsButton);
    
    expect(screen.getByText('Falcon 9')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('SpaceX')).toBeInTheDocument();
  });

  it('should show loading state for launches', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    expect(screen.getByText(/Loading launches/i)).toBeInTheDocument();
  });

  it('should show loading state for rockets', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const rocketsButton = screen.getByRole('button', { name: /rockets/i });
    fireEvent.click(rocketsButton);
    
    expect(screen.getByText(/Loading rockets/i)).toBeInTheDocument();
  });

  it('should display active badge for active rockets', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: mockRockets,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const rocketsButton = screen.getByRole('button', { name: /rockets/i });
    fireEvent.click(rocketsButton);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should format launch dates correctly', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: mockLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    // Date format may vary by locale, just check the date is displayed
    expect(screen.getByText(/1\/1\/2020|2020/)).toBeInTheDocument();
  });

  it('should display mission patch images', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: mockLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const img = screen.getByAltText('Starlink-1');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/patch.png');
  });

  it('should render search functionality', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    // Search is in PageHeader, look for input element
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter launches based on search term', async () => {
    const multiLaunches = [
      ...mockLaunches,
      {
        id: '2',
        mission_name: 'Crew Dragon Demo',
        launch_date_utc: '2020-05-30T00:00:00.000Z',
        launch_success: true,
        details: 'Demo mission',
        links: { mission_patch_small: null },
        rocket: { rocket_name: 'Falcon 9' },
      },
    ];
    
    mockUseGetLaunchesQuery.mockReturnValue({
      data: multiLaunches,
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Starlink' } });
    
    await waitFor(() => {
      expect(screen.getByText('Starlink-1')).toBeInTheDocument();
      expect(screen.queryByText('Crew Dragon Demo')).not.toBeInTheDocument();
    });
  });

  it('should switch to capsules view', async () => {
    const mockCapsules = [
      {
        id: 'C101',
        type: 'Dragon 1.0',
        status: 'retired',
        landings: 1,
        reuse_count: 0,
        original_launch: '2010-12-08T15:43:00.000Z',
      },
    ];
    
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetCapsulesQuery.mockReturnValue({
      data: mockCapsules,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const capsulesButton = screen.getByText(/Capsules \(1\)/);
    fireEvent.click(capsulesButton);
    
    await waitFor(() => {
      expect(screen.getByText('Capsules')).toBeInTheDocument();
      expect(screen.getByText('C101')).toBeInTheDocument();
      expect(screen.getByText('Dragon 1.0')).toBeInTheDocument();
    });
  });

  it('should switch to ships view', async () => {
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
    
    mockUseGetLaunchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    mockUseGetShipsQuery.mockReturnValue({
      data: mockShips,
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    const shipsButton = screen.getByText(/Ships \(1\)/);
    fireEvent.click(shipsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Ships')).toBeInTheDocument();
      expect(screen.getByText('GO Ms Tree')).toBeInTheDocument();
      expect(screen.getByText('Port Canaveral')).toBeInTheDocument();
    });
  });

  it('should show error states', () => {
    mockUseGetLaunchesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Network error' },
    } as any);
    mockUseGetRocketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    renderWithProviders(<SpaceXPage />);
    
    expect(screen.getByText('Error loading launches')).toBeInTheDocument();
  });
});