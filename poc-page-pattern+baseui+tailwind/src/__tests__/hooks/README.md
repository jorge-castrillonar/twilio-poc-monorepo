# Hook Tests

This folder contains unit tests for custom React hooks.

## Structure

All hook tests follow the pattern:
```
useHookName.test.ts
```

## Pending Tests

- ❌ **useAuth.test.ts** - Authentication hook (login, logout, token management)
- ❌ **useMfa.test.ts** - MFA management hook (setup, enable, disable)
- ❌ **useFiles.test.ts** - File operations hook (upload, list, delete)

**Total: 0 tests (needs implementation)**

## Test Philosophy

Hook tests focus on:
1. **State Management** - Hook state updates correctly
2. **Side Effects** - API calls, Redux dispatches work correctly
3. **Error Handling** - Errors are caught and handled
4. **Redux Integration** - Actions dispatch, selectors work
5. **RTK Query** - Mutations and queries work correctly
6. **Loading States** - Loading flags update properly

## Testing Hooks with Redux

Hooks that use Redux need special setup:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '../../hooks/useAuth';
import authReducer from '../../store/slices/authSlice';

// Create test store
const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers as needed
  },
});

// Wrapper component
const wrapper = ({ children }) => (
  <Provider store={createTestStore()}>
    {children}
  </Provider>
);

// Test hook
test('useAuth login works', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper });
  
  await act(async () => {
    await result.current.login('test@example.com', 'password');
  });
  
  expect(result.current.isAuthenticated).toBe(true);
});
```

## Priority Tests Needed

### Priority 1: useAuth.test.ts (CRITICAL)
Tests needed:
- ✅ login() with valid credentials
- ✅ login() with invalid credentials (error handling)
- ✅ logout() clears token and state
- ✅ Token stored in tokenManager (not localStorage)
- ✅ isAuthenticated state updates
- ✅ updateUser() updates user data
- ✅ Token persists on page refresh (sessionStorage)

### Priority 2: useMfa.test.ts (HIGH)
Tests needed:
- ✅ setupMfa() generates QR code and secret
- ✅ enableMfa() with valid TOTP code
- ✅ enableMfa() with invalid TOTP code
- ✅ disableMfa() removes MFA
- ✅ MFA state management (isSetupMode)
- ✅ Error handling for all operations

### Priority 3: useFiles.test.ts (MEDIUM)
Tests needed:
- ✅ useGetFilesQuery() fetches files list
- ✅ uploadFile() uploads to S3
- ✅ Upload progress tracking
- ✅ Upload error handling
- ✅ completeUpload() marks file as complete
- ✅ Upload state management (Redux)

## Running Tests

```bash
# Run all hook tests (when implemented)
npm test -- __tests__/hooks

# Run specific hook test
npm test -- useAuth.test.ts

# Run in watch mode
npm test -- __tests__/hooks --watch
```

## Test Coverage Target

Hook tests should aim for:
- **90%+ code coverage** - All branches tested
- **Error scenarios** - All error cases handled
- **Redux integration** - All dispatches verified
- **API mocking** - All GraphQL calls mocked

## Adding New Hook Tests

1. Create `useHookName.test.ts` in this folder
2. Import hook from `../../hooks/useHookName`
3. Set up Redux provider wrapper if needed
4. Mock GraphQL API calls with MSW or jest.mock
5. Test all hook functions and state changes
6. Verify error handling
7. Check Redux state updates

## Dependencies

- `@testing-library/react` - Hook rendering with renderHook
- `@testing-library/react-hooks` - Hook testing utilities
- `react-redux` - Redux provider for tests
- `@reduxjs/toolkit` - Store creation for tests
- `msw` - Mock Service Worker for API mocking
- `jest` - Test runner
