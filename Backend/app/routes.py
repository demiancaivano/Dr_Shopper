# routes.py
# Aquí definimos las rutas principales de la API (por ejemplo, productos, inicio, etc.)
# Usamos un 'blueprint' para organizar las rutas y poder importarlas fácilmente en __init__.py

from flask import Blueprint, jsonify

# Creamos el blueprint llamado 'main'
main = Blueprint('main', __name__)

# Ruta de prueba para verificar que la API funciona
@main.route('/ping', methods=['GET'])
def ping():
    """
    Endpoint de prueba. Si accedes a /ping, responde con 'pong'.
    Sirve para comprobar que el backend está funcionando.
    """
    return jsonify({'message': 'pong'})
