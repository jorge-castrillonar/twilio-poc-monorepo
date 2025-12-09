# Unit Tests Documentation# Test Structure Documentation# Test Structure Documentation



This directory contains all **unit and integration tests** for the React application components, hooks, utilities, and Redux store.



## 📁 Directory StructureThis directory contains all unit and integration tests for the application. The structure mirrors the `src` directory for better maintainability and discoverability.This folder contains all tests for the application, organized by category.



```

src/__tests__/

├── App.test.tsx                           # Root App component tests## Directory Structure## 📁 Folder Structure

├── components/                            # Component tests

│   ├── layout/

│   │   ├── AppLayout.test.tsx            # Main layout wrapper tests

│   │   ├── AuthGuard.test.tsx            # Token validation guard tests``````

│   │   └── ProtectedRoute.test.tsx       # Route protection tests

│   ├── patterns/src/__tests__/__tests__/

│   │   ├── DataTablePage.test.tsx        # Data table pattern tests

│   │   ├── FileUploadModal.test.tsx      # Upload modal tests├── App.test.tsx                    # Root App component tests├── components/          ✅ Component unit tests (144 tests passing)

│   │   ├── Page.test.tsx                 # Page wrapper tests

│   │   └── PageHeader.test.tsx           # Page header tests├── components/                      # Component tests (mirrors src/components/)│   ├── Button.test.tsx

│   └── ui/

│       ├── Alert.test.tsx                # Alert component tests (46 tests)│   ├── layout/                     # Layout component tests│   ├── Input.test.tsx

│       ├── Button.test.tsx               # Button component tests (15 tests)

│       ├── Input.test.tsx                # Input component tests (36 tests)│   │   ├── AppLayout.test.tsx│   ├── Modal.test.tsx

│       ├── Modal.test.tsx                # Modal component tests (35 tests)

│       └── SearchBar.test.tsx            # SearchBar component tests (32 tests)│   │   └── ProtectedRoute.test.tsx│   ├── SearchBar.test.tsx

├── config/

│   └── index.test.ts                     # Configuration tests│   ├── patterns/                   # Pattern component tests│   ├── Alert.test.tsx

├── hooks/

│   ├── useAuth.test.tsx                  # Authentication hook tests (78.37% coverage)│   │   ├── DataTablePage.test.tsx│   └── README.md

│   └── useFiles.test.tsx                 # File operations hook tests (skipped)

├── pages/│   │   ├── FileUploadModal.test.tsx├── hooks/               ❌ Custom hook tests (0 tests - needs implementation)

│   ├── FilesPage.test.tsx                # Files page tests

│   ├── LoginPage.test.tsx                # Login page tests│   │   ├── Page.test.tsx│   └── README.md

│   └── MFAPage.test.tsx                  # MFA page tests

├── store/│   │   └── PageHeader.test.tsx├── store/               ❌ Redux store tests (0 tests - needs implementation)

│   ├── graphqlApi.integration.test.ts    # RTK Query integration tests

│   └── slices/│   └── ui/                         # UI component tests│   └── README.md

│       ├── authSlice.test.ts             # Auth Redux slice tests

│       ├── filesSlice.test.ts            # Files Redux slice tests│       ├── Alert.test.tsx├── utils/               ❌ Utility function tests (0 tests - needs implementation)

│       └── mfaSlice.test.ts              # MFA Redux slice tests

├── utils/│       ├── Button.test.tsx│   └── README.md

│   ├── errors.test.ts                    # Error handling utility tests

│   ├── formatDate.test.ts                # Date formatting tests│       ├── Input.test.tsx├── integration/         ❌ Integration tests (0 tests - needs implementation)

│   └── tokenManager.test.ts              # Token manager tests (13 tests)

└── README.md                             # This file│       ├── Modal.test.tsx│   └── README.md

```

│       └── SearchBar.test.tsx└── README.md           📖 This file

## 📊 Test Coverage Summary

├── config/                         # Configuration tests```

**Current Status (November 2025):**

- **Total Tests:** 622 passing│   └── index.test.ts

- **Statements:** 74.68%

- **Branches:** 70.58%├── hooks/                          # Custom hooks tests## 📊 Test Coverage Summary

