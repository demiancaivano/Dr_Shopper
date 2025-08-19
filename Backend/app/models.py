# models.py
# Aquí definimos los modelos de la base de datos usando SQLAlchemy.
# Un modelo representa una tabla en la base de datos.

from . import db  # Importamos la instancia de SQLAlchemy creada en __init__.py
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import validates
from sqlalchemy import CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY

# Definimos el modelo User, que representa la tabla 'user' en la base de datos
class User(db.Model):
    __tablename__ = 'user'  # Nombre de la tabla en la base de datos

    # Columnas de la tabla
    id = db.Column(db.Integer, primary_key=True)  # ID único, clave primaria
    username = db.Column(db.String(64), unique=True, nullable=False)  # Nombre de usuario, único y obligatorio
    email = db.Column(db.String(120), unique=True, nullable=False)    # Email, único y obligatorio
    password = db.Column(db.String(512), nullable=False)
    creation_date = db.Column(db.DateTime, server_default=func.now())             # Contraseña (encriptada), obligatoria
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_verification_token = db.Column(db.String(128), nullable=True)
    reset_password_token = db.Column(db.String(128), nullable=True)
    reset_password_token_expiration = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        # Representación legible del usuario (útil para debug)
        return f'<User {self.username}>'

    def serialize(self):
        
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'creation_date': self.creation_date.isoformat(),
            'is_admin': self.is_admin,
            'email_verified': self.email_verified
        }

class Category(db.Model):
    __tablename__ = 'category'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    creation_date = db.Column(db.DateTime, server_default=func.now())
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)  # Cambiado a nullable=True y renombrado
    
    # Relación para subcategorías
    subcategories = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))

    def __repr__(self):
        return f'<Category {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creation_date': self.creation_date.isoformat(),
            'parent_id': self.parent_id,
            'has_subcategories': len(self.subcategories) > 0
        }

class Brand(db.Model):
    __tablename__ = 'brand'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    creation_date = db.Column(db.DateTime, server_default=func.now())

    def __repr__(self):
        return f'<Brand {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'logo_url': self.logo_url,
            'website': self.website,
            'creation_date': self.creation_date.isoformat()
        }

class Product(db.Model):
    __tablename__ = 'product'
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_positive'),
        CheckConstraint('stock >= 0', name='check_stock_positive'),
        CheckConstraint('discount_percentage >= 0 AND discount_percentage <= 100', name='check_discount_percentage'),
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    images = db.Column(ARRAY(db.String), nullable=True)
    creation_date = db.Column(db.DateTime, server_default=func.now())
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    category = db.relationship('Category', backref=db.backref('products', lazy=True))
    brand_id = db.Column(db.Integer, db.ForeignKey('brand.id'), nullable=True)
    brand = db.relationship('Brand', backref=db.backref('products', lazy=True))
    discount_percentage = db.Column(db.Float, default=0.0)  # Porcentaje de descuento (0-100)
    is_active = db.Column(db.Boolean, default=True)  # Si el producto está activo para venta

    @validates('price', 'stock')
    def validate_positive(self, key, value):
        if value < 0:
            raise ValueError(f"{key} no puede ser negativo")
        return value

    @validates('discount_percentage')
    def validate_discount(self, key, value):
        if value < 0 or value > 100:
            raise ValueError("El descuento debe estar entre 0 y 100")
        return value

    @property
    def final_price(self):
        """Precio final después del descuento"""
        if self.discount_percentage > 0:
            return self.price * (1 - self.discount_percentage / 100)
        return self.price

    @property
    def has_discount(self):
        """Verificar si el producto tiene descuento"""
        return self.discount_percentage > 0

    def __repr__(self):
        return f'<Product {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'final_price': self.final_price,
            'has_discount': self.has_discount,
            'discount_percentage': self.discount_percentage,
            'stock': self.stock,
            'image_url': self.image_url,
            'images': self.images,
            'creation_date': self.creation_date.isoformat() if self.creation_date else None,
            'category_id': self.category_id,
            'category': self.category.name if self.category else None,
            'brand_id': self.brand_id,
            'brand': self.brand.name if self.brand else None,
            'is_active': self.is_active
        }

class Review(db.Model):
    __tablename__ = 'review'
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('reviews', lazy=True))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    product = db.relationship('Product', backref=db.backref('reviews', lazy=True))
    rating = db.Column(db.Integer, nullable=False)  # 1-5 estrellas
    title = db.Column(db.String(200), nullable=True)
    comment = db.Column(db.Text, nullable=True)
    creation_date = db.Column(db.DateTime, server_default=func.now())
    is_verified_purchase = db.Column(db.Boolean, default=False)  # Si el usuario compró el producto
    is_helpful = db.Column(db.Integer, default=0)  # Contador de "útil"

    @validates('rating')
    def validate_rating(self, key, value):
        if value < 1 or value > 5:
            raise ValueError("El rating debe estar entre 1 y 5")
        return value

    def __repr__(self):
        return f'<Review {self.id} - Rating: {self.rating}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else None,
            'product_id': self.product_id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'creation_date': self.creation_date.isoformat(),
            'is_verified_purchase': self.is_verified_purchase,
            'is_helpful': self.is_helpful
        }

