# __init__.py
# Este archivo inicializa la aplicación Flask y la base de datos.
# Aquí también se pueden inicializar otras extensiones (como JWT, CORS, etc).

from flask import Flask, request
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

    # Habilitamos CORS para permitir peticiones desde el frontend
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    
    # Configuración CORS segura para producción
    if app.config.get('FLASK_ENV') == 'production':
        # En producción, solo permitir orígenes específicos
        cors_origins = [frontend_url] if frontend_url else []
        CORS(
            app,
            origins=cors_origins,
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization"],
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )
    else:
        # En desarrollo, permitir orígenes locales y de red
        cors_origins = [
            frontend_url,
            "http://192.168.30.201:5173",  # IP de red para móvil
            "http://172.28.160.1:5173",    # Otra IP de red
            "http://localhost:5173",        # Localhost
            "http://127.0.0.1:5173",       # Localhost alternativo
        ]
        CORS(
            app,
            origins=cors_origins,
            supports_credentials=False,  # Deshabilitar credentials para desarrollo
            allow_headers=["Content-Type", "Authorization"],
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )

    # Handler global para responder a las peticiones OPTIONS (preflight)
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            return '', 200

    # Importamos y registramos los blueprints (rutas/endpoints)
    from .routes import register_blueprints
    register_blueprints(app)

    return app
