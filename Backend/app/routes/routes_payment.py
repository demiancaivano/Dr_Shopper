from flask import Blueprint, request, jsonify
from app.models import Payment, Order
from app import db # type: ignore
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from datetime import datetime

payment_bp = Blueprint('payment_bp', __name__)

# ==================== RUTAS DE PAGOS ====================

@payment_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_payment(order_id):
    """Obtener información de pago de una orden"""
    current_user_id = get_jwt_identity()
    
    # Verificar que la orden pertenece al usuario
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    payment = Payment.query.filter_by(order_id=order_id).first()
    if not payment:
        return jsonify({'message': 'Pago no encontrado para esta orden'}), 404
    
    return jsonify(payment.serialize()), 200

@payment_bp.route('/<int:order_id>', methods=['POST'])
@jwt_required()
def create_payment(order_id):
    """Crear un pago para una orden"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verificar que la orden pertenece al usuario
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    # Verificar que la orden no tenga ya un pago
    existing_payment = Payment.query.filter_by(order_id=order_id).first()
    if existing_payment:
        return jsonify({'message': 'Ya existe un pago para esta orden'}), 400
    
    if not data.get('payment_method'):
        return jsonify({'message': 'payment_method es requerido'}), 400
    
    valid_methods = ['stripe', 'paypal', 'credit_card', 'debit_card', 'bank_transfer']
    if data['payment_method'] not in valid_methods:
        return jsonify({'message': f'Método de pago inválido. Métodos válidos: {", ".join(valid_methods)}'}), 400
    
    try:
        new_payment = Payment()
        new_payment.order_id = order_id
        new_payment.amount = order.total_amount
        new_payment.payment_method = data['payment_method']
        new_payment.status = 'pending'
        new_payment.transaction_id = data.get('transaction_id', '')
        
        db.session.add(new_payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Pago creado exitosamente',
            'payment': new_payment.serialize()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al crear el pago'}), 400

@payment_bp.route('/<int:order_id>/process', methods=['PUT'])
@jwt_required()
def process_payment(order_id):
    """Procesar un pago (simulación de procesamiento)"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verificar que la orden pertenece al usuario
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({'message': 'Orden no encontrada'}), 404
    
    payment = Payment.query.filter_by(order_id=order_id).first()
    if not payment:
        return jsonify({'message': 'Pago no encontrado para esta orden'}), 404
    
    if payment.status != 'pending':
        return jsonify({'message': 'El pago ya ha sido procesado'}), 400
    
    # Simular procesamiento de pago
    # En un entorno real, aquí se integraría con Stripe, PayPal, etc.
    try:
        # Simular éxito del pago (90% de éxito)
        import random
        if random.random() < 0.9:
            payment.status = 'completed'
            payment.payment_date = datetime.utcnow()
            order.status = 'processing'  # Actualizar estado de la orden
        else:
            payment.status = 'failed'
        
        db.session.commit()
        
        if payment.status == 'completed':
            return jsonify({
                'message': 'Pago procesado exitosamente',
                'payment': payment.serialize()
            }), 200
        else:
            return jsonify({
                'message': 'El pago falló. Intente nuevamente.',
                'payment': payment.serialize()
            }), 400
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al procesar el pago'}), 400

@payment_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_payment_status(order_id):
    """Actualizar el estado de un pago (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    payment = Payment.query.filter_by(order_id=order_id).first()
    if not payment:
        return jsonify({'message': 'Pago no encontrado'}), 404
    
    data = request.get_json()
    if not data.get('status'):
        return jsonify({'message': 'status es requerido'}), 400
    
    valid_statuses = ['pending', 'completed', 'failed', 'refunded']
    if data['status'] not in valid_statuses:
        return jsonify({'message': f'Estado inválido. Estados válidos: {", ".join(valid_statuses)}'}), 400
    
    try:
        payment.status = data['status']
        if data['status'] == 'completed' and not payment.payment_date:
            payment.payment_date = datetime.utcnow()
        
        # Actualizar estado de la orden si es necesario
        order = Order.query.get(order_id)
        if order:
            if data['status'] == 'completed' and order.status == 'pending':
                order.status = 'processing'
            elif data['status'] == 'refunded':
                order.status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Estado del pago actualizado exitosamente',
            'payment': payment.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el estado del pago'}), 400

@payment_bp.route('/<int:order_id>/refund', methods=['POST'])
@jwt_required()
def refund_payment(order_id):
    """Reembolsar un pago (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    payment = Payment.query.filter_by(order_id=order_id).first()
    if not payment:
        return jsonify({'message': 'Pago no encontrado'}), 404
    
    if payment.status != 'completed':
        return jsonify({'message': 'Solo se pueden reembolsar pagos completados'}), 400
    
    try:
        payment.status = 'refunded'
        
        # Actualizar estado de la orden
        order = Order.query.get(order_id)
        if order:
            order.status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Pago reembolsado exitosamente',
            'payment': payment.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al reembolsar el pago'}), 400

@payment_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def get_all_payments():
    """Obtener todos los pagos (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', '')
    
    query = Payment.query
    
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.creation_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'payments': [payment.serialize() for payment in payments.items],
        'total': payments.total,
        'pages': payments.pages,
        'current_page': page
    }), 200

@payment_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_payment_stats():
    """Obtener estadísticas de pagos (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    from sqlalchemy import func
    
    # Estadísticas por estado
    status_stats = db.session.query(
        Payment.status,
        func.count(Payment.id).label('count'),
        func.sum(Payment.amount).label('total_amount')
    ).group_by(Payment.status).all()
    
    # Estadísticas por método de pago
    method_stats = db.session.query(
        Payment.payment_method,
        func.count(Payment.id).label('count'),
        func.sum(Payment.amount).label('total_amount')
    ).group_by(Payment.payment_method).all()
    
    # Total general
    total_payments = Payment.query.count()
    total_amount = db.session.query(func.sum(Payment.amount)).scalar() or 0
    
    return jsonify({
        'total_payments': total_payments,
        'total_amount': float(total_amount),
        'status_stats': [
            {
                'status': stat.status,
                'count': stat.count,
                'total_amount': float(stat.total_amount or 0)
            } for stat in status_stats
        ],
        'method_stats': [
            {
                'method': stat.payment_method,
                'count': stat.count,
                'total_amount': float(stat.total_amount or 0)
            } for stat in method_stats
        ]
    }), 200 