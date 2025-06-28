# config.py
# Este archivo contiene la configuración de la aplicación Flask.
# Aquí se definen cosas como la conexión a la base de datos, la clave secreta, etc.

import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    # Clave secreta para la app (importante para sesiones y JWT)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 't@ny_Tony_ChOppEr-7-T@nuki$'

    # URI de la base de datos (PostgreSQL en este caso)
    # Cambia los valores de usuario, contraseña, host y base de datos según tu configuración
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

    # Desactiva el seguimiento de modificaciones para ahorrar recursos
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración de JWT (puedes agregar más opciones si lo necesitas)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'otra_clave_secreta_para_jwt'
