# Integration Tests

This folder contains integration tests for complete user flows and feature interactions.

## Structure

```
integration/
├── LoginFlow.test.tsx          - Complete login user journey
├── MfaFlow.test.tsx            - MFA setup and validation flow
├── FileUploadFlow.test.tsx     - File upload from start to finish
└── README.md                   - This file
```

## Pending Tests

- ❌ **LoginFlow.test.tsx** - Login → Authenticate → Navigate
- ❌ **MfaFlow.test.tsx** - Setup MFA → QR Code → Enable
- ❌ **FileUploadFlow.test.tsx** - Select File → Upload → Progress → Complete

**Total: 0 tests (needs implementation)**

## Test Philosophy

Integration tests focus on:
1. **Complete User Journeys** - Multiple steps working together
2. **Component Interaction** - Components communicating correctly
3. **Redux State Flow** - State updates across actions
4. **API Integration** - GraphQL calls and responses
5. **Navigation** - Route changes and redirects
6. **Real User Behavior** - Simulating actual user workflows

## Integration Test Pattern

Integration tests use React Testing Library with Redux and React Router:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from '../../pages/LoginPage';
import authReducer from '../../store/slices/authSlice';
import { graphqlApi } from '../../store/graphqlApi';

// Create test store with all reducers
const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer,
    [graphqlApi.reducerPath]: graphqlApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(graphqlApi.middleware),
});

// Wrapper with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={createTestStore()}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

// Custom render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

// Integration test
describe('Login Flow', () => {
  it('complete login journey', async () => {
    const user = userEvent.setup();
    
    // 1. Render login page
    renderWithProviders(<LoginPage />);
    
    // 2. User enters credentials
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // 3. User clicks login
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // 4. Wait for authentication
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    // 5. Verify token stored securely
    // (would need to inject tokenManager spy)
  });
});
```

## Priority Integration Tests

### Priority 1: LoginFlow.test.tsx (CRITICAL)

**Test: Successful Login**
```typescript
describe('Login Flow - Success', () => {
  it('user logs in successfully', async () => {
    // 1. User navigates to /login
    // 2. User enters valid email and password
    // 3. User clicks "Sign In" button
    // 4. API returns tokens and user data
    // 5. Token stored in tokenManager
    // 6. Redux auth state updated
    // 7. User redirected to /dashboard
    // 8. User sees dashboard content
  });
});
```

**Test: Failed Login**
```typescript
describe('Login Flow - Error', () => {
  it('shows error on invalid credentials', async () => {
    // 1. User enters wrong password
    // 2. User clicks "Sign In"
    // 3. API returns error
    // 4. Alert shows error message
    // 5. User stays on login page
    // 6. No token stored
  });
});
```

**Test: Token Persistence**
```typescript
describe('Login Flow - Persistence', () => {
  it('user stays logged in after refresh', async () => {
    // 1. User logs in successfully
    // 2. Token stored in sessionStorage
    // 3. Simulate page refresh (remount App)
    // 4. Token loaded from sessionStorage
    // 5. User still authenticated
    // 6. User sees protected content
  });
});
```

### Priority 2: MfaFlow.test.tsx (HIGH)

**Test: MFA Setup**
```typescript
describe('MFA Flow - Setup', () => {
  it('user sets up MFA successfully', async () => {
    // 1. User navigates to /mfa
    // 2. User clicks "Setup MFA"
    // 3. API generates QR code and secret
    // 4. QR code displayed to user
    // 5. User scans with authenticator app
    // 6. User enters 6-digit TOTP code
    // 7. User clicks "Enable MFA"
    // 8. API validates TOTP code
    // 9. Success alert shown
    // 10. MFA enabled in user state
  });
});
```

**Test: MFA Disable**
```typescript
describe('MFA Flow - Disable', () => {
  it('user disables MFA', async () => {
    // 1. User has MFA enabled
    // 2. User clicks "Disable MFA"
    // 3. Confirmation shown
    // 4. User confirms
    // 5. API disables MFA
    // 6. Success message shown
    // 7. MFA disabled in state
  });
});
```

### Priority 3: FileUploadFlow.test.tsx (MEDIUM)

**Test: File Upload Success**
```typescript
describe('File Upload Flow - Success', () => {
  it('user uploads file successfully', async () => {
    // 1. User navigates to /files
    // 2. User clicks "Upload File"
    // 3. Modal opens
    // 4. User selects file (mock File API)
    // 5. User clicks "Upload"
    // 6. API generates S3 upload URL
    // 7. File uploads to S3 (mock xhr)
    // 8. Progress bar updates
    // 9. API marks upload complete
    // 10. Success alert shown
    // 11. File appears in files list
    // 12. Modal closes
  });
});
```

**Test: File Upload Error**
```typescript
describe('File Upload Flow - Error', () => {
  it('shows error on upload failure', async () => {
    // 1. User starts upload
    // 2. Upload fails (network error)
    // 3. Error alert shown
    // 4. Upload marked as failed in state
    // 5. User can retry
  });
});
```

## Mocking APIs

Use Mock Service Worker (MSW) for API mocking:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock GraphQL API
const server = setupServer(
  rest.post('/graphql', (req, res, ctx) => {
    const { operationName } = req.body;
    
    if (operationName === 'Login') {
      return res(
        ctx.json({
          data: {
            login: {
              token: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              user: {
                id: '1',
                email: 'test@example.com',
                fullName: 'Test User',
              },
            },
          },
        })
      );
    }
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Running Tests

```bash
# Run all integration tests (when implemented)
npm test -- __tests__/integration

