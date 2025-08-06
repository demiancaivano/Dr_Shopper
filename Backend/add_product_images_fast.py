#!/usr/bin/env python3
# add_product_images_fast.py - Script para agregar placeholders rápidos por categoría

from app import create_app, db
from app.models import Product, Category
import random

# Mapeo de categorías a colores para placeholders
CATEGORY_COLORS = {
    'Mobile Phones': ['#FF6B6B', '#FF8E8E', '#FFB3B3'],  # Rojo
    'Laptops': ['#4ECDC4', '#6EE7E0', '#8EF0EA'],        # Turquesa
    'Tablets': ['#45B7D1', '#6BC5D9', '#91D3E1'],        # Azul
    'TVs': ['#96CEB4', '#A8D5BA', '#BADCBF'],            # Verde
    'Headphones': ['#FFEAA7', '#FFF0C4', '#FFF6E1'],      # Amarillo
    'Sound Systems': ['#DDA0DD', '#E6B3E6', '#EEC6EE'],   # Púrpura
    'Cameras': ['#FFB347', '#FFC675', '#FFD9A3'],         # Naranja
    'Gaming': ['#FF69B4', '#FF8CC6', '#FFAFD8'],         # Rosa
    'Smart Home': ['#98D8C8', '#B0E0D6', '#C8E8E4'],     # Verde agua
    'Wearables': ['#F7DC6F', '#F9E497', '#FBECBF'],      # Dorado
    'Accessories': ['#BB8FCE', '#C8A3D3', '#D5B7D8'],    # Lavanda
    'Software': ['#85C1E9', '#A3D1F2', '#C1E1FB']        # Azul claro
}

def get_category_colors(category_name):
    """Obtener colores para una categoría"""
    if category_name in CATEGORY_COLORS:
        return CATEGORY_COLORS[category_name]
    return ['#BDC3C7', '#D5DBDB', '#E8E8E8']  # Gris por defecto

def generate_placeholder_urls(category_name, count=3):
    """Generar URLs de placeholders con colores por categoría"""
    colors = get_category_colors(category_name)
    
    # Imagen principal
    main_color = colors[0]
    main_image = f"https://via.placeholder.com/400x400/{main_color.replace('#', '')}/FFFFFF?text={category_name.replace(' ', '+')}"
    
    # Imágenes adicionales con diferentes colores
    additional_images = []
    for i in range(count - 1):
        color = colors[i + 1] if i + 1 < len(colors) else colors[0]
        img_url = f"https://via.placeholder.com/400x400/{color.replace('#', '')}/FFFFFF?text={category_name.replace(' ', '+')}+{i+2}"
        additional_images.append(img_url)
    
    return main_image, [main_image] + additional_images

def main():
    app = create_app()
    
    with app.app_context():
        print("🖼️  Agregando placeholders rápidos por categoría...")
        
        # Obtener todos los productos
        products = Product.query.all()
        print(f"📦 Total de productos encontrados: {len(products)}")
        
        if len(products) == 0:
            print("❌ No se encontraron productos en la base de datos")
            return
        
        # Actualizar productos con imágenes
        updated_count = 0
        
        for product in products:
            try:
                category_name = product.category.name if product.category else "General"
                main_image, all_images = generate_placeholder_urls(category_name, 3)
                
                # Actualizar imagen principal y array de imágenes
                product.image_url = main_image
                product.images = all_images
                
                updated_count += 1
                print(f"✅ {product.name} - {category_name} - Placeholders agregados")
                
            except Exception as e:
                print(f"❌ Error actualizando {product.name}: {e}")
        
        # Guardar cambios
        try:
            db.session.commit()
            print(f"\n🎉 ¡Éxito! {updated_count} productos actualizados con placeholders")
            print("\n📝 Ejemplos de URLs generadas:")
            sample_product = products[0]
            print(f"  Imagen principal: {sample_product.image_url}")
            print(f"  Todas las imágenes: {sample_product.images}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error guardando en la base de datos: {e}")

if __name__ == "__main__":
    main() 