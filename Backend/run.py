# run.py
# Este archivo sirve para arrancar la aplicación Flask.
# Importa la función create_app desde app/__init__.py y ejecuta la app.

from app import create_app, db
from flask_migrate import upgrade

# Creamos la instancia de la app Flask
app = create_app()

# Función para ejecutar migraciones automáticamente en producción
def run_migrations():
    with app.app_context():
        try:
            upgrade()
            print("✅ Migraciones aplicadas exitosamente")
        except Exception as e:
            print(f"⚠️ Error en migraciones: {e}")

if __name__ == '__main__':
    # En producción, ejecutar migraciones automáticamente
    if app.config.get('FLASK_ENV') == 'production':
        run_migrations()
    
    # Ejecuta la app
    app.run(debug=True, host='0.0.0.0', port=5000)
