#!/usr/bin/env python3
# test_images.py - Script para probar URLs de imágenes

import requests

def test_image_url(url):
    try:
        response = requests.get(url, timeout=10)
        print(f"✅ {url}")
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type')}")
        print(f"   Size: {len(response.content)} bytes")
        return True
    except Exception as e:
        print(f"❌ {url}")
        print(f"   Error: {e}")
        return False

def main():
    print("🧪 Probando URLs de imágenes...")
    
    # URLs de ejemplo de nuestros productos
    test_urls = [
        "https://picsum.photos/400/400?random=160",
        "https://picsum.photos/400/400?random=613", 
        "https://picsum.photos/400/400?random=650"
    ]
    
    success_count = 0
    for url in test_urls:
        if test_image_url(url):
            success_count += 1
        print()
    
    print(f"📊 Resultado: {success_count}/{len(test_urls)} URLs funcionan correctamente")

if __name__ == "__main__":
    main() 