- **Functions:** 70.34%

- **Lines:** 78.51%│   └── useFiles.test.tsx



**Coverage by Category:**├── pages/                          # Page component tests| Category | Tests | Status | Priority |

- ✅ UI Components: ~90% (164 tests)

- ✅ Layout Components: ~85%│   ├── FilesPage.test.tsx|----------|-------|--------|----------|

- ✅ Pattern Components: ~80%

- ✅ Redux Slices: 100% functions│   ├── LoginPage.test.tsx| **Components** | 144 | ✅ Passing | Complete |

- ✅ Utils: ~75% (tokenManager, errors, formatDate)

- 🟡 Hooks: 78.37% (useAuth tested, useFiles skipped)│   └── MFAPage.test.tsx| **Hooks** | 0 | ❌ Missing | Critical |

- ✅ Pages: ~70%

├── store/                          # Redux store tests| **Store** | 0 | ❌ Missing | High |

## 🚀 Running Tests

│   ├── graphqlApi.integration.test.ts  # RTK Query API integration tests| **Utils** | 0 | ❌ Missing | Critical |

### Run all unit tests

```bash│   └── slices/                     # Redux slice tests| **Integration** | 0 | ❌ Missing | High |

npm test

```│       ├── authSlice.test.ts| **TOTAL** | 144 | 🟡 Partial | In Progress |



### Run with coverage report│       ├── filesSlice.test.ts

```bash

npm test -- --coverage│       └── mfaSlice.test.ts### Detailed Component Coverage

```

└── utils/                          # Utility function tests

### Run specific test file

```bash    ├── errors.test.ts- ✅ Button: 15 tests (Base UI integration, variants, accessibility)

npm test -- Button.test.tsx

npm test -- useAuth.test.tsx    ├── formatDate.test.ts- ✅ Input: 36 tests (Field validation, error states, user input)

```

    └── tokenManager.test.ts- ✅ Modal: 35 tests (Dialog behavior, keyboard nav, focus trap)

### Run tests in watch mode

```bash```- ✅ SearchBar: 32 tests (Search functionality, icon layout)

npm test -- --watch

```- ✅ Alert: 46 tests (All alert types, close functionality)



### Run tests for specific folder## Test Coverage Goals

```bash

npm test -- __tests__/components## 🎯 Testing Strategy

npm test -- __tests__/hooks

npm test -- __tests__/storeAll tests are configured to meet the following coverage thresholds:

```

- **Statements**: 70%+ ✅ (Currently: 76.08%)### Unit Tests (Current: 144, Target: ~300)

## 🔐 Important: Secure Token Storage Keys

- **Branches**: 70%+ ✅ (Currently: 70.58%)Focus on individual components, hooks, and utilities in isolation.

**CRITICAL:** Always use secure storage keys when testing token functionality.

- **Functions**: 70%+ ✅ (Currently: 70.34%)

### TokenManager uses these keys (defined in `src/constants/index.ts`):

```typescript- **Lines**: 70%+ ✅ (Currently: 78.51%)**✅ Completed:**

export const STORAGE_KEYS = {

  ACCESS_TOKEN: '__secure_access_token__',      // NOT 'accessToken'- All UI components tested

  REFRESH_TOKEN: '__secure_refresh_token__',    // NOT 'refreshToken'

  TOKEN_TYPE: '__secure_token_type__',          // NOT 'tokenType'## Running Tests- Base UI integration validated

  EXPIRES_AT: '__secure_expires_at__',

  USER_DATA: '__secure_user_data__',- Accessibility features verified

};

``````bash



### ❌ Common Mistake in Tests# Run all tests**❌ Missing:**

```typescript

// ❌ WRONG - Plain keys don't worknpm test- Hook business logic (useAuth, useMfa, useFiles)

sessionStorage.getItem('accessToken');

expect(mockTokenManager.getAccessToken).toHaveBeenCalled();- Redux slices and reducers

```

# Run tests with coverage- Utility functions (tokenManager)

### ✅ Correct Usage

