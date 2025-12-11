import spacexReducer, { setView, setLaunchesLimit, setRocketsLimit } from '../../../store/slices/spacexSlice';

describe('spacexSlice', () => {
  const initialState = {
    currentView: 'launches' as const,
    launchesLimit: 20,
    rocketsLimit: 10,
  };

  it('should return initial state', () => {
    expect(spacexReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setView', () => {
    const actual = spacexReducer(initialState, setView('rockets'));
    expect(actual.currentView).toBe('rockets');
  });

  it('should handle setLaunchesLimit', () => {
    const actual = spacexReducer(initialState, setLaunchesLimit(50));
    expect(actual.launchesLimit).toBe(50);
  });

  it('should handle setRocketsLimit', () => {
    const actual = spacexReducer(initialState, setRocketsLimit(25));
    expect(actual.rocketsLimit).toBe(25);
  });
});
