# run.py
# Este archivo sirve para arrancar la aplicación Flask.
# Importa la función create_app desde app/__init__.py y ejecuta la app.

from app import create_app

# Creamos la instancia de la app Flask
app = create_app()

if __name__ == '__main__':
    # Ejecuta la app en modo debug (útil para desarrollo)
    app.run(debug=True)
