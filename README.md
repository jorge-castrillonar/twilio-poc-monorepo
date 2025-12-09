# Twilio PoC Monorepo

Monorepo completo para el Proof of Concept de Twilio CCAI Collections, incluyendo backend basado en microservicios (Spring Boot + Kotlin/Java) y frontend (React + Vite + Base UI + TailwindCSS).

## 📋 Tabla de Contenidos

- [Arquitectura General](#-arquitectura-general)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Prerequisitos](#-prerequisitos)
- [Inicio Rápido](#-inicio-rápido)
- [Backend](#-backend)
- [Frontend](#-frontend)
- [Variables de Entorno](#-variables-de-entorno)
- [Testing](#-testing)
- [Documentación](#-documentación)

## 🏗 Arquitectura General

Este monorepo contiene:

### Backend - Arquitectura de Microservicios

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
│  - File Mgmt    │  │  - Login/Logout  │  │
│  - Business     │  │  - MFA Setup     │  │
│    Logic        │  │  - Token Mgmt    │  │
└────────┬────────┘  └──────────────────┘  │
         │                                   │
┌────────▼────────┐  ┌──────────────────┐  │
│  S3 Service     │  │  User Service    │  │
│  Port 8080      │  │  Port 8084       │  │
│  - File Upload  │  │  - User CRUD     │  │
│  - Pre-signed   │  │  - Profiles      │  │
│    URLs         │  │  - Roles         │  │
└─────────────────┘  └──────────────────┘  │
                                            │
         ┌──────────────────┐               │
         │  Message Queue   │               │
         │  (ActiveMQ)      │◄──────────────┘
         │  Port 61616      │
         └──────────────────┘
                 │
         ┌───────▼────────┐
         │   PostgreSQL   │
         │   (4 DBs)      │
         └────────────────┘
```

### Frontend - React SPA

- React 18.3 + TypeScript 5.6
- Vite 5.4 para dev/build
- Base UI + TailwindCSS (Twilio Design System)
- React Router para navegación
- Redux Toolkit para estado global
- GraphQL Client para API

## 📁 Estructura del Proyecto

```
twilio-poc-monorepo/
├── backend/                          # Backend microservicios
│   ├── auth-service/                 # Servicio de autenticación
│   │   ├── src/main/java/           # Código fuente Java
│   │   ├── src/main/resources/      # Configuración
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── user-service/                 # Servicio de usuarios
│   │   ├── src/main/kotlin/         # Código fuente Kotlin
│   │   ├── src/main/resources/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── core-service/                 # Servicio core (orquestación)
│   │   ├── src/main/kotlin/
│   │   ├── src/main/resources/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── s3-service/                   # Servicio de archivos S3
│   │   ├── src/main/kotlin/
│   │   ├── src/main/resources/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── graphql-gateway/              # Gateway GraphQL
│   │   ├── src/main/kotlin/
│   │   ├── src/main/resources/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── docker-compose.yml            # Orquestación de servicios
│   ├── Makefile                      # Comandos útiles
│   └── docs/                         # Documentación backend
│       ├── README_BACKEND.md         # Documentación detallada
│       └── FRONTEND_INTEGRATION_GUIDE.md
│
└── poc-page-pattern+baseui+tailwind/ # Frontend React
    ├── src/
    │   ├── components/               # Componentes React
    │   ├── pages/                    # Páginas/vistas
    │   ├── store/                    # Redux store
    │   ├── hooks/                    # Custom hooks
    │   ├── utils/                    # Utilidades
    │   ├── config/                   # Configuración
    │   └── types/                    # TypeScript types
    │
    ├── e2e/                          # Tests E2E (Playwright)
    ├── public/                       # Archivos estáticos
    ├── package.json
    ├── vite.config.ts
    └── README.md
```

## 🔧 Prerequisitos

### Backend

- **Java 17+** (OpenJDK recomendado)
- **Maven 3.8+**
- **Docker & Docker Compose** (para ejecución completa)
- **PostgreSQL 15** (si se ejecuta localmente sin Docker)
- **ActiveMQ Classic 5.18+** (si se ejecuta localmente sin Docker)

### Frontend

- **Node.js 18+** (recomendado LTS)
- **npm 9+** o **yarn 1.22+**

### Verificar instalación:

```bash
# Backend
java -version
mvn -version
docker --version
docker compose version

# Frontend
node --version
npm --version
```

## 🚀 Inicio Rápido

### Opción 1: Todo con Docker (Recomendado para desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorge-castrillonar/twilio-poc-monorepo.git
cd twilio-poc-monorepo

# 2. Configurar variables de entorno (backend)
cd backend
cp .env.example .env
# Editar .env con tus valores

# 3. Iniciar todos los servicios backend
docker compose up -d

# 4. Ver logs
docker compose logs -f

# 5. En otra terminal, iniciar frontend
cd ../poc-page-pattern+baseui+tailwind
npm install
npm run dev

# 6. Abrir navegador
# Frontend: http://localhost:5173
# GraphQL Gateway: http://localhost:8082/graphiql
# ActiveMQ Console: http://localhost:8161 (admin/admin)
```

### Opción 2: Backend en Docker, Frontend local

```bash
# 1. Iniciar backend con Docker
cd backend
docker compose up -d

# 2. Iniciar frontend
cd ../poc-page-pattern+baseui+tailwind
npm install
npm run dev
```

### Opción 3: Todo local (sin Docker)

Ver documentación detallada en:
- Backend: [`backend/docs/README_BACKEND.md`](backend/docs/README_BACKEND.md)
- Frontend: [`poc-page-pattern+baseui+tailwind/README.md`](poc-page-pattern+baseui+tailwind/README.md)

## 🔙 Backend

### Servicios disponibles

| Servicio | Puerto | Tecnología | Descripción |
|----------|--------|------------|-------------|
| **graphql-gateway** | 8082 | Kotlin + Spring Boot GraphQL | API Gateway principal, endpoint GraphQL |
| **core-service** | 8081 | Kotlin + Spring Boot | Orquestación de lógica de negocio |
| **auth-service** | 8085 | Java + Spring Boot | Autenticación, MFA, JWT |
| **user-service** | 8084 | Kotlin + Spring Boot | CRUD de usuarios |
| **s3-service** | 8080 | Kotlin + Spring Boot | Gestión de archivos S3 |
| **ActiveMQ** | 61616 (broker)<br>8161 (console) | Apache ActiveMQ Classic | Message broker |
| **PostgreSQL** | 5432 (core-db)<br>5433 (s3-db)<br>5435 (user-db)<br>5436 (auth-db) | PostgreSQL 15 | Bases de datos |
| **Redis** | 6379 | Redis 7 | Rate limiting (auth-service) |

### Comandos útiles (desde `backend/`)

```bash
# Iniciar todos los servicios
docker compose up -d

# Iniciar solo infraestructura
docker compose up -d activemq core-db user-db auth-db s3-db redis

# Ver logs de un servicio específico
docker compose logs -f graphql-gateway

# Detener todos los servicios
docker compose down

# Reiniciar un servicio
docker compose restart auth-service

# Reconstruir un servicio
docker compose build --no-cache auth-service
docker compose up -d auth-service

# Limpiar todo (incluye volúmenes)
docker compose down -v

# Usar Makefile
make up        # Iniciar servicios
make down      # Detener servicios
make logs      # Ver logs
make clean     # Limpiar todo
make status    # Ver estado
```

### Health Checks

```bash
# GraphQL Gateway
curl http://localhost:8082/actuator/health

# Core Service
curl http://localhost:8081/actuator/health

# Auth Service
curl http://localhost:8085/actuator/health

# User Service
curl http://localhost:8084/actuator/health

# S3 Service
curl http://localhost:8080/actuator/health
```

### GraphQL Playground

Acceder a GraphiQL en: `http://localhost:8082/graphiql`

Ejemplo de query:

```graphql
query {
  userFiles {
    id
    fileName
    fileSize
    contentType
    status
    createdAt
  }
}
```

Ver guía completa de integración en: [`backend/docs/FRONTEND_INTEGRATION_GUIDE.md`](backend/docs/FRONTEND_INTEGRATION_GUIDE.md)

## 🎨 Frontend

### Stack Tecnológico

- **React 18.3** + **TypeScript 5.6**
- **Vite 5.4** - Build tool
- **Base UI** - Componentes accesibles (Twilio Design System)
- **TailwindCSS 3.4** - Estilos utility-first
- **React Router 6.28** - Navegación
- **Redux Toolkit 2.x** - Estado global
- **Playwright** - E2E testing
- **Jest** - Unit testing
- **Storybook 8.6** - Documentación de componentes

### Funcionalidades implementadas

✅ **Autenticación**
- Login/Logout
- Gestión de sesión
- Rutas protegidas
- Token refresh

✅ **Multi-Factor Authentication (MFA)**
- Setup MFA con QR code
- Verificación TOTP
- Backup codes
- Enable/Disable MFA

✅ **Gestión de Archivos**
- Upload de archivos (flujo completo: generateUploadUrl → upload a S3 → completeUpload)
- Listado de archivos
- Búsqueda
- Información de archivos

✅ **UI Components (Twilio Design System)**
- Page Pattern
- PageHeader Pattern
- DataTablePage Pattern
- Search Pattern
- Form components

### Comandos (desde `poc-page-pattern+baseui+tailwind/`)

```bash
# Desarrollo
npm install
npm run dev              # Dev server en http://localhost:5173

# Build
npm run build            # Build para producción
npm run preview          # Preview del build

# Testing
npm run test             # Unit tests (Jest)
npm run test:watch       # Unit tests en modo watch
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests (Playwright)
npm run test:e2e:ui      # E2E en modo UI
npm run test:e2e:debug   # E2E en modo debug

# Storybook
npm run storybook        # Storybook en http://localhost:6006
npm run build-storybook  # Build Storybook

# Linting
npm run lint             # ESLint
```

### Configuración Frontend

El frontend requiere variables de entorno. Crear archivo `.env` en `poc-page-pattern+baseui+tailwind/`:

```env
# API Configuration
VITE_API_URL=http://localhost:8082/graphql
VITE_BACKEND_URL=http://localhost:8082

# Features
VITE_ENABLE_MFA=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_LOGGING=true

# Security
VITE_TOKEN_EXPIRY_MS=900000
VITE_SESSION_TIMEOUT_MS=1800000
VITE_MAX_LOGIN_ATTEMPTS=5
```

## 🔐 Variables de Entorno

### Backend

Crear archivo `.env` en `backend/`:

```bash
# Database Credentials
CORE_DB_USERNAME=core_user
CORE_DB_PASSWORD=core_pass

S3_DB_USERNAME=s3_user
S3_DB_PASSWORD=s3_pass

USER_DB_USERNAME=user_user
USER_DB_PASSWORD=user_pass

AUTH_DB_USERNAME=auth_user
AUTH_DB_PASSWORD=auth_pass

# JWT Configuration (Base64 encoded)
JWT_PUBLIC_KEY=<your-base64-encoded-public-key>
JWT_PRIVATE_KEY=<your-base64-encoded-private-key>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# ActiveMQ
ACTIVEMQ_BROKER_URL=tcp://activemq:61616
ACTIVEMQ_USER=admin
ACTIVEMQ_PASSWORD=admin

# Service URLs (for docker network)
CORE_SERVICE_URL=http://core-service:8081
S3_SERVICE_URL=http://s3-service:8080
USER_SERVICE_URL=http://user-service:8084
AUTH_SERVICE_URL=http://auth-service:8085
```

**⚠️ Seguridad:**

1. **NUNCA** commitear el archivo `.env` al repositorio
2. Las claves JWT deben generarse usando:
   ```bash
   cd backend/auth-service/keys
   ./generate-keys-and-jwt.sh
   ```
3. En producción, usar un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)

### Frontend

Crear archivo `.env` en `poc-page-pattern+baseui+tailwind/` (ver sección de [Configuración Frontend](#configuración-frontend))

## 🧪 Testing

### Backend

Cada servicio tiene sus propios tests unitarios:

```bash
# Desde directorio de cada servicio
cd backend/auth-service
mvn test

cd backend/user-service
mvn test

# etc...
```

### Frontend

```bash
cd poc-page-pattern+baseui+tailwind

# Unit tests
npm run test
npm run test:coverage

# E2E tests (requiere backend corriendo)
npm run test:e2e
```

Ver más detalles en:
- Backend testing: [`backend/docs/README_BACKEND.md#testing`](backend/docs/README_BACKEND.md#-testing)
- Frontend E2E: [`poc-page-pattern+baseui+tailwind/e2e/README.md`](poc-page-pattern+baseui+tailwind/e2e/README.md)

## 📚 Documentación

### Documentación Principal

- **[Backend README](backend/docs/README_BACKEND.md)** - Documentación completa del backend
- **[Frontend README](poc-page-pattern+baseui+tailwind/README.md)** - Documentación completa del frontend
- **[Frontend Integration Guide](backend/docs/FRONTEND_INTEGRATION_GUIDE.md)** - Guía de integración GraphQL

### Documentación por Servicio

Cada microservicio tiene su propio README:

- [Auth Service](backend/auth-service/README.md)
- [User Service](backend/user-service/README.md)
- [Core Service](backend/core-service/README.md)
- [S3 Service](backend/s3-service/README.md)
- [GraphQL Gateway](backend/graphql-gateway/README.md)

### Storybook (Componentes UI)

```bash
cd poc-page-pattern+baseui+tailwind
npm run storybook
# Abrir http://localhost:6006
```

## 🚧 Troubleshooting

### Backend no inicia

```bash
# Ver logs detallados
docker compose logs -f [service-name]

# Verificar puertos ocupados
sudo lsof -i :8082  # GraphQL Gateway
sudo lsof -i :8081  # Core Service
sudo lsof -i :8085  # Auth Service

# Reiniciar todo limpiamente
docker compose down -v
docker compose up -d
```

### Frontend no conecta con backend

1. Verificar que backend esté corriendo: `docker compose ps`
2. Verificar URL en `.env`: `VITE_API_URL=http://localhost:8082/graphql`
3. Verificar CORS en `graphql-gateway/src/main/resources/application.yml`
4. Health check: `curl http://localhost:8082/actuator/health`

### Problemas con JWT

```bash
# Regenerar keys JWT
cd backend/auth-service/keys
./generate-keys-and-jwt.sh

# Copiar public_key_base64.txt al .env
# JWT_PUBLIC_KEY=<contenido-del-archivo>
```

### Base de datos

```bash
# Acceder a una base de datos
docker exec -it core-db psql -U core_user -d core_service

# Recrear bases de datos
docker compose down -v  # CUIDADO: borra todos los datos
docker compose up -d
```

## 📝 Notas para Desarrolladores

### Estructura de ramas recomendada

```
main                    # Rama principal (producción)
├── develop             # Rama de desarrollo
│   ├── feature/xxx     # Features nuevos
│   ├── bugfix/xxx      # Correcciones
│   └── hotfix/xxx      # Hotfixes urgentes
```

### Workflow recomendado

1. **Crear rama desde `develop`:**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nombre-feature
   ```

2. **Desarrollar y commitear:**
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. **Push y PR:**
   ```bash
   git push origin feature/nombre-feature
   # Crear Pull Request a develop
   ```

### Convención de commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan código)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es un PoC interno. Todos los derechos reservados.

## 👥 Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

---

**Última actualización:** Diciembre 2024