# Run specific flow test
npm test -- LoginFlow.test.tsx

# Run in watch mode
npm test -- __tests__/integration --watch

# Run with coverage
npm test -- __tests__/integration --coverage
```

## Test Coverage Target

Integration tests should:
- **Cover critical user paths** - Login, MFA, uploads
- **Test happy paths** - Expected user behavior
- **Test error paths** - Network errors, validation errors
- **Validate state changes** - Redux state updates correctly
- **Verify navigation** - Route changes happen correctly

## Adding New Integration Tests

1. Create test file in this folder
2. Set up test store with all reducers
3. Create wrapper with Redux Provider + Router
4. Mock API responses with MSW
5. Simulate complete user journey
6. Verify state changes and navigation
7. Test error scenarios

## Dependencies

- `@testing-library/react` - Component testing
- `@testing-library/user-event` - User interactions
- `react-redux` - Redux Provider
- `react-router-dom` - Router for navigation
- `msw` - Mock Service Worker for API mocking
- `@reduxjs/toolkit` - Store creation
- `jest` - Test runner

## Best Practices

1. **Test user behavior, not implementation** - Focus on what user sees
2. **Use accessible queries** - getByRole, getByLabelText
3. **Wait for async operations** - Use waitFor, findBy queries
4. **Mock at the network level** - Use MSW, not jest.mock
5. **Keep tests independent** - Each test should work in isolation
6. **Test the whole flow** - Don't stop at first assertion
7. **Verify side effects** - Check Redux state, token storage, navigation

## Example Complete Integration Test

```typescript
describe('Complete Login to File Upload Journey', () => {
  it('authenticated user can upload file', async () => {
    const user = userEvent.setup();
    
    // Login flow
    renderWithProviders(<App />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for dashboard
    await screen.findByText(/dashboard/i);
    
    // Navigate to files
    await user.click(screen.getByRole('link', { name: /files/i }));
    
    // Upload file
    await user.click(screen.getByRole('button', { name: /upload/i }));
    
    // Select file (mock file input)
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/select file/i);
    await user.upload(input, file);
    
    // Submit upload
    await user.click(screen.getByRole('button', { name: /upload file/i }));
    
    // Wait for success
    await screen.findByText(/upload successful/i);
    
    // Verify file in list
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });
});
```
