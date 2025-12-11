# CCAI Collections - Frontend PoC

Proof of Concept frontend para Twilio utilizando **React + Vite + Base UI + TailwindCSS** siguiendo los patrones del Twilio Design System.

## 🎨 Stack de UI

Este proyecto implementa el **Twilio Design System** usando:
- **[Base UI](https://base-ui.com/)** (`@base-ui-components/react`) - Componentes accesibles unstyled
- **TailwindCSS** - Sistema de diseño con tokens de Twilio
- **Page Pattern Design** - Patrones oficiales de Twilio

### ¿Por qué Base UI + Tailwind?

- ✅ **Base UI** proporciona: Accesibilidad (WCAG 2.1 AA), comportamiento de componentes, focus management
- ✅ **Tailwind** proporciona: Estilos visuales siguiendo tokens de Twilio, responsive design
- ✅ **Mejor de ambos mundos**: Componentes robustos y accesibles con total control del diseñoCAI Collections - Frontend PoC

Proof of Concept frontend para Twilio utilizando React + Vite + Base UI + TailwindCSS siguiendo los patrones del├── styles/
│   └── tailwind.css          # Estilos globales
│
├── *.stories.tsx             # Stories de Storybook (14 archivos)
├── Introduction.mdx          # Documentación de Storybook
│
├── App.tsx                   # Componente raíz con rutaslio Design System.

## 🚀 Características

Este PoC implementa **TODOS** los endpoints GraphQL documentados en `FRONTEND_INTEGRATION_GUIDE.md`:

### ✅ Autenticación
- Login con email/password
- Gestión de tokens JWT
- Rutas protegidas
- Logout

### ✅ Multi-Factor Authentication (MFA)
- Setup MFA con QR code
- Visualización de backup codes
- Enable MFA con verificación TOTP
- Disable MFA

### ✅ Gestión de Archivos
- Upload de archivos (flujo completo de 3 pasos):
  1. Generar URL de upload (generateUploadUrl)
  2. Upload directo a S3
  3. Completar upload (completeUpload)
- Listado de archivos con DataTablePage
- Búsqueda de archivos
- Información de archivos (nombre, tipo, tamaño, fecha)
- Estados de archivos (UPLOADING, ACTIVE, FAILED, DELETED)

### ✅ SpaceX GraphQL Integration (NEW)
- Integración con API pública de SpaceX
- Consulta de lanzamientos (launches)
- Consulta de cohetes (rockets)
- Consulta de cápsulas y naves
- Tipos TypeScript generados automáticamente
- Demo page en `/spacex`
- Ver [docs/SPACEX_INTEGRATION.md](docs/SPACEX_INTEGRATION.md) para más detalles

## 🎨 Design System

Sigue estrictamente los patrones de Twilio:

- **Page Pattern**: Layout base para páginas
- **PageHeader Pattern**: Encabezados consistentes
- **Search Pattern**: Búsqueda integrada
- **DataTablePage Pattern**: Tablas de datos completas
- **Table Pattern**: Tablas responsivas con columnas configurables

## 📦 Tecnologías

- **React 18.3** - Framework UI
- **Vite 5.4** - Build tool y dev server
- **TypeScript 5.6** - Type safety
- **Base UI 0.0.40** - Componentes accesibles unstyled (Button, Field, Dialog)
- **TailwindCSS 3.4** - Utilidades de estilos con tokens de Twilio
- **React Router 6.28** - Enrutamiento
- **Redux Toolkit + RTK Query** - Estado global y API client
- **GraphQL Code Generator** - Generación automática de tipos TypeScript
- **QRCode.react** - Generación de QR codes para MFA
- **Storybook 8.6** - Documentación interactiva de componentes

## 🛠️ Instalación y Ejecución

### Opción 1: Script Rápido (Recomendado)
```bash
./start.sh
```

### Opción 2: Manual
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Iniciar Storybook (documentación interactiva)
npm run storybook

# Build para producción
npm run build

# Build Storybook para producción
npm run build-storybook

# Preview de producción
npm run preview

# SpaceX Integration
npm run fetch:spacex-schema    # Fetch SpaceX GraphQL schema
npm run codegen:spacex          # Generate TypeScript types from schema
```

### Verificación del Backend
Asegúrate de que el backend esté corriendo antes de iniciar el frontend:
```bash
curl http://localhost:8082/graphql
```

## 🔧 Configuración

### Backend API

El frontend usa un **proxy de Vite** para evitar problemas de CORS:

```
Frontend: http://localhost:3000
Proxy: /graphql → http://localhost:8082/graphql
```

**Configuración del Proxy:**
- `vite.config.ts` → `server.proxy` (ya configurado)
- `src/api/graphqlClient.ts` → `API_URL = '/graphql'` (ruta relativa)

**Para cambiar el backend:**
1. Edita `vite.config.ts` → `server.proxy['/graphql'].target`
2. Reinicia el servidor de desarrollo

### Credenciales de prueba

```
Email: testuser@example.com
Password: Test123!
```

## 📁 Estructura del Proyecto

```
src/
├── api/                      # Capa de API GraphQL
│   ├── graphqlClient.ts      # Cliente GraphQL base
│   ├── auth.ts               # API de autenticación
│   ├── mfa.ts                # API de MFA
│   └── files.ts              # API de archivos
│
├── components/               # Componentes organizados por categoría
│   ├── ui/                   # Componentes UI básicos
│   │   ├── Alert.tsx         # Notificaciones
│   │   ├── Button.tsx        # Botón base
│   │   ├── Input.tsx         # Input base
│   │   ├── Modal.tsx         # Modal/Dialog
│   │   ├── SearchBar.tsx     # Barra de búsqueda
│   │   └── index.ts          # Barrel export
│   │
│   ├── patterns/             # Page Patterns (Twilio Design System)
│   │   ├── Page.tsx          # Layout base
│   │   ├── PageHeader.tsx    # Header de páginas
│   │   ├── DataTablePage.tsx # Página con tabla de datos
│   │   ├── FileUploadModal.tsx # Modal de upload
│   │   └── index.ts          # Barrel export
│   │
│   ├── layout/               # Componentes de layout
│   │   ├── AppLayout.tsx     # Layout principal
│   │   ├── ProtectedRoute.tsx # HOC de autenticación
│   │   └── index.ts          # Barrel export
│   │
│   └── index.ts              # Main barrel export
│
├── stories/                  # Stories de Storybook organizadas
│   ├── ui/                   # Stories de componentes UI
│   ├── patterns/             # Stories de patterns
│   └── pages/                # Stories de páginas completas
│
├── __tests__/                # Tests organizados por tipo
│   ├── components/           # Tests unitarios de componentes (144 tests)
│   ├── hooks/                # Tests de hooks (planned)
│   ├── store/                # Tests de Redux (planned)
│   ├── utils/                # Tests de utilidades (planned)
│   └── integration/          # Tests de integración (planned)
│
├── pages/                    # Páginas de la aplicación
│   ├── LoginPage.tsx         # Página de login
│   ├── FilesPage.tsx         # Gestión de archivos
│   └── MFAPage.tsx           # Configuración de MFA
│
├── hooks/                    # Custom hooks
│   ├── useAuth.ts            # Hook de autenticación
│   ├── useFiles.ts           # Hook de archivos
│   └── useMfa.ts             # Hook de MFA
│
├── store/                    # Redux store
│   ├── store.ts              # Store configuration
│   ├── authSlice.ts          # Auth state management
│   └── filesApi.ts           # RTK Query API for files
│
├── utils/                    # Utilidades
│   ├── formatDate.ts         # Formateo de fechas y tamaños
│   ├── errors.ts             # Manejo de errores
│   └── tokenManager.ts       # Gestión segura de tokens
│
├── styles/
│   └── tailwind.css          # Estilos globales
│
├── App.tsx                   # Componente principal con rutas
└── main.tsx                  # Punto de entrada
```

📖 **Ver documentación detallada**: [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md)
```

## 📚 Storybook - Documentación Interactiva

Este proyecto incluye **Storybook completo** con documentación interactiva de todos los componentes y páginas.

### Iniciar Storybook
```bash
npm run storybook
```

Esto abrirá Storybook en `http://localhost:6006`

### ¿Qué incluye Storybook?

#### 14 Stories Implementadas:

**Componentes Base (5)**
- `Button.stories.tsx` - 8 variantes (Primary, Secondary, Danger, Ghost, Sizes, Disabled, With Icon)
- `Input.stories.tsx` - 7 variantes (Default, Email, Password, Required, Error, Disabled, Number)
- `Alert.stories.tsx` - 5 variantes (Success, Error, Warning, Info, Long Message)
- `Modal.stories.tsx` - 4 variantes (Default, With Form, Confirmation, Long Content)
- `SearchBar.stories.tsx` - 4 variantes (Default, File Search, User Search, With Initial Value)

**Layout Components (3)**
- `Page.stories.tsx` - 4 variantes (Default, With Description, With Actions, Multiple Sections)
- `PageHeader.stories.tsx` - 5 variantes (Default, With Description, With Actions, Long Title, Multiple Actions)
- `AppLayout.stories.tsx` - 2 variantes (Default, Scrollable Content)

**Componentes Complejos (3)**
- `DataTablePage.stories.tsx` - 3 variantes (User Table, File Table, Empty State)
- `FileUploadModal.stories.tsx` - 2 variantes (Default, With Custom Handler)
- `ProtectedRoute.stories.tsx` - 2 variantes (Authenticated, Unauthenticated)

**Páginas (3)**
- `LoginPage.stories.tsx` - 2 variantes (Default, With Error)
- `MFAPage.stories.tsx` - 2 variantes (Default, With Mock Data)
- `FilesPage.stories.tsx` - 2 variantes (Default, With Mock Auth)

#### Documentación Adicional
- `Introduction.mdx` - Overview completo del Design System, patrones, tokens y recursos

### Características de Storybook

- ✅ **Controles interactivos** - Modifica props en tiempo real
- ✅ **Documentación automática** - Autodocs generado de TypeScript
- ✅ **Múltiples variantes** - Cada componente con sus casos de uso
- ✅ **Responsive** - Preview en diferentes viewports
- ✅ **Accesibilidad** - Addon de a11y incluido
- ✅ **Tokens de diseño** - Colores, tipografía, espaciado documentados

### Build Storybook para producción
```bash
npm run build-storybook
```

Esto genera una versión estática en `storybook-static/` que puedes deployar.

## 🎯 Flujos Implementados

### 1. Login Flow
```
LoginPage → Submit credentials → API call → Store token → Redirect to Files
```

### 2. MFA Setup Flow
```
MFAPage → Setup MFA → Show QR + Backup Codes → Enter TOTP → Enable MFA
```

### 3. File Upload Flow
```
FilesPage → Open Modal → Select File → Upload:
  1. Generate presigned URL
  2. Upload to S3
  3. Complete upload
→ Refresh file list
```

### 4. Protected Navigation
```
Any protected route → Check auth → If not authenticated → Redirect to Login
```

## 🔐 Autenticación

Todos los endpoints (excepto login) requieren JWT authentication:

```typescript
Authorization: Bearer <token>
```

El token se almacena en `localStorage` y se incluye automáticamente en todas las requests.

## 🎨 Tokens de Diseño (Tailwind)

### Colores Twilio
```css
twilio-blue: #0263E0
twilio-red: #F22F46
twilio-green: #14B053
twilio-gray-50 a gray-900
```

### Espaciado
Sigue el sistema de espaciado de Tailwind (4px base).

### Tipografía
Fuente: **Inter** (Google Fonts)

## 📝 Componentes Clave

### DataTablePage
Implementa el patrón completo de tabla de datos:
- Header con título y acciones
- Búsqueda integrada
- Tabla responsiva
- Loading states
- Empty states
- Columnas configurables

### FileUploadModal
Modal de upload con:
- Drag & drop (visual)
- Validación de archivos
- Progress bar
- Error handling
- Flujo de 3 pasos transparente

### Protected Routes
Wrapper que protege rutas:
- Verifica autenticación
- Redirige a login si no autenticado
- Mantiene URL destino para redirect

## 🧪 Testing

Para probar el flujo completo:

1. **Login**
   - Ir a `/login`
   - Usar credenciales de prueba
   - Verificar redirección a `/files`

2. **MFA Setup**
   - Ir a `/mfa`
   - Click "Setup MFA"
   - Escanear QR con Google Authenticator
   - Guardar backup codes
   - Ingresar código TOTP
   - Verificar que MFA se habilita

3. **Upload File**
   - En `/files`, click "Upload File"
   - Seleccionar archivo
   - Verificar progress bar
   - Confirmar que archivo aparece en tabla

4. **Logout**
   - Click en botón "Logout"
   - Verificar redirección a login

## 🐛 Troubleshooting

### Backend no responde
Verificar que el backend esté corriendo en `http://localhost:8082`

### Errores de CORS
El backend debe permitir requests desde el origen del frontend

### Token expirado
Los tokens expiran en 15 minutos (900 segundos). Hacer login nuevamente.

### MFA no funciona
Verificar que el código TOTP sea válido (expira cada 30 segundos)

## 📚 Referencias

- [Twilio Design System](https://paste.twilio.design/)
- [Base UI Documentation](https://base-ui.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

## 🎬 Demo

El proyecto está listo para demo ejecutiva mostrando:

1. ✅ Login funcional con UI limpia
2. ✅ MFA completo (setup, enable, disable)
3. ✅ Upload de archivos con progress
4. ✅ Listado de archivos con búsqueda
5. ✅ Navegación protegida
6. ✅ UI consistente con Twilio Design System

---

**Desarrollado para Twilio - CCAI Collections PoC**
