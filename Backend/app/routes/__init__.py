# Importamos todos los blueprints
from .routes_user import user_bp
from .routes_product import product_bp
from .routes_cart import cart_bp
from .routes_order import order_bp
from .routes_payment import payment_bp
from .routes_address import address_bp
from ..auth import auth

def register_blueprints(app):
    app.register_blueprint(auth, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(address_bp, url_prefix='/api/addresses') 