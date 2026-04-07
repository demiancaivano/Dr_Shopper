# __init__.py
# Este archivo inicializa la aplicación Flask y la base de datos.
# Aquí también se pueden inicializar otras extensiones (como JWT, CORS, etc).

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate  # Importamos Flask-Migrate
from flask_mail import Mail
import os

# Creamos la instancia de SQLAlchemy (ORM para la base de datos)
db = SQLAlchemy()

# Creamos la instancia de JWTManager (para autenticación con JWT)
jwt = JWTManager()

# Creamos la instancia de Flask-Migrate (para migraciones de la base de datos)
migrate = Migrate()

# Creamos la instancia de Flask-Mail (para envío de correos electrónicos)
mail = Mail()

# Función para crear y configurar la app Flask
def create_app():
    # Creamos la app Flask
    app = Flask(__name__)

    # Cargamos la configuración desde el archivo config.py
    app.config.from_object('app.config.Config')

    # Inicializamos la base de datos con la app
    db.init_app(app)

    # Inicializamos Flask-Migrate con la app y la base de datos
    migrate.init_app(app, db)

    # Inicializamos JWT con la app
    jwt.init_app(app)

    # Inicializamos Flask-Mail con la app
    mail.init_app(app)

    # CORS
    # En el navegador, si el origen del frontend no está permitido exactamente,
    # el backend puede procesar el POST (crear el usuario) pero el browser bloqueará la respuesta.
    raw_origins = os.environ.get("CORS_ORIGINS", "").strip()
    if raw_origins:
        cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    else:
        # Defaults razonables para dev + Render (ajústalos vía CORS_ORIGINS en producción)
        cors_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://dr-shopper.onrender.com",
        ]

    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # Importamos y registramos los blueprints (rutas/endpoints)
    from .routes import register_blueprints
    register_blueprints(app)

    return app
