# S3 Service

Business logic microservice for AWS S3 file storage operations and storage metadata tracking.

## Architecture Role
- **Storage Handler**: Manages AWS S3 operations
- **Technical Domain**: Tracks file storage details and S3 metadata
- **Message Consumer**: Processes requests from Core service via JMS

## Tech Stack
- **Language**: Kotlin
- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL
- **Messaging**: ActiveMQ
- **Cloud**: AWS S3
- **Build**: Maven

## Database Model

### StoredFile Entity
```kotlin
@Entity
@Table(name = "stored_files")
data class StoredFile(
    val fileId: UUID,           // Links to Core service UserFile
    val s3Key: String,          // S3 object key (unique)
    val bucket: String,         // S3 bucket name
    val size: Long,             // File size in bytes
    val etag: String?,          // S3 ETag
    val storageClass: String,   // S3 storage class
    val storedDate: Instant     // Storage timestamp
)
```

## AWS S3 Operations

### Presigned URLs
- **Upload URLs**: Temporary URLs for client file uploads
- **Download URLs**: Temporary URLs for client file downloads
- **Expiration**: Configurable (default 3600 seconds)

### File Management
- **Metadata Retrieval**: Get S3 object metadata
- **File Deletion**: Remove from S3 and database
- **Storage Tracking**: Record file storage details

## JMS Message Handling

### Inbound Queues
- `s3.upload.url` - Generate upload URLs
- `s3.download.url` - Generate download URLs
- `s3.metadata` - Retrieve file metadata
- `s3.delete` - Delete files

### Outbound Queues
- `core.response` - Send responses back to Core service

## Configuration

### Environment Variables
- `ACTIVEMQ_BROKER_URL` - ActiveMQ connection
- `SPRING_DATASOURCE_URL` - PostgreSQL connection
- `AWS_S3_BUCKET` - Primary S3 bucket
- `AWS_S3_PUBLIC_BUCKET` - Public files bucket
- `AWS_S3_REGION` - AWS region

### Application Properties
```yaml
server:
  port: 8080
app:
  aws:
    s3:
      bucket: ccai-collections-file-repository-dev
      region: us-east-1
      signed-url-validity: 3600
      base-upload-folder: uploads
```

## AWS Configuration
- **Bucket**: `ccai-collections-file-repository-dev`
- **Region**: `us-east-1`
- **Access**: IAM roles/credentials required
- **Permissions**: S3 read/write/delete operations

## Infrastructure
- **Port**: 8080
- **Database**: PostgreSQL (port 5433)
- **Message Broker**: ActiveMQ (port 61616)
- **Health Check**: `/actuator/health`

## Security
- **No REST endpoints** - Message-driven only
- **AWS IAM**: S3 access via IAM roles
- **Presigned URLs**: Temporary access tokens

## Observability
- **Metrics**: Micrometer with Prometheus
- **Tracing**: Distributed tracing with Brave
- **Logging**: Structured logging with sanitization
- **Caching**: File metadata caching

## Test Suite
- Unit tests for S3 operations
- Integration tests with TestContainers
- JMS message processing tests
- AWS S3 mock tests
- Database repository tests

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
docker build -t s3-service .
docker run -p 8080:8080 s3-service
```

## Dependencies
- **AWS SDK v2**: S3 operations
- **Spring JMS**: Message processing
- **PostgreSQL**: Storage metadata
- **Jackson**: JSON processing
- **Micrometer**: Metrics collection