# Frontend Integration Guide - GraphQL API

## Overview
This guide documents all tested and working GraphQL operations ready for frontend integration. All endpoints require JWT authentication (except login).

**Base URL:** `http://localhost:8082/graphql`

**Test User Credentials:**
- Email: `testuser@example.com`
- Password: `Test123!`
- User ID: `3905778a-1e75-4f67-9f89-a33af54e522d`

## Recent Updates (2025-11-18)
- ✅ **Fixed File Upload Schema**: Changed `fileName` → `originalName` in `UploadRequest` input
- ✅ **Removed userId from UploadRequest**: JWT authentication now handles user identification automatically
- ✅ **Added `size` field**: File type now includes optional `size` field (may be null if storage info not available)
- ✅ **Added `uploadDate` field**: All files now return upload timestamp in ISO-8601 format (Instant)
- ✅ **Fixed Field Resolvers**: `size` and `storageInfo` fields now handle errors gracefully, returning null instead of internal errors

---

## Authentication

### 1. Login
**Status:** ✅ Fully Tested & Working

**Mutation:**
```graphql
mutation Login {
  login(input: {
    email: "testuser@example.com"
    password: "Test123!"
  }) {
    accessToken
    refreshToken
    tokenType
    expiresIn
    user {
      id
      email
      firstName
      lastName
      fullName
      roles
      status
      mfaEnabled
    }
    mfaRequired
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: {email: \"testuser@example.com\", password: \"Test123!\"}) { accessToken refreshToken user { id email firstName lastName } } }"
  }'
```

**Response:**
```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
      "refreshToken": "refresh_token_here",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "3905778a-1e75-4f67-9f89-a33af54e522d",
        "email": "testuser@example.com",
        "firstName": "Test",
        "lastName": "User",
        "fullName": "Test User",
        "roles": ["USER"],
        "status": "ACTIVE",
        "mfaEnabled": false
      },
      "mfaRequired": false
    }
  }
}
```

**Frontend Usage:**
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Login($email: String!, $password: String!) {
          login(input: {email: $email, password: $password}) {
            accessToken
            refreshToken
            user { id email firstName lastName mfaEnabled }
            mfaRequired
          }
        }
      `,
      variables: { email, password }
    })
  });
  
  const { data } = await response.json();
  // Store accessToken for subsequent requests
  localStorage.setItem('token', data.login.accessToken);
  return data.login;
};
```

---

## Multi-Factor Authentication (MFA)

All MFA operations require JWT authentication. Pass the token in the `Authorization` header.

### 2. Setup MFA
**Status:** ✅ Fully Tested & Working

**Mutation:**
```graphql
mutation SetupMFA {
  setupMfa {
    secret
    qrCodeUrl
    backupCodes
  }
}
```

**cURL Example:**
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { setupMfa { secret qrCodeUrl backupCodes } }"
  }'
```

**Response:**
```json
{
  "data": {
    "setupMfa": {
      "secret": "JBSWY3DPEHPK3PXP",
      "qrCodeUrl": "otpauth://totp/CCAI-Collections:testuser@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CCAI-Collections",
      "backupCodes": [
        "12345678",
        "87654321",
        "11223344",
        "44332211",
        "99887766"
      ]
    }
  }
}
```

**Frontend Usage:**
```typescript
const setupMfa = async (token: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        mutation {
          setupMfa {
            secret
            qrCodeUrl
            backupCodes
          }
        }
      `
    })
  });
  
  const { data } = await response.json();
  return data.setupMfa;
};
```

**Notes:**
- Display `qrCodeUrl` as QR code for user to scan with authenticator app
- Store `backupCodes` securely and display to user
- User must call `enableMfa` with a TOTP code to complete setup

---

### 3. Enable MFA
**Status:** ✅ Fully Tested & Working

**Mutation:**
```graphql
mutation EnableMFA($totpCode: String!) {
  enableMfa(input: { totpCode: $totpCode })
}
```

**cURL Example:**
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation EnableMFA($totpCode: String!) { enableMfa(input: {totpCode: $totpCode}) }",
    "variables": { "totpCode": "123456" }
  }'
