# Auth Service

Authentication and authorization microservice for CCAI Collections platform. Handles user authentication, JWT token management, MFA (TOTP), and session management.

## Features

- **JWT Authentication**: RS256 algorithm with RSA key pairs
- **Token Management**: Access tokens (15 min) and refresh tokens (7 days)
- **MFA Support**: TOTP (Time-based One-Time Password) with backup codes
- **Rate Limiting**: Protection against brute-force attacks (Redis-based)
- **Session Management**: Refresh token rotation and revocation
- **Event Publishing**: Authentication events to ActiveMQ
- **User Service Integration**: Credential validation via HTTP client

## Technology Stack

- **Language**: Kotlin 1.9.20
- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security + JWT (JJWT 0.12.3)
- **Database**: PostgreSQL
- **Cache/Rate Limiting**: Redis
- **Messaging**: ActiveMQ (JMS)
- **Build Tool**: Maven
- **Java Version**: 17

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "mfaCode": "123456"  // Optional, required if MFA is enabled
}
```

Response (Success):
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "roles": ["USER", "ADMIN"],
  "mfaRequired": false
}
```

Response (MFA Required - 401):
```json
{
  "accessToken": "",
  "refreshToken": "",
  "tokenType": "Bearer",
  "expiresIn": 0,
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "roles": ["USER"],
  "mfaRequired": true
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9..."
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9..."
}
```

### Multi-Factor Authentication (MFA)

#### Setup MFA
```http
POST /api/mfa/setup
Authorization: Bearer <access_token>
```

Response:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/CCAI-Collections:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CCAI-Collections",
  "backupCodes": [
    "12345678",
    "87654321",
    ...
  ],
  "issuer": "CCAI-Collections",
  "accountName": "user@example.com"
}
```

#### Enable MFA
```http
POST /api/mfa/enable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "totpCode": "123456"
}
```

#### Disable MFA
```http
POST /api/mfa/disable
Authorization: Bearer <access_token>
```

#### Get MFA Status
```http
GET /api/mfa/status
Authorization: Bearer <access_token>
```

Response:
```json
{
  "enabled": true,
  "enabledAt": "2024-01-15T10:30:00Z",
  "backupCodesRemaining": 8
}
```

#### Verify MFA Code
```http
POST /api/mfa/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "totpCode": "123456"
}
```

## Domain Model

### RefreshToken Entity
- `id` (UUID): Unique identifier
- `token` (String): JWT refresh token string
- `userId` (UUID): Reference to user
- `expiresAt` (Instant): Token expiration timestamp
- `revoked` (Boolean): Revocation status
- `revokedAt` (Instant): Revocation timestamp
- `userAgent` (String): Client user agent
- `ipAddress` (String): Client IP address
- `createdAt` (Instant): Creation timestamp

### MfaSecret Entity
- `id` (UUID): Unique identifier
- `userId` (UUID): Reference to user (unique)
- `secret` (String): TOTP secret (Base32)
- `enabled` (Boolean): MFA enabled status
- `enabledAt` (Instant): When MFA was enabled
- `backupCodes` (String): Comma-separated backup codes
- `createdAt` (Instant): Creation timestamp
- `updatedAt` (Instant): Last update timestamp

## JWT Structure

### Access Token Claims
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": "USER,ADMIN",
  "type": "access",
  "iss": "auth-service",
  "iat": 1705320600,
  "exp": 1705321500
}
```

### Refresh Token Claims
```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iss": "auth-service",
  "iat": 1705320600,
  "exp": 1705925400
}
```

## Events Published

The service publishes the following events to ActiveMQ:

1. **auth.login**: User login attempts (success/failure)
2. **auth.logout**: User logout
3. **auth.token.refreshed**: Token refresh
4. **auth.mfa.enabled**: MFA enabled
5. **auth.mfa.disabled**: MFA disabled
6. **auth.password.changed**: Password changed

## Configuration

### Application Properties

```yaml
# Server
server:
  port: 8085

# Database
spring:
  datasource:
    url: jdbc:postgresql://localhost:5436/authdb
    username: authservice
    password: authpass

# Redis
spring:
  data:
    redis:
      host: localhost
      port: 6379

# ActiveMQ
spring:
  activemq:
    broker-url: tcp://localhost:61616
    user: admin
    password: admin

# JWT
jwt:
  public-key: <base64-encoded-rsa-public-key>
  private-key-path: classpath:keys/private_key.pem
  access-token-expiration: 900000      # 15 minutes
  refresh-token-expiration: 604800000  # 7 days
  issuer: auth-service

# Rate Limiting
rate-limit:
  login:
    max-attempts: 5
    duration-seconds: 300  # 5 minutes
  refresh:
    max-attempts: 10
    duration-seconds: 60   # 1 minute

# User Service
user-service:
  base-url: http://localhost:8084
```

## Database Setup

The service uses Flyway for database migrations:

- `V1__create_refresh_tokens_table.sql`: Creates refresh_tokens table
- `V2__create_mfa_secrets_table.sql`: Creates mfa_secrets table

## Running the Service

### Local Development

