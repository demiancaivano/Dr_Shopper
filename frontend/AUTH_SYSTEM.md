# Sistema de Autenticación - Dr. Shopper

## Descripción General

El sistema de autenticación de Dr. Shopper está implementado usando React Context API y JWT tokens. Proporciona funcionalidades completas de registro, login, logout, recuperación de contraseña y protección de rutas.

## Componentes Principales

### 1. AuthContext (`src/context/AuthContext.jsx`)

El contexto principal que maneja el estado de autenticación y proporciona métodos para interactuar con el backend.

**Estado:**
- `isAuthenticated`: Boolean que indica si el usuario está autenticado
- `user`: Objeto con la información del usuario
- `loading`: Boolean que indica si se está verificando la autenticación
- `error`: String con mensajes de error

**Métodos:**
- `login(username, password)`: Inicia sesión del usuario
- `register(username, email, password)`: Registra un nuevo usuario
- `logout()`: Cierra la sesión del usuario
- `clearError()`: Limpia los errores
- `refreshToken()`: Refresca el token de acceso

### 2. ProtectedRoute (`src/components/ProtectedRoute.jsx`)

Componente que protege rutas que requieren autenticación.

**Props:**
- `requireAuth`: Boolean (default: true) - Si la ruta requiere autenticación
- `requireAdmin`: Boolean (default: false) - Si la ruta requiere ser admin

### 3. useApi Hook (`src/hooks/useApi.js`)

Hook personalizado para hacer peticiones HTTP con autenticación automática y refresh de tokens.

**Métodos:**
- `get(url, options)`: Petición GET
- `post(url, data, options)`: Petición POST
- `put(url, data, options)`: Petición PUT
- `delete(url, options)`: Petición DELETE

## Páginas de Autenticación

### 1. Login (`src/pages/Login.jsx`)
- Formulario de inicio de sesión
- Validación de campos
- Redirección automática después del login
- Manejo de errores

### 2. Register (`src/pages/Register.jsx`)
- Formulario de registro
- Validaciones completas (username, email, password)
- Confirmación de contraseña
- Manejo de errores

### 3. ForgotPassword (`src/pages/ForgotPassword.jsx`)
- Formulario para solicitar recuperación de contraseña
- Integración con el backend
- Mensajes de confirmación

## Flujo de Autenticación

### 1. Inicio de la Aplicación
1. El `AuthProvider` se inicializa
2. Se verifica si existe un token en localStorage
3. Si existe, se valida con el backend
4. Si es válido, se establece el estado de autenticación
5. Si no es válido, se limpia localStorage

### 2. Login
1. Usuario ingresa credenciales
2. Se envía petición al backend
3. Si es exitoso, se guardan los tokens en localStorage
4. Se actualiza el estado de autenticación
5. Se redirige al usuario a la página desde donde vino

### 3. Protección de Rutas
1. `ProtectedRoute` verifica si el usuario está autenticado
2. Si no está autenticado, redirige a `/login`
3. Guarda la ubicación actual para volver después del login

### 4. Refresh de Tokens
1. Cuando una petición HTTP devuelve 401
2. Se intenta refrescar el token automáticamente
3. Si es exitoso, se reintenta la petición original
4. Si falla, se hace logout

## Almacenamiento

Los tokens se almacenan en localStorage:
- `access_token`: Token de acceso (corta duración)
- `refresh_token`: Token de refresco (larga duración)

## Seguridad

- Los tokens se envían automáticamente en el header `Authorization`
- Los tokens expirados se refrescan automáticamente
- Las rutas protegidas redirigen a login si no hay autenticación
- Los errores de autenticación limpian el estado automáticamente

## Uso en Componentes

### Ejemplo básico:
```jsx
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

function MyComponent() {
  const { state, login, logout } = useContext(AuthContext);
  
  if (state.isAuthenticated) {
    return <div>Bienvenido, {state.user.username}!</div>;
  }
  
  return <div>Por favor inicia sesión</div>;
}
```

### Ejemplo con useApi:
```jsx
import { useApi } from '../hooks/useApi';

function MyComponent() {
  const { get, post } = useApi();
  
  const fetchData = async () => {
    try {
      const response = await get('/api/data');
      const data = await response.json();
      // Procesar datos
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

## Configuración del Backend

El sistema espera que el backend tenga los siguientes endpoints:

- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh de token
- `GET /api/auth/verify` - Verificación de token
- `POST /api/auth/forgot-password` - Recuperación de contraseña

## Variables de Entorno

Asegúrate de tener configurada la variable:
```
VITE_API_URL=http://localhost:5000
``` 