```

**Response:**
```json
{
  "data": {
    "enableMfa": true
  }
}
```

**Frontend Usage:**
```typescript
const enableMfa = async (token: string, totpCode: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        mutation EnableMFA($totpCode: String!) {
          enableMfa(input: {totpCode: $totpCode})
        }
      `,
      variables: { totpCode }
    })
  });
  
  const { data } = await response.json();
  return data.enableMfa; // Returns true if successful
};
```

**Notes:**
- User must enter 6-digit TOTP code from their authenticator app
- This verifies the user successfully scanned the QR code
- After enabling, MFA will be required for all future logins

---

### 4. Disable MFA
**Status:** ✅ Fully Tested & Working

**Mutation:**
```graphql
mutation DisableMFA {
  disableMfa
}
```

**cURL Example:**
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { disableMfa }"
  }'
```

**Response:**
```json
{
  "data": {
    "disableMfa": true
  }
}
```

**Frontend Usage:**
```typescript
const disableMfa = async (token: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `mutation { disableMfa }`
    })
  });
  
  const { data } = await response.json();
  return data.disableMfa; // Returns true if successful
};
```

---

## File Management

All file operations require JWT authentication. The userId is automatically extracted from the JWT token - do not pass it manually.

### 5. Generate Upload URL
**Status:** ✅ Fully Tested & Working

**Mutation:**
```graphql
mutation GenerateUploadURL($originalName: String!, $contentType: String!, $isPublic: Boolean) {
  generateUploadUrl(input: {
    originalName: $originalName
    contentType: $contentType
    isPublic: $isPublic
  }) {
    fileId
    uploadUrl
    expiresIn
    createdAt
  }
}
```

**cURL Example:**
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { generateUploadUrl(input: {originalName: \"test.pdf\", contentType: \"application/pdf\", isPublic: false}) { fileId uploadUrl expiresIn createdAt } }"
  }'
```

**Response:**
```json
{
  "data": {
    "generateUploadUrl": {
      "fileId": "452e3d78-d6a5-47ad-937b-cf1cbf0c63a1",
      "uploadUrl": "https://ccai-collections-file-repository-dev.s3.amazonaws.com/uploads/452e3d78-d6a5-47ad-937b-cf1cbf0c63a1.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
      "expiresIn": 3600,
      "createdAt": "2025-11-18T19:37:36.599677754Z"
    }
  }
}
```

**Frontend Usage:**
```typescript
const generateUploadUrl = async (token: string, originalName: string, contentType: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        mutation GenerateUploadURL($originalName: String!, $contentType: String!) {
          generateUploadUrl(input: {
            originalName: $originalName
            contentType: $contentType
            isPublic: false
          }) {
            fileId
            uploadUrl
            expiresIn
            createdAt
          }
        }
      `,
      variables: { originalName, contentType }
    })
  });
  
  const { data } = await response.json();
  return data.generateUploadUrl;
};

// Then upload the file to S3
const uploadFile = async (file: File, uploadUrl: string) => {
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });
};
```

**Important Notes:**
- The `fileId` returned is a UUID - **save this for the next step!**
- The `uploadUrl` is a pre-signed S3 URL valid for 3600 seconds (1 hour)
- Upload the actual file content directly to S3 using the `uploadUrl` with a PUT request
- After uploading to S3, you MUST call `completeUpload` to activate the file

---

### 6. Complete Upload
**Status:** ✅ Fully Tested & Working

**Mutation:**
```graphql
mutation CompleteUpload($fileId: ID!) {
  completeUpload(fileId: $fileId) {
    id
    originalName
    status
    userId
    contentType
    isPublic
  }
}
```

**cURL Example:**
```bash
TOKEN="your_jwt_token_here"
FILE_ID="452e3d78-d6a5-47ad-937b-cf1cbf0c63a1"  # From generateUploadUrl response

curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation { completeUpload(fileId: \\\"$FILE_ID\\\") { id originalName status userId } }\"
  }"
```

**Response:**
```json
{
  "data": {
    "completeUpload": {
      "id": "452e3d78-d6a5-47ad-937b-cf1cbf0c63a1",
      "originalName": "test.pdf",
      "status": "ACTIVE",
      "userId": "3905778a-1e75-4f67-9f89-a33af54e522d",
      "contentType": "application/pdf",
      "isPublic": false
    }
  }
}
```

**Frontend Usage:**
```typescript
const completeUpload = async (token: string, fileId: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        mutation CompleteUpload($fileId: ID!) {
          completeUpload(fileId: $fileId) {
            id
            originalName
            status
            userId
            contentType
            isPublic
          }
        }
      `,
      variables: { fileId }
    })
  });
  
  const { data } = await response.json();
  return data.completeUpload;
};
```

**Important Notes:**
- Call this mutation **after** successfully uploading the file to S3
- This changes the file status from `UPLOADING` to `ACTIVE`
- Only `ACTIVE` files appear in the files query results
- Use the `fileId` (UUID) returned from `generateUploadUrl`, not the S3 key

---

### 7. Query Files
**Status:** ✅ Fully Tested & Working

**Query:**
```graphql
query GetFiles {
  files {
    files {
      id
      originalName
      status
      userId
      contentType
      isPublic
      uploadDate
      size
    }
    totalCount
    hasNextPage
    cursor
  }
}
```

**cURL Example:**
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { files { files { id originalName status userId contentType uploadDate size } totalCount } }"
  }'
```

**Response:**
```json
{
  "data": {
    "files": {
      "files": [
        {
          "id": "452e3d78-d6a5-47ad-937b-cf1cbf0c63a1",
          "originalName": "test.pdf",
          "status": "ACTIVE",
          "userId": "3905778a-1e75-4f67-9f89-a33af54e522d",
          "contentType": "application/pdf",
          "isPublic": false,
          "uploadDate": "2025-11-18T08:44:56.858427Z",
          "size": null
        }
      ],
      "totalCount": 1,
      "hasNextPage": false,
      "cursor": null
    }
  }
}
```

**Note:** The `size` field may be `null` if storage information hasn't been fetched yet. The `uploadDate` is in ISO-8601 format (Instant).

**Frontend Usage:**
```typescript
const getFiles = async (token: string) => {
  const response = await fetch('http://localhost:8082/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query {
          files {
            files {
              id
              originalName
              status
              userId
              contentType
              isPublic
            }
            totalCount
            hasNextPage
          }
        }
      `
    })
  });
  
  const { data } = await response.json();
  return data.files;
};
```

**Notes:**
- Only returns files owned by the authenticated user
- Only returns files with `ACTIVE` status
- Files in `UPLOADING` status will not appear until `completeUpload` is called

---

## Complete File Upload Workflow

Here's the complete end-to-end workflow for uploading a file:

```typescript
const uploadFileComplete = async (token: string, file: File) => {
  try {
    // Step 1: Generate pre-signed upload URL
    console.log('Step 1: Generating upload URL...');
    const { fileId, uploadUrl } = await generateUploadUrl(
      token,
      file.name,
      file.type
    );
    console.log(`✅ Got fileId: ${fileId}`);
    
    // Step 2: Upload file directly to S3
    console.log('Step 2: Uploading to S3...');
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });
    console.log('✅ Upload to S3 complete');
    
    // Step 3: Mark upload as complete
    console.log('Step 3: Marking upload as complete...');
    const completedFile = await completeUpload(token, fileId);
    console.log('✅ File activated:', completedFile);
    
    // Step 4: Verify file appears in list
    console.log('Step 4: Verifying file in list...');
    const { files, totalCount } = await getFiles(token);
    console.log(`✅ Total files: ${totalCount}`);
    
    return completedFile;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

---

## Error Handling

### Common Errors

**1. Missing or Invalid JWT Token:**
```json
{
  "errors": [
    {
      "message": "User ID not found in context",
      "extensions": {
        "classification": "DataFetchingException"
      }
    }
  ]
}
```
**Solution:** Ensure the `Authorization: Bearer {token}` header is included in all authenticated requests.

**2. Expired Token:**
```json
{
  "errors": [
    {
      "message": "Token expired",
      "extensions": {
        "classification": "UnauthorizedException"
      }
    }
  ]
}
```
**Solution:** Use the refresh token to get a new access token, or prompt user to log in again.

**3. Invalid TOTP Code (MFA):**
```json
{
  "data": {
    "enableMfa": false
  }
}
```
**Solution:** Ask user to enter the code again. Codes expire every 30 seconds.

**4. File Not Found:**
```json
{
  "errors": [
    {
      "message": "File not found",
      "path": ["completeUpload"]
    }
  ]
}
```
**Solution:** Verify the fileId is correct and belongs to the authenticated user.

---

## GraphQL Schema Types

### FileStatus Enum
```graphql
enum FileStatus {
  UPLOADING  # Initial status after generateUploadUrl
  ACTIVE     # Status after completeUpload
  DELETED    # Status after file deletion
  FAILED     # Upload or processing failed
}
```

### File Type
```graphql
type File {
  id: ID!
  userId: String!
  originalName: String!
  contentType: String!
  status: FileStatus!
  uploadDate: DateTime!
  isPublic: Boolean!
  storageInfo: StorageInfo
  size: Int
}
```

---

## Testing

### Test Credentials
- **Email:** `testuser@example.com`
- **Password:** `Test123!`
- **User ID:** `3905778a-1e75-4f67-9f89-a33af54e522d`

### Quick Test Script (Bash)
```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: {email: \"testuser@example.com\", password: \"Test123!\"}) { accessToken } }"}' \
  | jq -r '.data.login.accessToken')

echo "✅ Token: $TOKEN"

# 2. Generate upload URL
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"mutation { generateUploadUrl(input: {originalName: \"test.txt\", contentType: \"text/plain\"}) { fileId uploadUrl createdAt } }"}')

FILE_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.generateUploadUrl.fileId')
echo "✅ File ID: $FILE_ID"

# 3. Complete upload
curl -s -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"query\":\"mutation { completeUpload(fileId: \\\"$FILE_ID\\\") { id status } }\"}" \
  | jq '.'

# 4. List files
curl -s -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query { files { files { id originalName status } totalCount } }"}' \
  | jq '.'
```

---

## Important Security Notes

1. **JWT Authentication:** All operations (except login) require a valid JWT token in the `Authorization` header.

2. **User Isolation:** The backend automatically extracts the userId from the JWT token. Users can only access their own files.

3. **Token Storage:** Store JWT tokens securely (e.g., httpOnly cookies, secure storage). Never expose tokens in URLs or logs.

4. **MFA Backup Codes:** Display backup codes only once during setup. Inform users to store them securely.

5. **S3 Upload URLs:** Pre-signed URLs expire after 1 hour. Generate a new URL if upload fails.

6. **File Status:** Always call `completeUpload` after S3 upload. Files in `UPLOADING` status are not accessible via queries.

---

## Support & Documentation

- **GraphQL Playground:** `http://localhost:8082/graphiql` (if enabled)
- **API Base URL:** `http://localhost:8082/graphql`
- **Architecture:** See `ARCHITECTURE.md`
- **Testing Results:** See `TESTING.md`

---

## Status Summary

| Operation | Status | JWT Required | Notes |
|-----------|--------|--------------|-------|
| Login | ✅ Working | No | Returns JWT token |
| Setup MFA | ✅ Working | Yes | Returns QR code and backup codes |
| Enable MFA | ✅ Working | Yes | Requires TOTP code verification |
| Disable MFA | ✅ Working | Yes | Turns off MFA for user |
| Generate Upload URL | ✅ Working | Yes | Creates pre-signed S3 URL |
| Complete Upload | ✅ Working | Yes | Activates file after S3 upload |
| Query Files | ✅ Working | Yes | Returns only ACTIVE files for authenticated user |

**Last Updated:** November 18, 2025  
**API Version:** 1.0.0  
**Status:** Production Ready
