from flask import Blueprint, request, jsonify
from app.models import Order, OrderItem, Cart, CartItem, Address, Product
from app import db # type: ignore
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from datetime import datetime

order_bp = Blueprint('order_bp', __name__)

# ==================== RUTAS DE ÓRDENES ====================

@order_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    """Obtener todas las órdenes del usuario"""
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    orders = Order.query.filter_by(user_id=current_user_id).order_by(Order.creation_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'orders': [order.serialize() for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    }), 200

@order_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Obtener una orden específica del usuario"""
    current_user_id = get_jwt_identity()
    
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    # Obtener los items de la orden
    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    
    order_data = order.serialize()
    order_data['items'] = [item.serialize() for item in order_items]
    
    return jsonify(order_data), 200

@order_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """Crear una nueva orden desde el carrito"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('address_id'):
        return jsonify({'message': 'address_id es requerido'}), 400
    
    # Verificar que la dirección pertenece al usuario
    address = Address.query.filter_by(id=data['address_id'], user_id=current_user_id).first()
    if not address:
        return jsonify({'message': 'Dirección no encontrada'}), 404
    
    # Obtener el carrito activo del usuario
    cart = Cart.query.filter_by(user_id=current_user_id, is_active=True).first()
    if not cart:
        return jsonify({'message': 'No hay productos en el carrito'}), 400
    
    cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
    if not cart_items:
        return jsonify({'message': 'No hay productos en el carrito'}), 400
    
    # Verificar stock de todos los productos
    for item in cart_items:
        if item.product.stock < item.quantity:
            return jsonify({
                'message': f'Stock insuficiente para {item.product.name}. Solo hay {item.product.stock} unidades disponibles'
            }), 400
    
    try:
        # Calcular total de la orden
        total_amount = sum(item.quantity * item.product.price for item in cart_items)
        
        # Crear la orden
        new_order = Order()
        new_order.user_id = current_user_id
        new_order.total_amount = total_amount
        new_order.status = 'pending'
        new_order.address_id = data['address_id']
        
        db.session.add(new_order)
        db.session.flush()  # Para obtener el ID de la orden
        
        # Crear los items de la orden
        for cart_item in cart_items:
            order_item = OrderItem()
            order_item.order_id = new_order.id
            order_item.product_id = cart_item.product_id
            order_item.quantity = cart_item.quantity
            order_item.price = cart_item.product.price
            
            db.session.add(order_item)
            
            # Actualizar stock del producto
            cart_item.product.stock -= cart_item.quantity
        
        # Desactivar el carrito actual
        cart.is_active = False
        
        db.session.commit()
        
        return jsonify({
            'message': 'Orden creada exitosamente',
            'order': new_order.serialize()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al crear la orden'}), 400

@order_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """Actualizar el estado de una orden (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    data = request.get_json()
    if not data.get('status'):
        return jsonify({'message': 'status es requerido'}), 400
    
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'message': f'Estado inválido. Estados válidos: {", ".join(valid_statuses)}'}), 400
    
    try:
        order.status = data['status']
        db.session.commit()
        
        return jsonify({
            'message': 'Estado de la orden actualizado exitosamente',
            'order': order.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el estado de la orden'}), 400

@order_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    """Cancelar una orden (solo si está pendiente)"""
    current_user_id = get_jwt_identity()
    
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    if order.status != 'pending':
        return jsonify({'message': 'Solo se pueden cancelar órdenes pendientes'}), 400
    
    try:
        order.status = 'cancelled'
        
        # Restaurar stock de los productos
        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        for item in order_items:
            item.product.stock += item.quantity
        
        db.session.commit()
        
        return jsonify({'message': 'Orden cancelada exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al cancelar la orden'}), 400

@order_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def get_all_orders():
    """Obtener todas las órdenes (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', '')
    
    query = Order.query
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.creation_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'orders': [order.serialize() for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    }), 200

@order_bp.route('/admin/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_admin(order_id):
    """Obtener una orden específica (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    # Obtener los items de la orden
    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    
    order_data = order.serialize()
    order_data['items'] = [item.serialize() for item in order_items]
    
    return jsonify(order_data), 200 