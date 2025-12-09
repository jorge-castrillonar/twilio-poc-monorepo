# CCAI Collections - Backend

A microservices-based backend system for CCAI Collections, built with Spring Boot, Kotlin, and GraphQL.

## 🏗️ Architecture

This backend follows a microservices architecture with the following services:

```
┌─────────────────┐
│  GraphQL API    │  Port 8082 - Main API Gateway
│  (Gateway)      │  - Authentication & Authorization
└────────┬────────┘  - GraphQL Endpoints
         │           - JWT Token Management
         ├───────────────────────────────────┐
         │                                   │
┌────────▼────────┐  ┌──────────────────┐  │
│  Core Service   │  │  Auth Service    │  │
│  Port 8081      │  │  Port 8085       │  │
│                 │  │                  │  │
│  - File Mgmt    │  │  - Login/Logout  │  │
│  - Business     │  │  - MFA Setup     │  │
│    Logic        │  │  - Token Mgmt    │  │
└────────┬────────┘  └──────────────────┘  │
         │                                   │
         ├───────────────────────────────────┘
         │
┌────────▼────────┐  ┌──────────────────┐
│  S3 Service     │  │  User Service    │
│  Port 8080      │  │  Port 8084       │
│                 │  │                  │
│  - File Upload  │  │  - User CRUD     │
│  - Pre-signed   │  │  - Profiles      │
│    URLs         │  │  - Roles         │
└─────────────────┘  └──────────────────┘

         ┌──────────────────┐
         │  Message Queue   │
         │  (ActiveMQ)      │
         │  Port 61616      │
         └──────────────────┘
```

### Services

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| **graphql-gateway** | 8082 | Kotlin + Spring Boot GraphQL | API Gateway, Authentication, GraphQL endpoint |
| **core-service** | 8081 | Kotlin + Spring Boot | File management, business logic orchestration |
| **auth-service** | 8085 | Java + Spring Boot | Authentication, MFA, token management |
| **s3-service** | 8080 | Kotlin + Spring Boot | S3 file operations, pre-signed URLs |
| **user-service** | 8084 | Java + Spring Boot | User management, profiles, roles |

### Infrastructure

| Component | Port | Purpose |
|-----------|------|---------|
| **ActiveMQ** | 61616, 8161 (Web UI) | JMS message broker for async communication |
| **PostgreSQL** (core-db) | 5432 | Core service database |
| **PostgreSQL** (auth-db) | 5436 | Auth service database |
| **PostgreSQL** (user-db) | 5435 | User service database |
| **PostgreSQL** (s3-db) | 5433 | S3 service database |
| **Redis** | 6379 | Session storage, caching |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17+ (for local development)
- Maven 3.9+ (for local development)

### Running with Docker

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Start all services
docker compose up -d

# Check service health
docker compose ps