class Discount(db.Model):
    __tablename__ = 'discount'
    __table_args__ = (
        CheckConstraint('discount_percentage >= 0 AND discount_percentage <= 100', name='check_discount_percentage'),
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    discount_percentage = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    creation_date = db.Column(db.DateTime, server_default=func.now())
    
    # Relaciones opcionales para aplicar descuentos específicos
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    category = db.relationship('Category', backref=db.backref('discounts', lazy=True))
    brand_id = db.Column(db.Integer, db.ForeignKey('brand.id'), nullable=True)
    brand = db.relationship('Brand', backref=db.backref('discounts', lazy=True))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    product = db.relationship('Product', backref=db.backref('discounts', lazy=True))

    @validates('discount_percentage')
    def validate_discount(self, key, value):
        if value < 0 or value > 100:
            raise ValueError("El descuento debe estar entre 0 y 100")
        return value

    @validates('start_date', 'end_date')
    def validate_dates(self, key, value):
        if key == 'end_date' and hasattr(self, 'start_date') and value <= self.start_date:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")
        return value

    @property
    def is_currently_active(self):
        """Verificar si el descuento está actualmente activo"""
        now = datetime.utcnow()
        return (self.is_active and 
                self.start_date <= now <= self.end_date)

    def __repr__(self):
        return f'<Discount {self.name} - {self.discount_percentage}%>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'discount_percentage': self.discount_percentage,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'is_active': self.is_active,
            'is_currently_active': self.is_currently_active,
            'creation_date': self.creation_date.isoformat(),
            'category_id': self.category_id,
            'brand_id': self.brand_id,
            'product_id': self.product_id
        }

class Cart(db.Model):
    __tablename__ = 'cart'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('carts', lazy=True))
    creation_date = db.Column(db.DateTime, server_default=func.now())
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<Cart {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'creation_date': self.creation_date.isoformat(),
            'is_active': self.is_active
        }

class CartItem(db.Model):
    __tablename__ = 'cart_item'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)
    cart = db.relationship('Cart', backref=db.backref('items', lazy=True))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    product = db.relationship('Product', backref=db.backref('cart_items', lazy=True))
    quantity = db.Column(db.Integer, nullable=False, default=1)
    creation_date = db.Column(db.DateTime, server_default=func.now())

    @validates('quantity')
    def validate_quantity(self, key, value):
        if value < 1:
            raise ValueError("Quantity must be at least 1")
        return value

    def __repr__(self):
        return f'<CartItem {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'creation_date': self.creation_date.isoformat(),
            'product': self.product.serialize() if self.product else None
        }

class Address(db.Model):
    __tablename__ = 'address'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('addresses', lazy=True))
    street = db.Column(db.String(128), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(64), nullable=True)
    zip_code = db.Column(db.String(20), nullable=True)
    country = db.Column(db.String(64), nullable=False)
    extra_info = db.Column(db.String(128), nullable=True)
    is_default = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Address {self.street}, {self.city}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'street': self.street,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'country': self.country,
            'extra_info': self.extra_info,
            'is_default': self.is_default
        }

class Order(db.Model):
    __tablename__ = 'order'
    __table_args__ = (
        CheckConstraint('total_amount >= 0', name='check_total_amount_positive'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('orders', lazy=True))
    creation_date = db.Column(db.DateTime, server_default=func.now())
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    address_id = db.Column(db.Integer, db.ForeignKey('address.id'), nullable=False)
    address = db.relationship('Address')

    def __repr__(self):
        return f'<Order {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'creation_date': self.creation_date.isoformat(),
            'total_amount': self.total_amount,
            'status': self.status,
            'address_id': self.address_id,
            'address': self.address.serialize() if self.address else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_item'
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_positive'),
    )

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    order = db.relationship('Order', backref=db.backref('items', lazy=True))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    product = db.relationship('Product', backref=db.backref('order_items', lazy=True))
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)
    creation_date = db.Column(db.DateTime, server_default=func.now())

    @validates('quantity')
    def validate_quantity(self, key, value):
        if value < 1:
            raise ValueError("Quantity must be at least 1")
        return value

    @validates('price')
    def validate_price(self, key, value):
        if value < 0:
            raise ValueError("Price must be non-negative")
        return value

    def __repr__(self):
        return f'<OrderItem {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'price': self.price,
            'creation_date': self.creation_date.isoformat(),
            'product': self.product.serialize() if self.product else None
        }

class Payment(db.Model):
    __tablename__ = 'payment'
    __table_args__ = (
        CheckConstraint('amount >= 0', name='check_amount_positive'),
    )

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False, unique=True)
    order = db.relationship('Order', backref=db.backref('payment', uselist=False))
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # e.g. 'stripe'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'completed', 'failed', 'refunded'
    transaction_id = db.Column(db.String(255), nullable=True)  # Stripe payment intent ID
    creation_date = db.Column(db.DateTime, server_default=func.now())
    payment_date = db.Column(db.DateTime, nullable=True)

    @validates('amount')
    def validate_amount(self, key, value):
        if value < 0:
            raise ValueError("Amount must be non-negative")
        return value

    def __repr__(self):
        return f'<Payment {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'status': self.status,
            'transaction_id': self.transaction_id,
            'creation_date': self.creation_date.isoformat(),
            'payment_date': self.payment_date.isoformat() if self.payment_date else None
        }

class ReviewLike(db.Model):
    __tablename__ = 'review_like'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('review_likes', lazy=True))
    review_id = db.Column(db.Integer, db.ForeignKey('review.id'), nullable=False)
    review = db.relationship('Review', backref=db.backref('likes', lazy=True))
    creation_date = db.Column(db.DateTime, server_default=func.now())
    
    # Asegurar que un usuario solo puede dar like una vez por review
    __table_args__ = (db.UniqueConstraint('user_id', 'review_id', name='unique_user_review_like'),)
    
    def __repr__(self):
        return f'<ReviewLike {self.user_id} -> {self.review_id}>'
    
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'review_id': self.review_id,
            'creation_date': self.creation_date.isoformat()
        }
