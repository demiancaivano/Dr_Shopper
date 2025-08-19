# config.py
# Este archivo contiene la configuración de la aplicación Flask.
# Aquí se definen cosas como la conexión a la base de datos, la clave secreta, etc.

import os
from dotenv import load_dotenv
from datetime import timedelta
load_dotenv()

class Config:
    # Clave secreta para la app (importante para sesiones y JWT)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 't@ny_Tony_ChOppEr-7-T@nuki$'

    # URI de la base de datos (SQLite para desarrollo, PostgreSQL para producción)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///dr_shopper.db'

    # Desactiva el seguimiento de modificaciones para ahorrar recursos
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración de JWT (puedes agregar más opciones si lo necesitas)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'otra_clave_secreta_para_jwt'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)  # Token válido por 7 días

    # Configuración de Flask-Mail
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', '1', 'yes']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', '1', 'yes']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)

    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY')