```typescriptnpm test -- --coverage

// ✅ CORRECT - Use secure keys

import { STORAGE_KEYS } from '../constants';### Integration Tests (Current: 0, Target: ~15-20)



sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);# Run specific test fileTest complete user workflows and component interactions.

// or directly:

sessionStorage.getItem('__secure_access_token__');npm test -- <test-file-name>

```

**❌ Missing:**

## 🎯 Testing Patterns

# Run tests in watch mode- Login flow (email → password → authenticate → navigate)

### 1. Component Tests (React Testing Library)

```typescriptnpm test -- --watch- MFA flow (setup → QR → enable → verify)

import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';```- File upload flow (select → upload → progress → complete)

import { Button } from '../components/ui/Button';

- Protected route navigation

it('calls onClick when clicked', async () => {

  const handleClick = jest.fn();## Import Path Convention- Token persistence on refresh

  const user = userEvent.setup();

  

  render(<Button onClick={handleClick}>Click me</Button>);

  Since tests are organized in subdirectories mirroring the source structure, relative imports follow this pattern:### E2E Tests (Not in scope yet)

  await user.click(screen.getByRole('button', { name: /click me/i }));

  Consider Cypress or Playwright for full browser testing later.

  expect(handleClick).toHaveBeenCalledTimes(1);

});- **Component tests in subdirectories**: Use `../../../` to reach `src/`

```

  ```typescript## 🚀 Quick Start

### 2. Hook Tests (renderHook)

```typescript  // Example: src/__tests__/components/ui/Button.test.tsx

import { renderHook, act } from '@testing-library/react';

import { useAuth } from '../hooks/useAuth';  import { Button } from '../../../components/ui/Button';### Run All Tests



it('login updates isAuthenticated state', async () => {  ``````bash

  const { result } = renderHook(() => useAuth(), { wrapper: TestProviders });

  npm test

  await act(async () => {

    await result.current.login('test@example.com', 'password123');- **Top-level tests**: Use `../` to reach `src/````

  });

    ```typescript

  expect(result.current.isAuthenticated).toBe(true);

});  // Example: src/__tests__/App.test.tsx### Run Tests by Category

```

  import App from '../App';```bash

### 3. Redux Store Tests

```typescript  ```# Components only

import { configureStore } from '@reduxjs/toolkit';

import authReducer, { login } from '../store/slices/authSlice';npm test -- __tests__/components



it('sets user on login success', () => {## Test Organization Rules

  const store = configureStore({ reducer: { auth: authReducer } });

  # Hooks only (when implemented)

  store.dispatch(login.fulfilled({ user: mockUser, token: 'abc' }));

  1. **Mirror Source Structure**: Test files should be in a directory structure that mirrors the source codenpm test -- __tests__/hooks

  expect(store.getState().auth.isAuthenticated).toBe(true);

  expect(store.getState().auth.user).toEqual(mockUser);2. **Naming Convention**: Test files should match the source file name with `.test.tsx` or `.test.ts` suffix

});

```3. **Co-location Alternative**: Tests can also be co-located with source files if preferred (not used in this project)# Store only (when implemented)



### 4. Token Manager Mock (Required for Auth Tests)4. **Integration Tests**: Complex integration tests go in `store/` with `.integration.test.ts` suffixnpm test -- __tests__/store

```typescript

jest.mock('../utils/tokenManager', () => ({

  tokenManager: {

    setTokens: jest.fn(),## Recent Improvements# Utils only (when implemented)

    getAccessToken: jest.fn(() => 'mock-access-token'),

    getRefreshToken: jest.fn(() => 'mock-refresh-token'),npm test -- __tests__/utils

    getTokenType: jest.fn(() => 'Bearer'),

    clearAll: jest.fn(),### Coverage Achievements

    hasValidTokens: jest.fn(() => true),

    updateAccessToken: jest.fn(),- Started at ~58% statements, now at **76.08%** (+18%)# Integration only (when implemented)

    startRefresh: jest.fn(),

  },- Started at ~48% functions, now at **70.34%** (+22%)npm test -- __tests__/integration

}));

```- Added 21 new tests bringing total from 601 to **622 tests**```



## 🛠️ Test Utilities



### TestProviders Wrapper (Redux + Router)### Test Enhancements### Run Specific Test File

Located in `src/__tests__/utils/testHelpers.tsx`:

```typescript1. **tokenManager.ts**: Added 13 tests for error handling (+5.06% statements, +7.5% functions)```bash

import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';2. **authSlice.ts**: Added 8 tests for RTK Query integration (reached 100% function coverage)npm test -- Button.test.tsx



export const TestProviders = ({ children }) => (3. **Test Organization**: Restructured all tests to mirror source directory structurenpm test -- useAuth.test.ts

  <Provider store={mockStore}>

    <BrowserRouter>```

      {children}

    </BrowserRouter>### Fixed Issues

  </Provider>

);- ✅ Removed duplicate `authSlice.test.ts` files### Run in Watch Mode

