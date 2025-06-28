from flask import Blueprint, request, jsonify
from app.models import Cart, CartItem, Product
from app import db # type: ignore
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

cart_bp = Blueprint('cart_bp', __name__)

# ==================== RUTAS DEL CARRITO ====================

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    """Obtener el carrito activo del usuario"""
    current_user_id = get_jwt_identity()
    
    # Buscar carrito activo del usuario
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    
    if not cart:
        # Si no existe un carrito activo, crear uno nuevo
        cart = Cart()
        cart.user_id = current_user_id
        cart.is_active = True
        db.session.add(cart)
        db.session.commit()
    
    # Obtener todos los items del carrito con información del producto
    cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
    
    # Calcular total del carrito
    total = sum(item.quantity * item.product.price for item in cart_items if item.product)
    
    return jsonify({
        'cart': cart.serialize(),
        'items': [item.serialize() for item in cart_items],
        'total': total,
        'item_count': len(cart_items)
    }), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Agregar un producto al carrito"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('product_id') or not data.get('quantity'):
        return jsonify({'message': 'product_id y quantity son requeridos'}), 400
    
    product_id = data['product_id']
    quantity = int(data['quantity'])
    
    if quantity <= 0:
        return jsonify({'message': 'La cantidad debe ser mayor a 0'}), 400
    
    # Verificar que el producto existe y tiene stock
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    if product.stock < quantity:
        return jsonify({'message': f'Stock insuficiente. Solo hay {product.stock} unidades disponibles'}), 400
    
    # Obtener o crear carrito activo
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        cart = Cart()
        cart.user_id = current_user_id
        cart.is_active = True
        db.session.add(cart)
        db.session.commit()
    
    # Verificar si el producto ya está en el carrito
    existing_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    
    try:
        if existing_item:
            # Actualizar cantidad si ya existe
            new_quantity = existing_item.quantity + quantity
            if product.stock < new_quantity:
                return jsonify({'message': f'Stock insuficiente. Solo hay {product.stock} unidades disponibles'}), 400
            existing_item.quantity = new_quantity
        else:
            # Crear nuevo item
            new_item = CartItem()
            new_item.cart_id = cart.id
            new_item.product_id = product_id
            new_item.quantity = quantity
            db.session.add(new_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Producto agregado al carrito exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al agregar producto al carrito'}), 400

@cart_bp.route('/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    """Actualizar la cantidad de un item en el carrito"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('quantity'):
        return jsonify({'message': 'quantity es requerido'}), 400
    
    quantity = int(data['quantity'])
    
    if quantity <= 0:
        return jsonify({'message': 'La cantidad debe ser mayor a 0'}), 400
    
    # Verificar que el item pertenece al carrito del usuario
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        return jsonify({'message': 'Carrito no encontrado'}), 404
    
    cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not cart_item:
        return jsonify({'message': 'Item no encontrado en el carrito'}), 404
    
    # Verificar stock disponible
    if cart_item.product.stock < quantity:
        return jsonify({'message': f'Stock insuficiente. Solo hay {cart_item.product.stock} unidades disponibles'}), 400
    
    try:
        cart_item.quantity = quantity
        db.session.commit()
        
        return jsonify({'message': 'Cantidad actualizada exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar la cantidad'}), 400

@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """Eliminar un item del carrito"""
    current_user_id = get_jwt_identity()
    
    # Verificar que el item pertenece al carrito del usuario
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        return jsonify({'message': 'Carrito no encontrado'}), 404
    
    cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not cart_item:
        return jsonify({'message': 'Item no encontrado en el carrito'}), 404
    
    try:
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Producto eliminado del carrito exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar el producto del carrito'}), 400

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Vaciar todo el carrito"""
    current_user_id = get_jwt_identity()
    
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        return jsonify({'message': 'Carrito no encontrado'}), 404
    
    try:
        # Eliminar todos los items del carrito
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Carrito vaciado exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al vaciar el carrito'}), 400

@cart_bp.route('/item/<int:item_id>', methods=['GET'])
@jwt_required()
def get_cart_item(item_id):
    """Obtener información de un item específico del carrito"""
    current_user_id = get_jwt_identity()
    
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        return jsonify({'message': 'Carrito no encontrado'}), 404
    
    cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not cart_item:
        return jsonify({'message': 'Item no encontrado en el carrito'}), 404
    
    return jsonify(cart_item.serialize()), 200

@cart_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_cart_summary():
    """Obtener resumen del carrito (total, cantidad de items)"""
    current_user_id = get_jwt_identity()
    
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        return jsonify({
            'total': 0,
            'item_count': 0,
            'items': []
        }), 200
    
    cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
    total = sum(item.quantity * item.product.price for item in cart_items if item.product)
    
    return jsonify({
        'total': total,
        'item_count': len(cart_items),
        'items': [item.serialize() for item in cart_items]
    }), 200 