1. Start PostgreSQL:
```bash
docker run -d \
  --name auth-db \
  -e POSTGRES_DB=authdb \
  -e POSTGRES_USER=authservice \
  -e POSTGRES_PASSWORD=authpass \
  -p 5436:5432 \
  postgres:15-alpine
```

2. Start Redis:
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

3. Start ActiveMQ:
```bash
docker run -d \
  --name activemq \
  -p 61616:61616 \
  -p 8161:8161 \
  apache/activemq-classic:latest
```

4. Ensure user-service is running on port 8084

5. Run the application:
```bash
mvn spring-boot:run
```

### Docker

Build and run with Docker:

```bash
# Build
docker build -t auth-service .

# Run
docker run -p 8085:8085 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e JWT_PUBLIC_KEY=<base64-key> \
  auth-service
```

### Docker Compose

Run with docker-compose (from backend directory):

```bash
docker-compose up auth-service
```

## Security Features

### Rate Limiting

- **Login**: Max 5 attempts per 5 minutes (per email)
- **Refresh**: Max 10 attempts per 1 minute (per IP)
- Implemented using Redis with TTL

### Token Security

- **Algorithm**: RS256 (RSA with SHA-256)
- **Key Size**: 2048-bit RSA keys
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration, single-use (rotation on refresh)
- **Revocation**: Refresh tokens can be revoked immediately

### MFA (TOTP)

- **Algorithm**: HMAC-SHA1
- **Time Step**: 30 seconds
- **Code Length**: 6 digits
- **Window**: ±1 time step for clock skew
- **Backup Codes**: 10 single-use codes generated

## Integration with User Service

The auth-service integrates with user-service for credential validation:

```
Auth Service                    User Service
    |                                |
    |  POST /api/credentials/validate
    |  { email, password }            |
    |------------------------------>|
    |                                |
    |  { valid, userId, roles }      |
    |<-------------------------------|
    |                                |
```

## Health Check

```http
GET /actuator/health
```

## API Documentation

Swagger UI is available at:
```
http://localhost:8085/swagger-ui.html
```

OpenAPI spec:
```
http://localhost:8085/v3/api-docs
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on the correct port (5436 for local)
- Verify database credentials in application.yml
- Check Flyway migration status

### Redis Connection Issues
- Ensure Redis is running on port 6379
- Check Redis connection in logs
- Verify rate limiting is working

### JWT Token Issues
- Verify RSA keys are properly loaded
- Check public key is correctly encoded in Base64
- Ensure private_key.pem exists in keys directory
- Validate token expiration times

### User Service Integration Issues
- Ensure user-service is running on correct URL
- Check network connectivity
- Verify WebClient configuration
- Review user-service logs for credential validation

## Project Structure

```
auth-service/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/allcode/auth/
│   │   │       ├── AuthServiceApplication.kt
│   │   │       ├── client/
│   │   │       │   └── UserServiceClient.kt
│   │   │       ├── config/
│   │   │       │   ├── JmsConfig.kt
│   │   │       │   ├── RedisConfig.kt
│   │   │       │   ├── SecurityConfig.kt
│   │   │       │   └── WebClientConfig.kt
│   │   │       ├── controller/
│   │   │       │   ├── AuthController.kt
│   │   │       │   └── MfaController.kt
│   │   │       ├── dto/
│   │   │       │   └── AuthDtos.kt
│   │   │       ├── entity/
│   │   │       │   ├── RefreshToken.kt
│   │   │       │   └── MfaSecret.kt
│   │   │       ├── exception/
│   │   │       │   └── GlobalExceptionHandler.kt
│   │   │       ├── repository/
│   │   │       │   ├── RefreshTokenRepository.kt
│   │   │       │   └── MfaSecretRepository.kt
│   │   │       ├── security/
│   │   │       │   └── JwtTokenProvider.kt
│   │   │       └── service/
│   │   │           ├── AuthService.kt
│   │   │           ├── AuthEventService.kt
│   │   │           ├── MfaService.kt
│   │   │           ├── RateLimitService.kt
│   │   │           └── RefreshTokenService.kt
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-docker.yml
│   │       ├── keys/
│   │       │   ├── private_key.pem
│   │       │   └── public_key.pem
│   │       └── db/migration/
│   │           ├── V1__create_refresh_tokens_table.sql
│   │           └── V2__create_mfa_secrets_table.sql
│   └── test/
│       └── kotlin/
├── Dockerfile
└── pom.xml
```

## Dependencies

Key dependencies:
- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- Spring Boot Starter ActiveMQ
- Spring Boot Starter Data Redis
- Spring Boot Starter WebFlux (for user-service client)
- PostgreSQL Driver
- Flyway Core
- JJWT (JWT library)
- Google ZXing (QR code generation for MFA)

## Testing

### Manual Testing with cURL

Login:
```bash
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@allcode.com",
    "password": "admin123"
  }'
```

Refresh Token:
```bash
curl -X POST http://localhost:8085/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your-refresh-token>"
  }'
```

Setup MFA:
```bash
curl -X POST http://localhost:8085/api/mfa/setup \
  -H "Authorization: Bearer <your-access-token>"
```

## License

Copyright © 2024 AllCode. All rights reserved.
