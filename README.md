# Dr_Shopper 🛒

Una aplicación web completa para gestión de compras con backend en Flask y frontend en React.

## 🚀 Características

- **Backend**: API REST con Flask, SQLAlchemy y JWT
- **Frontend**: Interfaz moderna con React y Vite
- **Autenticación**: Sistema de autenticación seguro con JWT
- **Base de datos**: ORM con SQLAlchemy y migraciones
- **CORS**: Configurado para comunicación entre frontend y backend

## 📁 Estructura del Proyecto

```
Dr_Shopper/
├── Backend/                 # API Flask
│   ├── app/
│   │   ├── __init__.py     # Configuración de la app
│   │   ├── auth.py         # Autenticación
│   │   ├── config.py       # Configuración
│   │   ├── models.py       # Modelos de base de datos
│   │   └── routes.py       # Rutas de la API
│   ├── migrations/         # Migraciones de base de datos
│   ├── requirements.txt    # Dependencias Python
│   └── run.py             # Script de ejecución
└── frontend/              # Aplicación React
    ├── src/
    │   ├── App.jsx        # Componente principal
    │   └── main.jsx       # Punto de entrada
    ├── package.json       # Dependencias Node.js
    └── vite.config.js     # Configuración de Vite
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask**: Framework web
- **SQLAlchemy**: ORM para base de datos
- **Flask-JWT-Extended**: Autenticación JWT
- **Flask-Migrate**: Migraciones de base de datos
- **Flask-CORS**: Soporte para CORS

### Frontend
- **React**: Biblioteca de interfaz de usuario
- **Vite**: Herramienta de construcción
- **ESLint**: Linter para JavaScript

## 📦 Instalación

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- Git

### Backend

1. Navega al directorio del backend:
```bash
cd Backend
```

2. Crea un entorno virtual:
```bash
python -m venv venv
```

3. Activa el entorno virtual:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Configura las variables de entorno (crea un archivo `.env`):
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta_aqui
DATABASE_URL=sqlite:///app.db
```

6. Inicializa la base de datos:
```bash
flask db init
flask db migrate
flask db upgrade
```

7. Ejecuta el servidor:
```bash
python run.py
```

### Frontend

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

## 🌐 Uso

- **Backend**: Disponible en `http://localhost:5000`
- **Frontend**: Disponible en `http://localhost:5173`

## 📝 API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cerrar sesión

### Usuarios
- `GET /users` - Obtener lista de usuarios
- `GET /users/<id>` - Obtener usuario específico
- `PUT /users/<id>` - Actualizar usuario
- `DELETE /users/<id>` - Eliminar usuario

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Tu Nombre** - [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)

## 🙏 Agradecimientos

- Flask por el excelente framework
- React por la biblioteca de interfaz de usuario
- La comunidad de desarrolladores por el apoyo 