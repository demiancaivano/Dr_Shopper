#!/usr/bin/env python3
# add_product_images_simple.py - Script simple para agregar imágenes usando Unsplash Source

from app import create_app, db
from app.models import Product, Category
import random
import requests
import time

# Mapeo de categorías a términos de búsqueda simples
CATEGORY_KEYWORDS = {
    'Mobile Phones': ['phone', 'smartphone', 'mobile'],
    'Laptops': ['laptop', 'computer', 'macbook'],
    'Tablets': ['tablet', 'ipad'],
    'TVs': ['tv', 'television', 'smart tv'],
    'Headphones': ['headphones', 'earphones'],
    'Sound Systems': ['speakers', 'audio'],
    'Cameras': ['camera', 'photography'],
    'Gaming': ['gaming', 'console'],
    'Smart Home': ['smart home', 'automation'],
    'Wearables': ['smartwatch', 'watch'],
    'Accessories': ['accessories', 'gadgets'],
    'Software': ['software', 'app']
}

def get_category_keyword(category_name):
    """Obtener palabra clave para una categoría"""
    if category_name in CATEGORY_KEYWORDS:
        return random.choice(CATEGORY_KEYWORDS[category_name])
    return 'technology'

def get_unsplash_image(keyword):
    """Obtener imagen de Unsplash Source de forma simple"""
    try:
        # Usar Unsplash Source con parámetros simples
        url = f"https://source.unsplash.com/400x400/?{keyword}"
        
        # Hacer request para obtener la URL final
        response = requests.get(url, timeout=15, allow_redirects=True)
        
        if response.status_code == 200:
            return response.url
        else:
            # Si falla, usar una imagen genérica de Unsplash
            return f"https://images.unsplash.com/photo-{random.randint(1000000000, 9999999999)}?w=400&h=400&fit=crop"
            
    except Exception as e:
        print(f"Error obteniendo imagen para '{keyword}': {e}")
        # Fallback a imagen genérica
        return f"https://images.unsplash.com/photo-{random.randint(1000000000, 9999999999)}?w=400&h=400&fit=crop"

def generate_image_urls(category_name, count=3):
    """Generar URLs de imágenes para una categoría"""
    keyword = get_category_keyword(category_name)
    
    # Imagen principal
    main_image = get_unsplash_image(keyword)
    
    # Imágenes adicionales con diferentes keywords
    additional_images = []
    for i in range(count - 1):
        # Usar keyword ligeramente diferente
        alt_keyword = f"{keyword} {random.choice(['new', 'modern', 'latest'])}"
        img_url = get_unsplash_image(alt_keyword)
        additional_images.append(img_url)
        time.sleep(0.3)  # Pausa para no sobrecargar
    
    return main_image, [main_image] + additional_images

def main():
    app = create_app()
    
    with app.app_context():
        print("🖼️  Agregando imágenes usando Unsplash Source...")
        
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
                main_image, all_images = generate_image_urls(category_name, 3)
                
                # Actualizar imagen principal y array de imágenes
                product.image_url = main_image
                product.images = all_images
                
                updated_count += 1
                print(f"✅ {product.name} - {category_name} - Imágenes agregadas")
                
                # Pausa entre productos
                time.sleep(0.5)
                
            except Exception as e:
                print(f"❌ Error actualizando {product.name}: {e}")
        
        # Guardar cambios
        try:
            db.session.commit()
            print(f"\n🎉 ¡Éxito! {updated_count} productos actualizados")
            print("\n📝 Ejemplos de URLs generadas:")
            sample_product = products[0]
            print(f"  Imagen principal: {sample_product.image_url}")
            print(f"  Todas las imágenes: {sample_product.images}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error guardando en la base de datos: {e}")

if __name__ == "__main__":
    main() 