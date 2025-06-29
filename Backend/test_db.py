#!/usr/bin/env python3
# test_db.py - Script para probar la conexión a la base de datos

from app import create_app, db

def test_database_connection():
    try:
        app = create_app()
        with app.app_context():
            print("✅ Aplicación Flask creada correctamente")
            print(f"📊 URL de la base de datos: {db.engine.url}")
            
            # Intentar conectar a la base de datos
            db.engine.connect()
            print("✅ Conexión a la base de datos exitosa")
            
            # Verificar si las tablas existen
            from app.models import User
            print("✅ Modelo User importado correctamente")
            
            # Intentar crear las tablas si no existen
            db.create_all()
            print("✅ Tablas creadas/verificadas correctamente")
            
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"🔍 Tipo de error: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("🧪 Probando conexión a la base de datos...")
    success = test_database_connection()
    if success:
        print("🎉 Todo está funcionando correctamente!")
    else:
        print("💥 Hay un problema con la configuración") 