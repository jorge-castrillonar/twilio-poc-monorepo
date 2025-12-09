# GraphQL Gateway Service

GraphQL API Gateway for CCAI Collections Backend - provides a unified GraphQL endpoint for all client operations.

## Features

- **Unified API**: Single GraphQL endpoint for all file operations
- **Real-time Updates**: GraphQL subscriptions via WebSocket
- **Efficient Data Fetching**: DataLoaders prevent N+1 queries
- **Type Safety**: Strong GraphQL schema with Kotlin types
- **Service Integration**: REST and JMS communication with Core/S3 services

## Architecture

```
Client → GraphQL Gateway (8082) → Core Service (8081) / S3 Service (8080)
```

## GraphQL Operations

### Queries
- `file(id: ID!)` - Get file by ID
- `files(filter: FileFilter, pagination: PaginationInput)` - List files with filtering
- `userFiles(userId: String!)` - Get user's files
- `health` - Service health status

### Mutations
- `generateUploadUrl(input: UploadRequest!)` - Generate presigned upload URL
- `generateDownloadUrl(fileId: ID!)` - Generate presigned download URL
- `deleteFile(fileId: ID!)` - Delete file
- `updateFileVisibility(fileId: ID!, isPublic: Boolean!)` - Update file visibility

### Subscriptions
- `fileStatusChanged(userId: String!)` - Real-time file status updates

## Development

### Build
```bash
mvn clean package
```

### Run Locally
```bash
mvn spring-boot:run
```

### Docker
```bash
docker build -t graphql-gateway .
docker run -p 8082:8082 graphql-gateway
```

## GraphQL Playground

Access GraphiQL at: http://localhost:8082/graphiql

### Example Queries

```graphql
# Get user files
query {
  userFiles(userId: "user123") {
    files {
      id
      originalName
      status
      storageInfo {
        size
        bucket
      }
    }
  }
}

# Generate upload URL
mutation {
  generateUploadUrl(input: {
    userId: "user123"
    fileName: "test.txt"
    contentType: "text/plain"
  }) {
    fileId
    uploadUrl
    expiresIn
  }
}
```

## Configuration

Key environment variables:
- `SERVICES_CORE_URL` - Core service URL (default: http://localhost:8081)
- `SERVICES_S3_URL` - S3 service URL (default: http://localhost:8080)
- `ACTIVEMQ_BROKER_URL` - ActiveMQ broker URL (default: tcp://localhost:61616)