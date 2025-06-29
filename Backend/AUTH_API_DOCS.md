# API de Autenticación - Dr. Shopper

Esta documentación describe todas las rutas de autenticación disponibles en la API de Dr. Shopper.

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Registro de Usuario
**POST** `/auth/register`

Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "creation_date": "2024-01-01T00:00:00",
    "is_admin": false
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Errores posibles:**
- `400`: Faltan campos requeridos
- `400`: Username o email ya existe
- `400`: Formato de email inválido
- `400`: Contraseña muy corta

---

### 2. Login
**POST** `/auth/login`

Autentica un usuario y retorna tokens de acceso.

**Body:**
```json
{
  "username": "usuario123",
  "password": "contraseña123"
}
```

*Nota: El campo `username` puede ser el nombre de usuario o el email.*

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "creation_date": "2024-01-01T00:00:00",
    "is_admin": false
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Errores posibles:**
- `400`: Faltan campos requeridos
- `401`: Credenciales inválidas

---

### 3. Refresh Token
**POST** `/auth/refresh`

Refresca el token de acceso usando el refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Errores posibles:**
- `401`: Refresh token inválido o expirado

---

### 4. Logout
**POST** `/auth/logout`

Cierra la sesión del usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Logout exitoso"
}
```

---

### 5. Verificar Token
**GET** `/auth/verify`

Verifica si el token de acceso es válido y retorna información del usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "creation_date": "2024-01-01T00:00:00",
    "is_admin": false
  }
}
```

**Errores posibles:**
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado

---

### 6. Cambiar Contraseña
**PUT** `/auth/change-password`

Cambia la contraseña del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "current_password": "contraseña123",
  "new_password": "nueva_contraseña456"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña cambiada exitosamente"
}
```

**Errores posibles:**
- `400`: Faltan campos requeridos
- `400`: Nueva contraseña muy corta
- `401`: Contraseña actual incorrecta
- `404`: Usuario no encontrado

---

### 7. Recuperar Contraseña
**POST** `/auth/forgot-password`

Inicia el proceso de recuperación de contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Si el email existe en nuestra base de datos, recibirás un enlace de recuperación"
}
```

**Errores posibles:**
- `400`: Campo email requerido
- `404`: Email no encontrado

---

### 8. Resetear Contraseña
**POST** `/auth/reset-password`

Resetea la contraseña usando un token de recuperación.

**Body:**
```json
{
  "token": "token_de_recuperacion",
  "new_password": "nueva_contraseña456"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña reseteada exitosamente"
}
```

**Errores posibles:**
- `400`: Faltan campos requeridos
- `400`: Nueva contraseña muy corta
- `401`: Token inválido o expirado

---

### 9. Obtener Perfil
**GET** `/auth/profile`

Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "creation_date": "2024-01-01T00:00:00",
    "is_admin": false
  }
}
```

**Errores posibles:**
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado

---

### 10. Actualizar Perfil
**PUT** `/auth/profile`

Actualiza el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "username": "nuevo_usuario",
  "email": "nuevo@email.com"
}
```

*Nota: Los campos son opcionales. Solo se actualizan los campos proporcionados.*

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "username": "nuevo_usuario",
    "email": "nuevo@email.com",
    "creation_date": "2024-01-01T00:00:00",
    "is_admin": false
  }
}
```

**Errores posibles:**
- `400`: Username o email ya existe
- `400`: Formato de email inválido
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado

---

### 11. Ping (Prueba)
**GET** `/auth/ping`

Endpoint de prueba para verificar que el blueprint de autenticación funciona.

**Respuesta exitosa (200):**
```json
{
  "message": "pong auth"
}
```

---

## Autenticación

La API utiliza **JWT (JSON Web Tokens)** para la autenticación. Los tokens se deben incluir en el header `Authorization` de las peticiones:

```
Authorization: Bearer <access_token>
```

### Tipos de Tokens

1. **Access Token**: Token de acceso principal, usado para autenticar peticiones
2. **Refresh Token**: Token para renovar el access token cuando expire

### Manejo de Tokens

- Los tokens se generan automáticamente al hacer login o registro
- El access token tiene una duración limitada
- Usa el refresh token para obtener un nuevo access token
- Los tokens se invalidan al hacer logout

## Validaciones

### Username
- Mínimo 3 caracteres
- Debe ser único en el sistema

### Email
- Formato válido de email
- Debe ser único en el sistema
- Se convierte automáticamente a minúsculas

### Password
- Mínimo 6 caracteres
- Máximo 128 caracteres
- Se encripta automáticamente usando bcrypt

## Códigos de Estado HTTP

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error en los datos enviados
- `401`: No autorizado (token inválido o credenciales incorrectas)
- `403`: Acceso denegado (permisos insuficientes)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Ejemplos de Uso

### Registro y Login
```bash
# 1. Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'

# 2. Hacer login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "contraseña123"
  }'

# 3. Usar el token para acceder a rutas protegidas
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

### Refrescar Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"
```

### Cambiar Contraseña
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "contraseña123",
    "new_password": "nueva_contraseña456"
  }'
``` 