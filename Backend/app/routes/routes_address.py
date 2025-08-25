from flask import Blueprint, request, jsonify
from app.models import Address
from app import db # type: ignore
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

address_bp = Blueprint('address_bp', __name__)

# ==================== RUTAS DE DIRECCIONES ====================

@address_bp.route('/', methods=['GET'])
@jwt_required()
def get_addresses():
    """Obtener todas las direcciones del usuario"""
    current_user_id = get_jwt_identity()
    
    addresses = Address.query.filter_by(user_id=current_user_id).all()
    return jsonify({'addresses': [address.serialize() for address in addresses]}), 200

@address_bp.route('/<int:address_id>', methods=['GET'])
@jwt_required()
def get_address(address_id):
    """Obtener una dirección específica del usuario"""
    current_user_id = get_jwt_identity()
    
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not address:
        return jsonify({'message': 'Dirección no encontrada'}), 404
    
    return jsonify(address.serialize()), 200

@address_bp.route('/', methods=['POST'])
@jwt_required()
def create_address():
    """Crear una nueva dirección para el usuario"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['street', 'city', 'country']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': 'street, city y country son campos requeridos'}), 400
    
    try:
        new_address = Address()
        new_address.user_id = current_user_id
        new_address.street = data['street']
        new_address.city = data['city']
        new_address.state = data.get('state', '')
        new_address.zip_code = data.get('zip_code', '')
        new_address.country = data['country']
        new_address.extra_info = data.get('extra_info', '')
        new_address.is_default = data.get('is_default', False)
        
        # Si esta dirección será la predeterminada, quitar el flag de las otras
        if new_address.is_default:
            Address.query.filter_by(user_id=current_user_id, is_default=True).update({'is_default': False})
        
        db.session.add(new_address)
        db.session.commit()
        
        return jsonify({
            'message': 'Dirección creada exitosamente',
            'address': new_address.serialize()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al crear la dirección'}), 400

@address_bp.route('/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_address(address_id):
    """Actualizar una dirección existente"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not address:
        return jsonify({'message': 'Dirección no encontrada'}), 404
    
    try:
        if 'street' in data:
            address.street = data['street']
        if 'city' in data:
            address.city = data['city']
        if 'state' in data:
            address.state = data['state']
        if 'zip_code' in data:
            address.zip_code = data['zip_code']
        if 'country' in data:
            address.country = data['country']
        if 'extra_info' in data:
            address.extra_info = data['extra_info']
        if 'is_default' in data:
            # Si se está marcando como predeterminada, quitar el flag de las otras
            if data['is_default']:
                Address.query.filter_by(user_id=current_user_id, is_default=True).update({'is_default': False})
            address.is_default = data['is_default']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Dirección actualizada exitosamente',
            'address': address.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar la dirección'}), 400

@address_bp.route('/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    """Eliminar una dirección"""
    current_user_id = get_jwt_identity()
    
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not address:
        return jsonify({'message': 'Dirección no encontrada'}), 404
    
    try:
        db.session.delete(address)
        db.session.commit()
        
        return jsonify({'message': 'Dirección eliminada exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'No se puede eliminar la dirección porque está en uso'}), 400

@address_bp.route('/default/<int:address_id>', methods=['PUT'])
@jwt_required()
def set_default_address(address_id):
    """Establecer una dirección como predeterminada"""
    current_user_id = get_jwt_identity()
    
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not address:
        return jsonify({'message': 'Dirección no encontrada'}), 404
    
    try:
        # Quitar el flag de predeterminada de todas las direcciones del usuario
        Address.query.filter_by(user_id=current_user_id, is_default=True).update({'is_default': False})
        
        # Establecer esta dirección como predeterminada
        address.is_default = True
        db.session.commit()
        
        return jsonify({'message': 'Dirección establecida como predeterminada exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al establecer la dirección como predeterminada'}), 400

@address_bp.route('/default', methods=['GET'])
@jwt_required()
def get_default_address():
    """Obtener la dirección predeterminada del usuario"""
    current_user_id = get_jwt_identity()
    
    address = Address.query.filter_by(user_id=current_user_id, is_default=True).first()
    if not address:
        return jsonify({'message': 'No hay dirección predeterminada configurada'}), 404
    
    return jsonify(address.serialize()), 200 