#!/usr/bin/env python3
# view_products.py - Script simple para ver productos actuales

from app import create_app
from app.models import Product

def main():
    app = create_app()
    
    with app.app_context():
        products = Product.query.all()
        print(f"Total products: {len(products)}")
        
        if len(products) == 0:
            print("No products found in database")
            return
            
        print("\nProducts:")
        for p in products[:10]:  # Show first 10
            category_name = p.category.name if p.category else "No category"
            print(f"{p.id}: {p.name}")
            print(f"  Category: {category_name}")
            print(f"  Current image_url: {p.image_url or 'None'}")
            print(f"  Current images: {p.images or 'None'}")
            print()
        
        if len(products) > 10:
            print(f"... and {len(products) - 10} more products")

if __name__ == "__main__":
    main()