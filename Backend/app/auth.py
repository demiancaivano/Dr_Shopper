# auth.py
# Aquí definimos las rutas relacionadas con autenticación (login, registro, etc.)
# Usamos un 'blueprint' para organizar estas rutas y poder importarlas fácilmente en __init__.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import re
from .models import User, db

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

@auth.route('/auth/register', methods=['POST'])
def register():
    """
    Registra un nuevo usuario en el sistema.
    
    Requiere en el body:
    - username: string (único)
    - email: string (único, formato válido)
    - password: string (mínimo 6 caracteres)
    
    Retorna:
    - 201: Usuario creado exitosamente
    - 400: Datos inválidos o usuario/email ya existe
    """
    try:
        data = request.get_json()
        
        # Validar que todos los campos requeridos estén presentes
        if not all(key in data for key in ['username', 'email', 'password']):
            return jsonify({'error': 'Faltan campos requeridos: username, email, password'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validaciones
        if len(username) < 3:
            return jsonify({'error': 'El nombre de usuario debe tener al menos 3 caracteres'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
        # Validar formato de email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Crear el nuevo usuario
        hashed_password = generate_password_hash(password)
        new_user = User()
        new_user.username = username
        new_user.email = email
        new_user.password = hashed_password
        new_user.is_admin = False
        
        db.session.add(new_user)
        db.session.commit()
        
        # Crear tokens de acceso
        access_token = create_access_token(identity=str(new_user.id))
        refresh_token = create_refresh_token(identity=str(new_user.id))
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': new_user.serialize(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth.route('/auth/login', methods=['POST'])
def login():
    """
    Autentica un usuario y retorna tokens de acceso.
    
    Requiere en el body:
    - username: string (o email)
    - password: string
    
    Retorna:
    - 200: Login exitoso con tokens
    - 401: Credenciales inválidas
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['username', 'password']):
            return jsonify({'error': 'Faltan campos requeridos: username, password'}), 400
        
        username_or_email = data['username'].strip()
        password = data['password']
        
        # Buscar usuario por username o email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not check_password_hash(user.password, password):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Crear tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login exitoso',
            'user': user.serialize(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresca el token de acceso usando el refresh token.
    
    Requiere:
    - Header Authorization: Bearer <refresh_token>
    
    Retorna:
    - 200: Nuevo access token
    - 401: Refresh token inválido
    """
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error al refrescar el token'}), 500

@auth.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Cierra la sesión del usuario (invalida el token).
    
    Requiere:
    - Header Authorization: Bearer <access_token>
    
    Retorna:
    - 200: Logout exitoso
    """
    try:
        # En una implementación más robusta, aquí podrías agregar el token a una blacklist
        return jsonify({'message': 'Logout exitoso'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Error al hacer logout'}), 500

@auth.route('/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """
    Verifica si el token de acceso es válido y retorna información del usuario.
    
    Requiere:
    - Header Authorization: Bearer <access_token>
    
    Retorna:
    - 200: Token válido con información del usuario
    - 401: Token inválido
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'valid': True,
            'user': user.serialize()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error al verificar el token'}), 500

@auth.route('/auth/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    Cambia la contraseña del usuario autenticado.
    
    Requiere:
    - Header Authorization: Bearer <access_token>
    - Body: current_password, new_password
    
    Retorna:
    - 200: Contraseña cambiada exitosamente
    - 400: Datos inválidos
    - 401: Contraseña actual incorrecta
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        if not all(key in data for key in ['current_password', 'new_password']):
            return jsonify({'error': 'Faltan campos requeridos: current_password, new_password'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Verificar contraseña actual
        if not check_password_hash(user.password, current_password):
            return jsonify({'error': 'Contraseña actual incorrecta'}), 401
        
        # Validar nueva contraseña
        if len(new_password) < 6:
            return jsonify({'error': 'La nueva contraseña debe tener al menos 6 caracteres'}), 400
        
        # Actualizar contraseña
        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Contraseña cambiada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    """
    Inicia el proceso de recuperación de contraseña.
    
    Requiere en el body:
    - email: string
    
    Retorna:
    - 200: Email de recuperación enviado (simulado)
    - 404: Email no encontrado
    """
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({'error': 'Campo email requerido'}), 400
        
        email = data['email'].strip().lower()
        
        # Buscar usuario por email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Email no encontrado'}), 404
        
        # En una implementación real, aquí enviarías un email con un token de recuperación
        # Por ahora, solo simulamos el envío
        
        return jsonify({
            'message': 'Si el email existe en nuestra base de datos, recibirás un enlace de recuperación'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Resetea la contraseña usando un token de recuperación.
    
    Requiere en el body:
    - token: string (token de recuperación)
    - new_password: string
    
    Retorna:
    - 200: Contraseña reseteada exitosamente
    - 400: Datos inválidos
    - 401: Token inválido o expirado
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['token', 'new_password']):
            return jsonify({'error': 'Faltan campos requeridos: token, new_password'}), 400
        
        token = data['token']
        new_password = data['new_password']
        
        # Validar nueva contraseña
        if len(new_password) < 6:
            return jsonify({'error': 'La nueva contraseña debe tener al menos 6 caracteres'}), 400
        
        # En una implementación real, aquí verificarías el token de recuperación
        # y obtendrías el usuario correspondiente
        # Por ahora, simulamos que el token es válido
        
        return jsonify({'message': 'Contraseña reseteada exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth.route('/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Obtiene el perfil del usuario autenticado.
    
    Requiere:
    - Header Authorization: Bearer <access_token>
    
    Retorna:
    - 200: Perfil del usuario
    - 404: Usuario no encontrado
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'user': user.serialize()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth.route('/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Actualiza el perfil del usuario autenticado.
    
    Requiere:
    - Header Authorization: Bearer <access_token>
    - Body: username, email (opcionales)
    
    Retorna:
    - 200: Perfil actualizado exitosamente
    - 400: Datos inválidos
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        # Actualizar username si se proporciona
        if 'username' in data:
            new_username = data['username'].strip()
            if len(new_username) < 3:
                return jsonify({'error': 'El nombre de usuario debe tener al menos 3 caracteres'}), 400
            
            # Verificar si el username ya está en uso
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400
            
            user.username = new_username
        
        # Actualizar email si se proporciona
        if 'email' in data:
            new_email = data['email'].strip().lower()
            
            # Validar formato de email
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, new_email):
                return jsonify({'error': 'Formato de email inválido'}), 400
            
            # Verificar si el email ya está en uso
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'El email ya está registrado'}), 400
            
            user.email = new_email
        
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil actualizado exitosamente',
            'user': user.serialize()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500