```

- ✅ Organized component tests into `layout/`, `patterns/`, and `ui/` subdirectories```bash

### Mock Store Setup

```typescript- ✅ Moved slice tests into `store/slices/` subdirectorynpm test -- --watch

import { configureStore } from '@reduxjs/toolkit';

import { graphqlApi } from '../store/graphqlApi';- ✅ Fixed all import paths after reorganization```



export const createMockStore = () => configureStore({- ✅ All 622 tests passing with coverage above 70% on all metrics

  reducer: {

    auth: authReducer,### Run with Coverage

    mfa: mfaReducer,

    files: filesReducer,## Notes```bash

    [graphqlApi.reducerPath]: graphqlApi.reducer,

  },npm test -- --coverage

  middleware: (gDM) => gDM().concat(graphqlApi.middleware),

});- `useFiles.test.tsx` is currently skipped due to complex mocking requirements with RTK Query mutations```

```

- The test suite uses Jest + React Testing Library for all component tests

## 📝 Test File Naming

- Integration tests for graphqlApi use real API endpoint definitions with mocked fetch responses## 📝 Test File Naming Conventions

| Type | Pattern | Example |

|------|---------|---------|

| Component | `ComponentName.test.tsx` | `Button.test.tsx` || Type | Pattern | Example |

| Hook | `useHookName.test.tsx` | `useAuth.test.tsx` ||------|---------|---------|

| Store | `sliceName.test.ts` | `authSlice.test.ts` || Component | `ComponentName.test.tsx` | `Button.test.tsx` |

| Util | `utilName.test.ts` | `tokenManager.test.ts` || Hook | `useHookName.test.ts` | `useAuth.test.ts` |

| Page | `PageName.test.tsx` | `LoginPage.test.tsx` || Store | `sliceName.test.ts` | `authSlice.test.ts` |

| Util | `utilName.test.ts` | `tokenManager.test.ts` |

## ✅ Recent Achievements (November 2025)| Integration | `FlowName.test.tsx` | `LoginFlow.test.tsx` |



### Token Management Testing## 🎓 Testing Best Practices

- ✅ Fixed `useAuth.test.tsx` coverage from 0% → 78.37%

- ✅ Added `getTokenType` mock to tokenManager (was missing, breaking tests)### 1. Component Tests

- ✅ Added 13 comprehensive tests for `tokenManager.test.ts````typescript

- ✅ Added 8 tests for `authSlice.test.ts` with RTK Query integration// ✅ Good: Test user behavior

- ✅ All auth tests now use secure storage keys (`__secure_*__`)it('shows error when email is invalid', async () => {

  const user = userEvent.setup();

### Test Organization  render(<Input label="Email" />);

- ✅ Reorganized tests to mirror `src/` directory structure  

- ✅ Separated components into `layout/`, `patterns/`, and `ui/`  await user.type(screen.getByLabelText(/email/i), 'invalid-email');

- ✅ Moved Redux slices to `store/slices/` subdirectory  await user.tab(); // Trigger blur

- ✅ Fixed all import paths after reorganization  

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();

### Coverage Improvements});

- Started: 58% statements → **Now: 74.68%** (+16.68%)

- Started: 48% functions → **Now: 70.34%** (+22.34%)// ❌ Bad: Test implementation details

- All 622 tests passing ✅it('calls onChange prop', () => {

  const onChange = jest.fn();

## 🐛 Known Issues  render(<Input onChange={onChange} />);

  // Testing internal behavior, not user outcome

### useFiles.test.tsx (Skipped)});

This test file is currently skipped due to complex mocking requirements with RTK Query mutations. The file operations need MSW (Mock Service Worker) setup for proper testing.```



