#!/usr/bin/env python3
# generate_orders_sql.py - Script para generar SQL de órdenes de prueba

from app import create_app
from app.models import Product, User, Address
from datetime import datetime, timedelta
import random

def main():
    app = create_app()
    
    with app.app_context():
        # Verificar que el usuario existe
        user = User.query.filter_by(email='demian.caivano@gmail.com').first()
        if not user:
            print("❌ Usuario demian.caivano@gmail.com no encontrado")
            return
        
        print(f"✅ Usuario encontrado: {user.username} (ID: {user.id})")
        
        # Obtener productos disponibles
        products = Product.query.filter(Product.stock > 0).limit(20).all()
        if len(products) < 6:
            print(f"❌ Solo hay {len(products)} productos disponibles. Se necesitan al menos 6.")
            return
        
        print(f"✅ {len(products)} productos disponibles")
        
        # Obtener direcciones del usuario
        addresses = Address.query.filter_by(user_id=user.id).all()
        if not addresses:
            print("❌ El usuario no tiene direcciones registradas")
            return
        
        print(f"✅ {len(addresses)} direcciones disponibles")
        
        # Generar SQL
        generate_orders_sql(user.id, products, addresses)

def generate_orders_sql(user_id, products, addresses):
    """Generar SQL para insertar órdenes de prueba"""
    
    # Fechas para las órdenes (últimos 30 días)
    base_date = datetime.now()
    dates = [
        base_date - timedelta(days=25),  # pending 1
        base_date - timedelta(days=20),  # pending 2
        base_date - timedelta(days=15),  # shipped 1
        base_date - timedelta(days=10),  # shipped 2
        base_date - timedelta(days=5),   # completed 1
        base_date - timedelta(days=2),   # completed 2
    ]
    
    statuses = ['pending', 'pending', 'shipped', 'shipped', 'completed', 'completed']
    
    print("\n" + "="*60)
    print("📦 SQL PARA INSERTAR ÓRDENES DE PRUEBA")
    print("="*60)
    
    # SQL para órdenes
    print("\n-- Insertar órdenes")
    for i in range(6):
        order_id = 100 + i  # IDs únicos para evitar conflictos
        status = statuses[i]
        order_date = dates[i]
        address = random.choice(addresses)
        
        # Seleccionar productos aleatorios para esta orden
        order_products = random.sample(products, random.randint(1, 3))
        total_amount = sum(p.price * random.randint(1, 3) for p in order_products)
        
        print(f"""
-- Orden {i+1} ({status})
INSERT INTO "order" (id, user_id, creation_date, total_amount, status, address_id) VALUES 
({order_id}, {user_id}, '{order_date.isoformat()}', {total_amount:.2f}, '{status}', {address.id});""")
        
        # SQL para items de la orden
        print(f"\n-- Items de la orden {order_id}")
        for j, product in enumerate(order_products):
            quantity = random.randint(1, 3)
            item_id = 1000 + (order_id * 10) + j
            print(f"INSERT INTO order_item (id, order_id, product_id, quantity, price) VALUES ({item_id}, {order_id}, {product.id}, {quantity}, {product.price:.2f});")
    
    print("\n" + "="*60)
    print("✅ SQL generado exitosamente")
    print("📝 Instrucciones:")
    print("1. Copia y pega el SQL en pgAdmin")
    print("2. Ejecuta las consultas en orden")
    print("3. Verifica que las órdenes aparezcan en /my-orders")
    print("="*60)

if __name__ == "__main__":
    main() 