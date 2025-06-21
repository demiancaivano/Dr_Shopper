# auth.py
# Aquí definimos las rutas relacionadas con autenticación (login, registro, etc.)
# Usamos un 'blueprint' para organizar estas rutas y poder importarlas fácilmente en __init__.py

from flask import Blueprint, jsonify

# Creamos el blueprint llamado 'auth'
auth = Blueprint('auth', __name__)

# Ruta de prueba para verificar que el blueprint de autenticación funciona
@auth.route('/auth/ping', methods=['GET'])
def auth_ping():
    """
    Endpoint de prueba. Si accedes a /auth/ping, responde con 'pong auth'.
    Sirve para comprobar que el blueprint de autenticación está funcionando.
    """
    return jsonify({'message': 'pong auth'})