**To fix:**### 2. Hook Tests

```typescript```typescript

// TODO: Set up MSW for RTK Query mutations// ✅ Good: Test hook state and effects

import { setupServer } from 'msw/node';it('login updates auth state', async () => {

import { rest } from 'msw';  const { result } = renderHook(() => useAuth(), { wrapper });

  

const server = setupServer(  await act(async () => {

  rest.post('/graphql', (req, res, ctx) => {    await result.current.login('email@test.com', 'password');

    // Mock file upload mutation  });

  })  

);  expect(result.current.isAuthenticated).toBe(true);

```  expect(result.current.user).toBeDefined();

});

## 🎓 Best Practices```



1. **Test user behavior, not implementation**### 3. Integration Tests

   - Use `screen.getByRole()` instead of class names```typescript

   - Test what users see, not internal state// ✅ Good: Test complete user journey

it('user can login and upload file', async () => {

2. **Mock external dependencies**  renderWithProviders(<App />);

   - Always mock `tokenManager` in auth tests  

   - Mock API calls with MSW or jest.mock  // Login

   - Mock `useNavigate` from react-router-dom  await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');

  await userEvent.type(screen.getByLabelText(/password/i), 'pass123');

3. **Use secure storage keys**  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

   - Never use plain `accessToken` in tests  

   - Always use `__secure_access_token__` from STORAGE_KEYS  // Wait for navigation

  await screen.findByText(/dashboard/i);

4. **Async actions need `act()`**  

   - Wrap state updates in `act()` for hooks  // Upload file

   - Use `waitFor()` for async component updates  await userEvent.click(screen.getByText(/upload/i));

  // ... rest of flow

5. **Clean up after tests**});

   - Clear mocks with `jest.clearAllMocks()````

   - Reset stores between tests

## 🔧 Test Utilities

## 📚 Testing Libraries Used

### Wrapper for Redux + Router

- **Jest** - Test runner and assertion library```typescript

- **React Testing Library** - Component testing utilitiesimport { Provider } from 'react-redux';

- **@testing-library/user-event** - Simulate user interactionsimport { BrowserRouter } from 'react-router-dom';

- **@testing-library/react-hooks** - Hook testing utilitiesimport { configureStore } from '@reduxjs/toolkit';

- **Redux Mock Store** - Mock Redux store for isolated tests

const createTestStore = () => configureStore({

## 🔗 Related Documentation  reducer: {

    auth: authReducer,

- [E2E Testing Guide](../../e2e/README.md) - Playwright E2E tests    mfa: mfaReducer,

- [Token Management Docs](../../docs/TOKEN_MANAGEMENT.md)    files: filesReducer,

- [Testing Best Practices](https://testing-library.com/docs/react-testing-library/intro/)    [graphqlApi.reducerPath]: graphqlApi.reducer,

  },

---  middleware: (gDM) => gDM().concat(graphqlApi.middleware),

});

**Last Updated:** November 26, 2025  

**Test Framework:** Jest 29 + React Testing Library  export const TestProviders = ({ children }) => (

**Coverage Goal:** 80%+ (Current: 74.68%)  <Provider store={createTestStore()}>

    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);
```

### Mock tokenManager
```typescript
export const mockTokenManager = () => {
  jest.mock('../../utils/tokenManager', () => ({
    setTokens: jest.fn(),
    getAccessToken: jest.fn(() => 'mock-token'),
    getRefreshToken: jest.fn(() => 'mock-refresh-token'),
    getTokenType: jest.fn(() => 'Bearer'),
    clearAll: jest.fn(),
    hasValidTokens: jest.fn(() => true),
    updateAccessToken: jest.fn(),
    startRefresh: jest.fn(),
  }));
};
```

## 🔐 Secure Token Storage Keys

**IMPORTANT:** The application uses secure storage keys for token management. Always use these keys when testing token persistence:

### TokenManager Secure Keys (defined in `src/constants/index.ts`)
```typescript
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '__secure_access_token__',
  REFRESH_TOKEN: '__secure_refresh_token__',
  TOKEN_TYPE: '__secure_token_type__',
  EXPIRES_AT: '__secure_expires_at__',
  USER_DATA: '__secure_user_data__',
};
```

### ❌ Common Mistake
```typescript
// ❌ WRONG - Using plain key names
sessionStorage.getItem('accessToken');
sessionStorage.setItem('refreshToken', token);
```

### ✅ Correct Usage
```typescript
// ✅ CORRECT - Using secure keys from STORAGE_KEYS
import { STORAGE_KEYS } from '../constants';

sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN); // '__secure_access_token__'
sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token); // '__secure_refresh_token__'
```

### E2E Test Example
```typescript
// In Playwright E2E tests, check sessionStorage with secure keys
const tokens = await page.evaluate(() => ({
  accessToken: sessionStorage.getItem('__secure_access_token__'),
  refreshToken: sessionStorage.getItem('__secure_refresh_token__'),
  tokenType: sessionStorage.getItem('__secure_token_type__'),
}));

expect(tokens.accessToken).toBeTruthy();
expect(tokens.refreshToken).toBeTruthy();
expect(tokens.tokenType).toBe('Bearer');
```

### Why Secure Keys?
1. **Security through obscurity** - Makes it harder for malicious scripts to find tokens
2. **Namespace isolation** - Prevents conflicts with other apps on same domain
3. **Consistent pattern** - All sensitive data uses `__secure_*__` prefix
4. **Easy audit** - DevTools search for `__secure_` shows all sensitive storage

### Mock GraphQL API (MSW)
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const mockApiServer = setupServer(
  rest.post('/graphql', (req, res, ctx) => {
    const { operationName } = req.body;
    
    if (operationName === 'Login') {
      return res(ctx.json({
        data: {
          login: {
            token: 'mock-token',
            user: { id: '1', email: 'test@test.com' }
          }
        }
      }));
    }
  })
);
```

## 📈 Next Steps

### Immediate Priority (Week 1)
1. ✅ ~~Organize tests into folders~~ (DONE)
2. ❌ Create `useAuth.test.ts` (CRITICAL - auth is core functionality)
3. ❌ Create `tokenManager.test.ts` (CRITICAL - security validation)
4. ❌ Create `authSlice.test.ts` (HIGH - state management)

### Short-term Priority (Week 2-3)
5. ❌ Create `useMfa.test.ts` (HIGH - MFA validation)
6. ❌ Create `useFiles.test.ts` (MEDIUM - file operations)
7. ❌ Create `LoginFlow.test.tsx` (HIGH - integration test)
8. ❌ Create remaining store slice tests

### Medium-term Priority (Week 4+)
9. ❌ Create `MfaFlow.test.tsx` (integration)
10. ❌ Create `FileUploadFlow.test.tsx` (integration)
11. ❌ Improve test coverage to 90%+
12. ❌ Add E2E tests with Cypress/Playwright

## 🎯 Coverage Goals

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Components | ~90% | 90% | ✅ Met |
| Hooks | 0% | 90% | ❌ Critical Gap |
| Store | 0% | 100% | ❌ High Priority |
| Utils | 0% | 100% | ❌ Critical Gap |
| Integration | 0% | 80% | ❌ High Priority |
| **Overall** | ~50% | 90% | 🟡 In Progress |

## 📚 Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [React Hooks Testing Library](https://react-hooks-testing-library.com/)
- [Redux Testing Docs](https://redux.js.org/usage/writing-tests)

## 🐛 Debugging Tests

### Failed Test
```bash
# Run specific test file
npm test -- FailingTest.test.tsx

# Run with verbose output
npm test -- --verbose

# Run with coverage to see what's missing
npm test -- --coverage --collectCoverageFrom=src/hooks/useAuth.ts
```

### Debug in VSCode
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## ✅ Test Checklist for New Features

When adding a new feature:

- [ ] Write component tests (if UI component)
- [ ] Write hook tests (if custom hook)
- [ ] Write store tests (if new Redux slice)
- [ ] Write utility tests (if new utility function)
- [ ] Write integration test (if complete feature)
- [ ] Verify all tests pass
- [ ] Check coverage is >80%
- [ ] Update this README if needed

---