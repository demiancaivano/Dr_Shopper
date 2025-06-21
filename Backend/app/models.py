# models.py
# Aquí definimos los modelos de la base de datos usando SQLAlchemy.
# Un modelo representa una tabla en la base de datos.

from . import db  # Importamos la instancia de SQLAlchemy creada en __init__.py

# Definimos el modelo User, que representa la tabla 'user' en la base de datos
class User(db.Model):
    __tablename__ = 'user'  # Nombre de la tabla en la base de datos

    # Columnas de la tabla
    id = db.Column(db.Integer, primary_key=True)  # ID único, clave primaria
    username = db.Column(db.String(64), unique=True, nullable=False)  # Nombre de usuario, único y obligatorio
    email = db.Column(db.String(120), unique=True, nullable=False)    # Email, único y obligatorio
    password = db.Column(db.String(128), nullable=False)              # Contraseña (encriptada), obligatoria

    def __repr__(self):
        # Representación legible del usuario (útil para debug)
        return f'<User {self.username}>'

    def serialize(self):
        
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
