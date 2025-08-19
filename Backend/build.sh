#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
pip install -r requirements.txt

# Ejecutar migraciones automáticamente
echo "🗄️ Ejecutando migraciones de base de datos..."
python -c "
from app import create_app, db
from flask_migrate import upgrade

app = create_app()
with app.app_context():
    try:
        upgrade()
        print('✅ Migraciones aplicadas exitosamente')
    except Exception as e:
        print(f'⚠️ Error en migraciones: {e}')
"

echo "✅ Build completado!"
