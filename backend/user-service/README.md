# User Service

User management microservice for CCAI Collections platform. Handles user CRUD operations, role management, and credential validation.

## Features

- **User Management**: Create, read, update, and delete user accounts
- **Role Management**: Assign and revoke roles (ADMIN, USER, MANAGER, AGENT)
- **Status Management**: Control user account status (ACTIVE, INACTIVE, SUSPENDED, DELETED)
- **Credential Validation**: Validate user credentials for authentication
- **Event Publishing**: Publishes user lifecycle events to ActiveMQ
- **Search**: Search users by email or name
- **Password Security**: BCrypt password hashing

## Technology Stack

- **Language**: Kotlin 1.9.20
- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL
- **Messaging**: ActiveMQ (JMS)
- **Build Tool**: Maven
- **Java Version**: 17

## API Endpoints

### User Management

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securePassword123",
  "roles": ["USER"]
}
```

#### Get User by ID
```http
GET /api/users/{userId}
```

#### Get User by Email
```http
GET /api/users/email/{email}
```

#### Get All Users
```http
GET /api/users
GET /api/users?status=ACTIVE
GET /api/users?role=ADMIN
GET /api/users?emailSearch=john
GET /api/users?nameSearch=doe
```

#### Update User
```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "newPassword123"
}
```

#### Change User Status
```http
PATCH /api/users/{userId}/status?status=INACTIVE
```

#### Delete User
```http
DELETE /api/users/{userId}
```

#### Check if User Exists
```http
GET /api/users/exists/{email}
```

#### Get User Count by Status
```http
GET /api/users/count?status=ACTIVE
```

### Role Management

#### Assign Role
```http
POST /api/users/{userId}/roles
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Revoke Role
```http
DELETE /api/users/{userId}/roles/{role}
```

### Credentials

#### Validate Credentials
```http
POST /api/credentials/validate
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "valid": true,
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "roles": ["USER", "ADMIN"]
}
```

## Domain Model

### User Entity
- `id` (UUID): Unique identifier
- `email` (String): Unique email address
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `passwordHash` (String): BCrypt hashed password
- `roles` (Set<UserRole>): User roles
- `status` (UserStatus): Account status
- `createdAt` (Instant): Creation timestamp
- `updatedAt` (Instant): Last update timestamp

### User Roles
- `ADMIN`: System administrator
- `USER`: Regular user
- `MANAGER`: Manager role
- `AGENT`: Agent role

### User Status
- `ACTIVE`: Active account
- `INACTIVE`: Inactive account
- `SUSPENDED`: Suspended account
- `DELETED`: Soft-deleted account

## Events Published

The service publishes the following events to ActiveMQ:

1. **user.created**: When a new user is created
2. **user.updated**: When a user is updated
3. **user.deleted**: When a user is deleted
4. **user.role.assigned**: When a role is assigned to a user
5. **user.role.revoked**: When a role is revoked from a user

## Configuration

### Application Properties

```yaml
# Server
server:
  port: 8084

# Database
spring:
  datasource:
    url: jdbc:postgresql://localhost:5435/userdb
    username: userservice
    password: userpass
  
  # JPA
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true

# ActiveMQ
spring:
  activemq:
    broker-url: tcp://localhost:61616
    user: admin
    password: admin

# Flyway
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
```

## Database Setup

The service uses Flyway for database migrations. Migrations are located in `src/main/resources/db/migration/`:

- `V1__create_users_table.sql`: Creates users and user_roles tables
- `V2__seed_initial_admin.sql`: Seeds initial admin user

### Initial Admin User
- **Email**: admin@allcode.com
- **Password**: admin123
- **Role**: ADMIN

## Running the Service

### Local Development

1. Start PostgreSQL:
```bash
docker run -d \
  --name user-db \
  -e POSTGRES_DB=userdb \
  -e POSTGRES_USER=userservice \
  -e POSTGRES_PASSWORD=userpass \
  -p 5435:5432 \
  postgres:15-alpine
```

2. Start ActiveMQ:
```bash
docker run -d \
  --name activemq \
  -p 61616:61616 \
  -p 8161:8161 \
  apache/activemq-classic:latest
```

3. Run the application:
```bash
mvn spring-boot:run
```

### Docker

Build and run with Docker:

```bash
# Build
docker build -t user-service .

# Run
docker run -p 8084:8084 \
  -e SPRING_PROFILES_ACTIVE=docker \
  user-service
```

### Docker Compose

Run with docker-compose (from backend directory):

```bash
docker-compose up user-service
```

## Testing

### Run Tests
```bash
mvn test
```

### Run Integration Tests
```bash
mvn verify
```

## Dependencies

Key dependencies include:
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter ActiveMQ
- Spring Boot Starter Validation
- PostgreSQL Driver
- Flyway Core
- JJWT (JWT library)
- BCrypt (via Spring Security)

## Project Structure

```
user-service/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/allcode/users/
│   │   │       ├── UserServiceApplication.kt
│   │   │       ├── config/
│   │   │       │   ├── JmsConfig.kt
│   │   │       │   └── SecurityConfig.kt
│   │   │       ├── controller/
│   │   │       │   ├── UserController.kt
│   │   │       │   ├── RoleController.kt
│   │   │       │   └── CredentialsController.kt
│   │   │       ├── dto/
│   │   │       │   └── UserDtos.kt
│   │   │       ├── entity/
│   │   │       │   ├── User.kt
│   │   │       │   ├── UserRole.kt
│   │   │       │   └── UserStatus.kt
│   │   │       ├── exception/
│   │   │       │   └── GlobalExceptionHandler.kt
│   │   │       ├── repository/
│   │   │       │   └── UserRepository.kt
│   │   │       └── service/
│   │   │           ├── UserService.kt
│   │   │           └── UserEventService.kt
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-docker.yml
│   │       └── db/migration/
│   │           ├── V1__create_users_table.sql
│   │           └── V2__seed_initial_admin.sql
│   └── test/
│       └── kotlin/
├── Dockerfile
└── pom.xml
```

## Integration with Other Services

### Auth Service
The user service works closely with the auth-service:
- Auth service calls `/api/credentials/validate` to validate user credentials
- User events are published to ActiveMQ for auth service to consume

### GraphQL Gateway
The GraphQL gateway will query this service for user data and mutations.

## Security Notes

- Passwords are hashed using BCrypt with strength 10
- Email addresses are unique and indexed
- Soft delete is used (status = DELETED) instead of hard delete
- Input validation is enforced using Jakarta Validation annotations

## Health Check

The service exposes Spring Boot Actuator endpoints:

```http
GET /actuator/health
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on the correct port
- Verify database credentials in application.yml
- Check network connectivity in Docker environments

### ActiveMQ Connection Issues
- Ensure ActiveMQ is running and accessible
- Check broker URL configuration
- Verify ActiveMQ credentials

### Flyway Migration Errors
- Check migration scripts for syntax errors
- Ensure database user has proper permissions
- Review Flyway baseline configuration

## License

Copyright © 2024 AllCode. All rights reserved.
