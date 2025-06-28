# __init__.py
# Este archivo inicializa la aplicación Flask y la base de datos.
# Aquí también se pueden inicializar otras extensiones (como JWT, CORS, etc).

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate  # Importamos Flask-Migrate

# Creamos la instancia de SQLAlchemy (ORM para la base de datos)
db = SQLAlchemy()

# Creamos la instancia de JWTManager (para autenticación con JWT)
jwt = JWTManager()

# Creamos la instancia de Flask-Migrate (para migraciones de la base de datos)
migrate = Migrate()

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

    # Habilitamos CORS para permitir peticiones desde el frontend
    CORS(app)

    # Importamos y registramos los blueprints (rutas/endpoints)
    from .routes import register_blueprints
    register_blueprints(app)

    return app
