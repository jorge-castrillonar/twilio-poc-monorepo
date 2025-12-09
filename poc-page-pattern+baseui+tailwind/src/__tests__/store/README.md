# Redux Store Tests

This folder contains tests for Redux slices, reducers, and store configuration.

## Structure

```
store/
├── slices/
│   ├── authSlice.test.ts       - Authentication state tests
│   ├── mfaSlice.test.ts        - MFA state tests
│   └── filesSlice.test.ts      - File upload state tests
├── graphqlApi.test.ts          - RTK Query API tests
└── README.md                   - This file
```

## Pending Tests

### Slices
- ❌ **authSlice.test.ts** - Authentication state management
- ❌ **mfaSlice.test.ts** - MFA state management
- ❌ **filesSlice.test.ts** - File upload tracking

### API
- ❌ **graphqlApi.test.ts** - RTK Query endpoints

**Total: 0 tests (needs implementation)**

## Test Philosophy

Redux tests focus on:
1. **Reducers** - State updates correctly for each action
2. **Actions** - Action creators generate correct actions
3. **Selectors** - Selectors return correct state slices
4. **Initial State** - State initializes correctly
5. **Side Effects** - Async thunks and extraReducers work
6. **RTK Query** - Mutations and queries configured correctly

## Testing Redux Slices

Example pattern for testing slices:

```typescript
import reducer, { 
  setCredentials, 
  logout 
} from '../../../store/slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('setCredentials should update auth state', () => {
    const credentials = {
      token: 'test-token',
      refreshToken: 'test-refresh',
      user: { id: '1', email: 'test@example.com' },
    };
    
    const actual = reducer(initialState, setCredentials(credentials));
    
    expect(actual.token).toBe('test-token');
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.user).toEqual(credentials.user);
  });

  it('logout should clear auth state', () => {
    const loggedInState = {
      user: { id: '1', email: 'test@example.com' },
      token: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
    };
    
    const actual = reducer(loggedInState, logout());
    
    expect(actual).toEqual(initialState);
  });
});
```

## Testing RTK Query

Example pattern for testing RTK Query API:

```typescript
import { graphqlApi } from '../../../store/graphqlApi';
import { setupApiStore } from '../testUtils';

describe('graphqlApi', () => {
  it('login mutation should work', async () => {
    const storeRef = setupApiStore(graphqlApi);
    
    const result = await storeRef.store.dispatch(
      graphqlApi.endpoints.login.initiate({
        email: 'test@example.com',
        password: 'password'
      })
    );
    
    expect(result.data).toEqual({
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: 'test@example.com' }
    });
  });
});
```

## Priority Tests Needed

### Priority 1: authSlice.test.ts (CRITICAL)
Tests needed:
- ✅ Initial state
- ✅ setCredentials action
- ✅ logout action
- ✅ login.fulfilled extraReducer
- ✅ tokenManager integration
- ✅ Token persistence

### Priority 2: mfaSlice.test.ts (HIGH)
Tests needed:
- ✅ Initial state
- ✅ startMfaSetup action
- ✅ setMfaDetails action
- ✅ completeMfaSetup action
- ✅ cancelMfaSetup action

### Priority 3: filesSlice.test.ts (MEDIUM)
Tests needed:
- ✅ Initial state
- ✅ startUpload action
- ✅ updateProgress action
- ✅ completeUpload action
- ✅ failUpload action
- ✅ clearUpload action

### Priority 4: graphqlApi.test.ts (MEDIUM)
Tests needed:
- ✅ Login mutation
- ✅ MFA mutations (setup, enable, disable)
- ✅ File mutations (generateUploadUrl, completeUpload)
- ✅ Files query
- ✅ prepareHeaders with tokenManager
- ✅ Error handling
- ✅ Cache invalidation

## Running Tests

```bash
# Run all store tests (when implemented)
npm test -- __tests__/store

# Run specific slice test
npm test -- authSlice.test.ts

# Run in watch mode
npm test -- __tests__/store --watch
```

## Test Coverage Target

Redux tests should aim for:
- **100% code coverage** - All reducers and actions tested
- **All action types** - Every action creator tested
- **All state transitions** - Every state change validated
- **Edge cases** - Invalid actions, undefined state

## Adding New Store Tests

1. Create test file in appropriate subfolder
2. Import slice/API from `../../../store/...`
3. Test initial state
4. Test each action/reducer
5. Test extraReducers for async operations
6. Verify tokenManager integration where applicable
7. Mock GraphQL responses if testing RTK Query

## Test Utilities

Consider creating `testUtils.ts` with helpers:

```typescript
// Store setup helper
export const setupApiStore = (api: any, extraReducers?: any) => {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      ...extraReducers,
    },
    middleware: (gDM) => gDM().concat(api.middleware),
  });
  
  return { store, api };
};

// Mock tokenManager
export const mockTokenManager = () => {
  jest.mock('../../../utils/tokenManager', () => ({
    setTokens: jest.fn(),
    getAccessToken: jest.fn(() => 'mock-token'),
    getRefreshToken: jest.fn(() => 'mock-refresh'),
    clearAll: jest.fn(),
    hasValidTokens: jest.fn(() => true),
  }));
};
```

## Dependencies

- `@reduxjs/toolkit` - Redux Toolkit utilities
- `jest` - Test runner
- `msw` - Mock Service Worker for API mocking
- `whatwg-fetch` - Fetch polyfill for tests
