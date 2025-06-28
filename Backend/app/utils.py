from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from app.models import User
from functools import wraps

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({"message": "Admin privileges required"}), 403
        return fn(*args, **kwargs)
    return wrapper
