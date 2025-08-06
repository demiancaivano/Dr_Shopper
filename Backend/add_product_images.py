#!/usr/bin/env python3
# add_product_images.py - Script para agregar imágenes a productos existentes

from app import create_app, db
from app.models import Product, Category
import random
import requests
import time

# Unsplash API - Gratuito hasta 1000 requests/hora
UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY"  # Opcional, funciona sin key también

# Mapeo de categorías a términos de búsqueda de Unsplash
CATEGORY_KEYWORDS = {
    'Mobile Phones': ['smartphone', 'mobile phone', 'iphone', 'android phone'],
    'Laptops': ['laptop', 'computer', 'notebook', 'macbook'],
    'Tablets': ['tablet', 'ipad', 'android tablet'],
    'TVs': ['television', 'smart tv', '4k tv', 'led tv'],
    'Headphones': ['headphones', 'wireless headphones', 'earphones'],
    'Sound Systems': ['speakers', 'sound system', 'audio', 'bluetooth speaker'],
    'Cameras': ['camera', 'photography', 'dslr', 'mirrorless'],
    'Gaming': ['gaming', 'video games', 'console', 'controller'],
    'Smart Home': ['smart home', 'automation', 'iot', 'smart device'],
    'Wearables': ['smartwatch', 'fitness tracker', 'wearable'],
    'Accessories': ['accessories', 'gadgets', 'tech accessories'],
    'Software': ['software', 'app', 'digital', 'download']
}

def get_category_keyword(category_name):
    """Obtener palabra clave para una categoría"""
    if category_name in CATEGORY_KEYWORDS:
        return random.choice(CATEGORY_KEYWORDS[category_name])
    return 'technology'  # término genérico para tecnología

def get_unsplash_image_url(keyword, width=400, height=400):
    """Obtener URL de imagen de Unsplash por keyword"""
    try:
        # Usar Unsplash Source API (gratuito, sin key)
        url = f"https://source.unsplash.com/{width}x{height}/?{keyword}"
        
        # Hacer request para obtener la URL final
        response = requests.get(url, allow_redirects=True, timeout=10)
        if response.status_code == 200:
            return response.url
        else:
            # Fallback a Lorem Picsum si falla
            return f"https://picsum.photos/{width}/{height}?random={random.randint(1, 1000)}"
    except:
        # Fallback a Lorem Picsum si hay error
        return f"https://picsum.photos/{width}/{height}?random={random.randint(1, 1000)}"

def generate_image_urls(category_name, count=3):
    """Generar URLs de imágenes para una categoría usando Unsplash"""
    keyword = get_category_keyword(category_name)
    
    # Imagen principal
    main_image = get_unsplash_image_url(keyword, 400, 400)
    
    # Imágenes adicionales con diferentes keywords para variedad
    additional_images = []
    for i in range(count - 1):
        # Usar keyword ligeramente diferente para variedad
        alt_keyword = f"{keyword} {random.choice(['new', 'modern', 'latest', 'best'])}"
        img_url = get_unsplash_image_url(alt_keyword, 400, 400)
        additional_images.append(img_url)
        time.sleep(0.1)  # Pequeña pausa para no sobrecargar la API
    
    return main_image, [main_image] + additional_images

def main():
    app = create_app()
    
    with app.app_context():
        print("🖼️  Agregando imágenes relevantes a productos...")
        
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
                print(f"✅ {product.name} - {category_name} - Imágenes relevantes agregadas")
                
                # Pausa entre productos para no sobrecargar la API
                time.sleep(0.5)
                
            except Exception as e:
                print(f"❌ Error actualizando {product.name}: {e}")
        
        # Guardar cambios
        try:
            db.session.commit()
            print(f"\n🎉 ¡Éxito! {updated_count} productos actualizados con imágenes relevantes")
            print("\n📝 Ejemplos de URLs generadas:")
            sample_product = products[0]
            print(f"  Imagen principal: {sample_product.image_url}")
            print(f"  Todas las imágenes: {sample_product.images}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error guardando en la base de datos: {e}")

if __name__ == "__main__":
    main()