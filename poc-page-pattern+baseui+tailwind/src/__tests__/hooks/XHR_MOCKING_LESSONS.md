# XHR Mocking Lessons Learned

## Problem
Testing the `useFiles` hook which orchestrates complex file uploads with:
- RTK Query mutations (`generateUploadUrl`, `completeUpload`)
- XMLHttpRequest for S3 uploads with progress tracking
- Redux state management for upload tracking

## Key Discoveries

### 1. RTK Query Uses Request Objects (Not url + options)
**Discovery**: Modern RTK Query passes a `Request` object to fetch, not `(url, options)`.

```typescript
// ❌ WRONG - Old fetch API
global.fetch = jest.fn((url, options) => {
  const body = JSON.parse(options.body);
  // ...
});

// ✅ CORRECT - RTK Query with Request API
global.fetch = jest.fn(async (input) => {
  if (input instanceof Request) {
    const bodyText = await input.text();
    const body = JSON.parse(bodyText);
    // ...
  }
});
```

###  2. Request Body Can Only Be Read Once
**Issue**: After calling `input.text()`, the Request body is consumed and cannot be read again.

**Solution**: Either:
- Clone the Request before reading: `const clone = input.clone()`
- Reconstruct the Request with the body text
- Use a different approach (mock at RTK Query level)

### 3. XHR Event Handling is Complex
**Challenge**: XMLHttpRequest events fire asynchronously and need proper simulation.

```typescript
class MockXMLHttpRequest {
  upload = { addEventListener: jest.fn() };
  addEventListener = jest.fn();
  
  constructor() {
    // Events must be captured and triggered manually
    this.upload.addEventListener.mockImplementation((event, handler) => {
      if (event === 'progress') {
        // Store handler to trigger later
        this.onProgressHandler = handler;
      }
    });
  }
  
  triggerProgress(loaded, total) {
    if (this.onProgressHandler) {
      this.onProgressHandler({ lengthComputable: true, loaded, total });
    }
  }
}
```

### 4. RTK Query Mutations Return Complex Promise-Like Objects
**Issue**: Calling `.unwrap()` on a mutation returns the transformed response, but testing this requires proper fetch mocking.

**What We Tested Successfully**:
- ✅ Hook structure and properties
- ✅ Redux integration
- ✅ Error handling from RTK Query
- ✅ Refresh functionality

**What's Complex to Test**:
- ❌ Full upload flow (fetch → XHR → complete)
- ❌ Progress callbacks during upload
- ❌ Multiple concurrent uploads

## Recommended Testing Strategy

### Approach 1: Unit Test What You Can (Current)
Test the hook's interface and error handling without full upload simulation.

```typescript
it('should expose required properties', () => {
  const { result } = renderHook(() => useFiles(), { wrapper });
  expect(result.current).toHaveProperty('uploadFile');
  expect(result.current).toHaveProperty('files');
  // ...
});

it('should handle errors', async () => {
  // Mock fetch to fail
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
  // Test error state
});
```

### Approach 2: Integration Tests (Better for Upload Flows)
Test the actual upload flow in a real environment or with MSW (Mock Service Worker).

```typescript
// Using MSW
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/graphql', (req, res, ctx) => {
    return res(ctx.json({
      data: { generateUploadUrl: { fileId: '123', uploadUrl: 'https://...' } }
    }));
  }),
  rest.put('https://s3.amazonaws.com/*', (req, res, ctx) => {
    return res(ctx.status(200));
  })
);
```

### Approach 3: Mock at Higher Level
Instead of mocking fetch and XHR, mock the RTK Query hooks themselves.

```typescript
jest.mock('../../store/graphqlApi', () => ({
  useGenerateUploadUrlMutation: () => [
    jest.fn().mockResolvedValue({ 
      data: { fileId: '123', uploadUrl: 'https://...' }
    })
  ],
  // ...
}));
```

## Current Test Status

- **Total Tests**: 14
- **Passing**: 4 (✅ 28.6%)
- **Failing**: 10 (❌ 71.4%)

**Passing Tests**:
1. Hook structure validation
2. Refresh functionality
3. Upload error tracking
4. RTK Query error handling

**Failing Tests** (All upload-flow related):
1. Upload progress tracking
2. Progress callbacks
3. File listing from API
4. Multiple concurrent uploads
5. Upload object structure
6. Content type handling

## Conclusion

Testing complex orchestration hooks with XHR requires either:
1. Accepting partial coverage (test what's testable)
2. Using integration tests with real services/MSW
3. Mocking at a higher level (RTK Query hooks)
4. Extensive mocking infrastructure (diminishing returns)

**Recommendation**: Use Approach 1 for unit tests + Approach 2 for E2E tests.

## Resources
- [RTK Query Testing](https://redux-toolkit.js.org/rtk-query/usage/testing)
- [MSW Documentation](https://mswjs.io/)
- [Testing XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest)
