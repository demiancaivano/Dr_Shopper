from flask import Blueprint, request, jsonify
from app.models import User
from app import db  # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

user_bp = Blueprint('user_bp', __name__)

# Aquí irán los endpoints de usuario 

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['username', 'email', 'password']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': 'Faltan campos requeridos'}), 400

    # Verificar si el email o username ya existen
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'El email ya está registrado'}), 409
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'El nombre de usuario ya está registrado'}), 409

    hashed_password = generate_password_hash(data['password'])
    new_user = User()
    new_user.username = data['username']
    new_user.email = data['email']
    new_user.password = hashed_password
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado correctamente'}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email y contraseña son requeridos'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'message': 'Inicio de sesión exitoso', 'access_token': access_token}), 200
    return jsonify({'message': 'Credenciales incorrectas'}), 401

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user_info():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user:        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'creation_date': user.creation_date.isoformat() if user.creation_date else None
        }), 200
    return jsonify({'message': 'Usuario no encontrado'}), 404

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Cierre de sesión exitoso'}), 200

@user_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_user():
    data = request.get_json()
    current_user_id = get_jwt_identity()   
    user = User.query.get(current_user_id)
    if user:
        if 'username' in data and data['username']:
            # Verificar que el nuevo username no esté en uso por otro usuario
            if User.query.filter(User.username == data['username'], User.id != user.id).first():
                return jsonify({'message': 'El nombre de usuario ya está registrado'}), 409
            user.username = data['username']
        if 'email' in data and data['email']:
            # Verificar que el nuevo email no esté en uso por otro usuario
            if User.query.filter(User.email == data['email'], User.id != user.id).first():
                return jsonify({'message': 'El email ya está registrado'}), 409
            user.email = data['email']
        if 'password' in data and data['password']:
            user.password = generate_password_hash(data['password'])
        db.session.commit()
        return jsonify({'message': 'Usuario actualizado correctamente'}), 200
    return jsonify({'message': 'Usuario no encontrado'}), 404