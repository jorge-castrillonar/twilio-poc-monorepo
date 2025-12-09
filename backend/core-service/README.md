# Core Service

REST API Gateway microservice for file management operations and user file tracking.

## Architecture Role
- **API Gateway**: Exposes REST endpoints to clients
- **Business Domain**: Manages user file ownership and metadata
- **Message Orchestrator**: Coordinates with S3 service via JMS

## Tech Stack
- **Language**: Kotlin
- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL
- **Messaging**: ActiveMQ
- **Build**: Maven

## Database Model

### UserFile Entity
```kotlin
@Entity
@Table(name = "user_files")
data class UserFile(
    val fileId: UUID,           // Primary key
    val userId: String,         // File owner
    val originalName: String,   // Original filename
    val contentType: String,    // MIME type
    val status: FileStatus,     // UPLOADING, ACTIVE, DELETED, FAILED
    val uploadDate: Instant,    // Upload timestamp
    val isPublic: Boolean       // Public access flag
)
```

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/files/upload-url` | Generate S3 upload URL |
| POST | `/api/v1/files/download-url` | Generate S3 download URL |
| GET | `/api/v1/files/{fileKey}/metadata` | Get file metadata |
| DELETE | `/api/v1/files/{fileKey}` | Delete file |
| GET | `/api/v1/files?userId=xxx` | List user files |

## JMS Queues

### Outbound (to S3 Service)
- `s3.upload.url` - Upload URL requests
- `s3.download.url` - Download URL requests
- `s3.metadata` - Metadata requests
- `s3.delete` - Delete requests

### Inbound (from S3 Service)
- `core.response` - Response handling

## Configuration

### Environment Variables
- `ACTIVEMQ_BROKER_URL` - ActiveMQ connection
- `SPRING_DATASOURCE_URL` - PostgreSQL connection
- `SPRING_DATASOURCE_USERNAME` - DB username
- `SPRING_DATASOURCE_PASSWORD` - DB password

### Application Properties
```yaml
server:
  port: 8081
spring:
  activemq:
    broker-url: tcp://activemq:61616
  datasource:
    url: jdbc:postgresql://core-db:5432/core_service
```

## Infrastructure
- **Port**: 8081
- **Database**: PostgreSQL (port 5432)
- **Message Broker**: ActiveMQ (port 61616)
- **Health Check**: `/actuator/health`

## Test Suite
- Unit tests for service layer
- Integration tests for REST endpoints
- JMS message handling tests
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
docker build -t core-service .
docker run -p 8081:8081 core-service
```