# View logs
docker compose logs -f graphql-gateway
```

### Service URLs

- **GraphQL API:** http://localhost:8082/graphql
- **GraphQL Playground:** http://localhost:8082/graphiql (if enabled)
- **ActiveMQ Console:** http://localhost:8161 (admin/admin)
- **Core Service Health:** http://localhost:8081/actuator/health
- **Auth Service Health:** http://localhost:8085/actuator/health
- **S3 Service Health:** http://localhost:8080/actuator/health
- **User Service Health:** http://localhost:8084/actuator/health

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md) | **Start here!** Complete guide for frontend developers with all working endpoints, examples, and workflows |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Detailed system architecture, data flow, and design decisions |
| [TESTING.md](./TESTING.md) | Test results, validation reports, and testing procedures |

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** with RS256 signing algorithm for authentication.

### Quick Test

```bash
# 1. Login to get JWT token
TOKEN=$(curl -s -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: {email: \"testuser@example.com\", password: \"Test123!\"}) { accessToken } }"}' \
  | jq -r '.data.login.accessToken')

echo "Token: $TOKEN"

# 2. Use token for authenticated requests
curl -X POST http://localhost:8082/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query { files { totalCount } }"}'
```

### Test Credentials

- **Email:** testuser@example.com
- **Password:** Test123!
- **User ID:** 3905778a-1e75-4f67-9f89-a33af54e522d

## 📋 Available Operations

### ✅ Production Ready (Tested & Working)

All operations below are fully tested and documented in [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md).

#### Authentication
- **Login** - Get JWT access token
- **Refresh Token** - Renew expired tokens
- **Logout** - Invalidate tokens

#### Multi-Factor Authentication (MFA)
- **Setup MFA** - Generate QR code and backup codes
- **Enable MFA** - Verify and activate MFA
- **Disable MFA** - Turn off MFA for user

#### File Management
- **Generate Upload URL** - Get pre-signed S3 URL for file upload
- **Complete Upload** - Activate file after S3 upload
- **Query Files** - List user's active files
- **Generate Download URL** - Get pre-signed S3 URL for download
- **Delete File** - Remove file from system

#### User Management
- **Get User** - Fetch user profile
- **List Users** - Query users (admin only)
- **Create User** - Register new user
- **Update User** - Modify user profile

## 🔨 Development

### Building Services

```bash
# Build specific service
docker compose build graphql-gateway

# Build all services
docker compose build

# Build without cache
docker compose build --no-cache
```

### Running Locally (without Docker)

```bash
# Terminal 1: Start infrastructure
docker compose up -d activemq core-db auth-db user-db s3-db redis

# Terminal 2: Run service locally
cd graphql-gateway
mvn spring-boot:run

# Or with Kotlin
cd core-service
mvn spring-boot:run
```

### Database Access

```bash
# Core Service Database
docker exec -it core-db psql -U core_user -d core_service

# Auth Service Database
docker exec -it auth-db psql -U auth_user -d auth_service

# User Service Database
docker exec -it user-db psql -U user_user -d user_service

# S3 Service Database
docker exec -it s3-db psql -U s3_user -d s3_service
```

### Useful Commands

```bash
# Restart specific service
docker compose restart graphql-gateway

# View service logs
docker compose logs -f graphql-gateway

# Stop all services
docker compose down

# Stop and remove volumes (clean start)
docker compose down -v

# Check service status
docker compose ps

# Rebuild and restart service
docker compose build graphql-gateway && docker compose up -d graphql-gateway
```

## 🧪 Testing

### Quick Health Check

```bash
# Test all service health endpoints
curl http://localhost:8082/graphql
curl http://localhost:8081/actuator/health
curl http://localhost:8085/actuator/health
curl http://localhost:8080/actuator/health
curl http://localhost:8084/actuator/health
```

### Test Scripts

```bash
# Test MFA flow
./test-mfa.sh

# Test file upload flow
./test-upload.sh

# Test complete integration
./test-flow.sh
```

### GraphQL Testing

Use GraphQL Playground (if enabled) or tools like:
- **Postman** - Import GraphQL requests
- **Insomnia** - GraphQL client
- **Apollo Studio** - Advanced GraphQL testing

Example test query:
```graphql
mutation TestLogin {
  login(input: {
    email: "testuser@example.com"
    password: "Test123!"
  }) {
    accessToken
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

## 📦 Technology Stack

### Backend
- **Language:** Kotlin (graphql-gateway, core-service, s3-service), Java (auth-service, user-service)
- **Framework:** Spring Boot 3.2.0
- **API:** GraphQL (Spring for GraphQL)
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Message Queue:** Apache ActiveMQ 5.18.3

### Libraries & Tools
- **JWT:** jjwt 0.12.3 (RS256 signing)
- **ORM:** Hibernate/JPA
- **Build:** Maven 3.9.5
- **Container:** Docker, Docker Compose
- **Storage:** AWS S3

## 🏗️ Project Structure

```
backend/
├── graphql-gateway/          # GraphQL API Gateway
│   ├── src/
│   │   ├── main/kotlin/
│   │   │   ├── config/       # JWT, GraphQL configuration
│   │   │   ├── resolver/     # GraphQL resolvers
│   │   │   ├── client/       # HTTP clients for services
│   │   │   └── model/        # GraphQL data models
│   │   └── resources/
│   │       └── graphql/      # GraphQL schema
│   ├── Dockerfile
│   └── pom.xml
│
├── core-service/             # Core business logic
│   ├── src/
│   │   ├── main/kotlin/
│   │   │   ├── controller/   # REST controllers
│   │   │   ├── service/      # Business logic
│   │   │   ├── entity/       # Database entities
│   │   │   └── repository/   # JPA repositories
│   │   └── resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── auth-service/             # Authentication service
├── s3-service/               # S3 file operations
├── user-service/             # User management
│
├── docker-compose.yml        # Service orchestration
├── FRONTEND_INTEGRATION_GUIDE.md
├── ARCHITECTURE.md
├── TESTING.md
└── README.md (this file)
```

## 🔐 Security

### JWT Authentication
- **Algorithm:** RS256 (RSA signatures)
- **Token Expiry:** 15 minutes (access), 7 days (refresh)
- **Claims:** userId, email, roles, type
- **Public Key:** Stored in auth-service, validated by graphql-gateway

### Multi-Factor Authentication (MFA)
- **Algorithm:** TOTP (Time-based One-Time Password)
- **Code Length:** 6 digits
- **Time Step:** 30 seconds
- **Backup Codes:** 5 single-use codes generated at setup

### User Isolation
- All file operations automatically use authenticated user's ID
- Users can only access their own resources
- Admin operations require ADMIN role

### Database Security
- Each service has isolated database
- Credentials managed via environment variables
- Connection pooling with HikariCP

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs graphql-gateway

# Check if port is in use
sudo lsof -i :8082

# Clean restart
docker compose down -v
docker compose up -d
```

### Database Connection Issues

```bash
# Check database is running
docker compose ps | grep db

# Restart database
docker compose restart core-db

# Check database logs
docker compose logs core-db
```

### JWT Token Errors

```bash
# Verify token is being sent
curl -v -H "Authorization: Bearer $TOKEN" http://localhost:8082/graphql

# Check token expiry (tokens expire after 15 minutes)
# Get fresh token by logging in again
```

### File Upload Issues

1. **Files not appearing in query:**
   - Make sure you called `completeUpload` after S3 upload
   - Files stay in `UPLOADING` status until completed
   - Only `ACTIVE` files appear in queries

2. **Upload URL expired:**
   - Pre-signed URLs expire after 1 hour
   - Generate a new URL if upload fails

## 📊 Performance

### Expected Response Times
- Login: < 500ms
- File operations: < 200ms
- GraphQL queries: < 100ms

### Scalability
- Stateless services (can be horizontally scaled)
- JMS message queue for async operations
- Redis caching for session management
- Database connection pooling

## 🤝 Contributing

### Code Style
- Kotlin: Follow Kotlin conventions
- Java: Follow Google Java Style Guide
- Use meaningful variable names
- Add comments for complex logic

### Commit Messages
```
feat: Add new GraphQL mutation for file upload
fix: Resolve JWT token expiration issue
docs: Update frontend integration guide
test: Add integration tests for MFA flow
```

### Pull Request Process
1. Create feature branch from `main`
2. Write tests for new features
3. Update documentation
4. Submit PR with clear description
5. Wait for code review

## 📝 License

[Add your license information here]

## 👥 Team

[Add team information here]

## 📞 Support

- **Issues:** [GitHub Issues]
- **Email:** [support email]
- **Slack:** [Slack channel]

---

**Version:** 1.0.0  
**Last Updated:** November 18, 2025  
**Status:** Production Ready ✅
