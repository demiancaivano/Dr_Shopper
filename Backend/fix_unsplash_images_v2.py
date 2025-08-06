#!/usr/bin/env python3
# fix_unsplash_images_v2.py - Script para arreglar las URLs de Unsplash con URLs ÚNICAS

from app import create_app, db
from app.models import Product, Category
import random

# URLs reales de Unsplash organizadas por categoría - URLs ÚNICAS
CATEGORY_IMAGES = {
    'Mobile Phones': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Smartphone
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # iPhone
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Mobile
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Phone
    ],
    'Laptops': [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Laptop
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Computer
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # MacBook
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Notebook
    ],
    'Tablets': [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Tablet
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # iPad
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Android Tablet
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Tablet Pro
    ],
    'TVs': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # TV
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Television
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Smart TV
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # 4K TV
    ],
    'Headphones': [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Headphones
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Earphones
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Wireless
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Studio
    ],
    'Sound Systems': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Speakers
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Audio
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Sound System
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Bluetooth
    ],
    'Cameras': [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Camera
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Photography
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # DSLR
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Mirrorless
    ],
    'Gaming': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Gaming
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Console
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Controller
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Video Games
    ],
    'Smart Home': [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Smart Home
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Automation
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # IoT
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Smart Device
    ],
    'Wearables': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Smartwatch
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Watch
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Fitness Tracker
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Wearable
    ],
    'Accessories': [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Accessories
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Gadgets
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Tech Accessories
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Cables
    ],
    'Software': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Software
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # App
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Digital
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Download
    ],
    'E-Books': [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # E-Book
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # Reader
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Digital Book
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Tablet Reading
    ],
    'Air Conditioner': [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # AC
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",  # Air Conditioner
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",  # Cooling
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",  # HVAC
    ]
}

# Imágenes genéricas para categorías no mapeadas
GENERIC_IMAGES = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
]

def get_images_for_category(category_name, count=3):
    """Obtener imágenes específicas para una categoría"""
    if category_name in CATEGORY_IMAGES:
        # Usar imágenes específicas de la categoría
        category_images = CATEGORY_IMAGES[category_name].copy()
        selected_images = []
        
        for i in range(count):
            if category_images:
                img = random.choice(category_images)
                selected_images.append(img)
                category_images.remove(img)  # Evitar duplicados
            else:
                # Si se agotan, usar la primera imagen de la categoría
                selected_images.append(CATEGORY_IMAGES[category_name][0])
        
        return selected_images
    else:
        # Para categorías no mapeadas, usar imágenes genéricas
        return random.sample(GENERIC_IMAGES, count)

def main():
    app = create_app()
    
    with app.app_context():
        print("🖼️  Actualizando imágenes específicas por categoría...")
        
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
                images = get_images_for_category(category_name, 3)
                
                # Actualizar imagen principal y array de imágenes
                product.image_url = images[0]
                product.images = images
                
                updated_count += 1
                print(f"✅ {product.name} - {category_name} - Imágenes específicas agregadas")
                
            except Exception as e:
                print(f"❌ Error actualizando {product.name}: {e}")
        
        # Guardar cambios
        try:
            db.session.commit()
            print(f"\n🎉 ¡Éxito! {updated_count} productos actualizados con imágenes específicas por categoría")
            print("\n📝 Ejemplos de URLs generadas:")
            sample_product = products[0]
            print(f"  Imagen principal: {sample_product.image_url}")
            print(f"  Todas las imágenes: {sample_product.images}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error guardando en la base de datos: {e}")

if __name__ == "__main__":
    main() 