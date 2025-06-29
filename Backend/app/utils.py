from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask import jsonify, request
from app.models import User
from functools import wraps

def admin_required():
    """
    Decorador para verificar que el usuario es administrador.
    Se debe usar después de @jwt_required()
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or not user.is_admin:
                return jsonify({'error': 'Acceso denegado. Se requieren permisos de administrador.'}), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def validate_json(*required_fields):
    """
    Decorador para validar que el JSON contiene los campos requeridos.
    
    Args:
        *required_fields: Lista de campos que deben estar presentes en el JSON
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Se requiere JSON'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Se requiere JSON válido'}), 400
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': f'Faltan campos requeridos: {", ".join(missing_fields)}'
                }), 400
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def validate_email(email):
    """
    Valida el formato de un email.
    
    Args:
        email (str): Email a validar
        
    Returns:
        bool: True si el email es válido, False en caso contrario
    """
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    """
    Valida la fortaleza de una contraseña.
    
    Args:
        password (str): Contraseña a validar
        
    Returns:
        dict: Diccionario con 'valid' (bool) y 'message' (str) si hay error
    """
    if len(password) < 6:
        return {'valid': False, 'message': 'La contraseña debe tener al menos 6 caracteres'}
    
    if len(password) > 128:
        return {'valid': False, 'message': 'La contraseña no puede tener más de 128 caracteres'}
    
    return {'valid': True, 'message': ''}

def sanitize_input(text):
    """
    Sanitiza un texto de entrada removiendo caracteres peligrosos.
    
    Args:
        text (str): Texto a sanitizar
        
    Returns:
        str: Texto sanitizado
    """
    if not text:
        return text
    
    # Remover caracteres de control excepto tab y newline
    import re
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Limpiar espacios extra
    text = ' '.join(text.split())
    
    return text.strip()

def paginate_query(query, page=1, per_page=10):
    """
    Aplica paginación a una consulta de SQLAlchemy.
    
    Args:
        query: Consulta de SQLAlchemy
        page (int): Número de página (comienza en 1)
        per_page (int): Elementos por página
        
    Returns:
        dict: Diccionario con 'items', 'total', 'pages', 'current_page', 'per_page'
    """
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 10
    if per_page > 100:
        per_page = 100
    
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return {
        'items': [item.serialize() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    }

def format_error_response(error, status_code=400):
    """
    Formatea una respuesta de error consistente.
    
    Args:
        error (str): Mensaje de error
        status_code (int): Código de estado HTTP
        
    Returns:
        tuple: (response, status_code)
    """
    return jsonify({'error': error}), status_code

def format_success_response(data, message="Operación exitosa", status_code=200):
    """
    Formatea una respuesta de éxito consistente.
    
    Args:
        data: Datos a retornar
        message (str): Mensaje de éxito
        status_code (int): Código de estado HTTP
        
    Returns:
        tuple: (response, status_code)
    """
    response = {
        'message': message,
        'data': data
    }
    return jsonify(response), status_code
