# auth.py
# Here we define authentication-related routes (login, register, etc.)
# We use a 'blueprint' to organize these routes and import them easily in __init__.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import re
from .models import User, db
from app.__init__ import mail
from app.utils import generate_token, get_expiration
from flask_mail import Message

# Create the blueprint called 'auth'
auth = Blueprint('auth', __name__)

# Test route to verify that the auth blueprint works
@auth.route('/auth/ping', methods=['GET'])
def auth_ping():
    """
    Test endpoint. If you access /auth/ping, responds with 'pong auth'.
    Used to check that the auth blueprint is working.
    """
    return jsonify({'message': 'pong auth'})

@auth.route('/auth/register', methods=['POST'])
def register():
    """
    Registers a new user in the system.
    
    Requires in the body:
    - username: string (unique)
    - email: string (unique, valid format)
    - password: string (min 6 chars)
    
    Returns:
    - 201: User created successfully
    - 400: Invalid data or user/email already exists
    """
    try:
        data = request.get_json()
        
        # Validate all required fields are present
        if not all(key in data for key in ['username', 'email', 'password']):
            return jsonify({'error': 'Missing required fields: username, email, password'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validations
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create the new user
        hashed_password = generate_password_hash(password)
        new_user = User()
        new_user.username = username
        new_user.email = email
        new_user.password = hashed_password
        new_user.is_admin = False
        
        # Generate email verification token
        verification_token = generate_token()
        new_user.email_verification_token = verification_token
        new_user.email_verified = False
        
        db.session.add(new_user)
        db.session.commit()
        
        # Send verification email
        try:
            verify_url = f"http://localhost:5173/verify-email?token={verification_token}"
            msg = Message(
                subject="Verify your email",
                recipients=[new_user.email],
                body=f"Welcome to Dr. Shopper! Please verify your email by clicking the following link: {verify_url}"
            )
            mail.send(msg)
        except Exception as e:
            # Log error, but don't fail registration
            print(f"Error sending verification email: {e}")
        
        # Create access tokens
        access_token = create_access_token(identity=str(new_user.id))
        refresh_token = create_refresh_token(identity=str(new_user.id))
        
        return jsonify({
            'message': 'User registered successfully. Please check your email to verify your account.',
            'user': new_user.serialize(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/login', methods=['POST'])
def login():
    """
    Authenticates a user and returns access tokens.
    
    Requires in the body:
    - username: string (or email)
    - password: string
    
    Returns:
    - 200: Login successful with tokens
    - 401: Invalid credentials
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['username', 'password']):
            return jsonify({'error': 'Missing required fields: username, password'}), 400
        
        username_or_email = data['username'].strip()
        password = data['password']
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'user': user.serialize(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refreshes the access token using the refresh token.
    
    Requires:
    - Header Authorization: Bearer <refresh_token>
    
    Returns:
    - 200: New access token
    - 401: Invalid refresh token
    """
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error refreshing token'}), 500

@auth.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logs out the user (invalidates the token).
    
    Requires:
    - Header Authorization: Bearer <access_token>
    
    Returns:
    - 200: Logout successful
    """
    try:
        # In a more robust implementation, you could add the token to a blacklist here
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Error during logout'}), 500

@auth.route('/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """
    Verifies if the access token is valid and returns user info.
    
    Requires:
    - Header Authorization: Bearer <access_token>
    
    Returns:
    - 200: Valid token with user info
    - 401: Invalid token
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'valid': True,
            'user': user.serialize()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error verifying token'}), 500

@auth.route('/auth/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    Changes the password of the authenticated user.
    
    Requires:
    - Header Authorization: Bearer <access_token>
    - Body: current_password, new_password
    
    Returns:
    - 200: Password changed successfully
    - 400: Invalid data
    - 401: Incorrect current password
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not all(key in data for key in ['current_password', 'new_password']):
            return jsonify({'error': 'Missing required fields: current_password, new_password'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Check current password
        if not check_password_hash(user.password, current_password):
            return jsonify({'error': 'Incorrect current password'}), 401
        
        # Validate new password
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        
        # Update password
        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    """
    Starts the password recovery process.
    
    Requires in the body:
    - email: string
    
    Returns:
    - 200: Recovery email sent (simulated)
    - 404: Email not found
    """
    try:
        data = request.get_json()
        if 'email' not in data:
            return jsonify({'error': 'Email field required'}), 400
        email = data['email'].strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Email not found'}), 404
        # Generate reset token and expiration
        reset_token = generate_token()
        user.reset_password_token = reset_token
        user.reset_password_token_expiration = get_expiration(hours=1)
        db.session.commit()
        # Send reset email
        try:
            reset_url = f"http://localhost:5173/reset-password?token={reset_token}"
            msg = Message(
                subject="Reset your password",
                recipients=[user.email],
                body=f"To reset your password, click the following link: {reset_url}\nThis link will expire in 1 hour."
            )
            mail.send(msg)
        except Exception as e:
            print(f"Error sending reset email: {e}")
        return jsonify({
            'message': 'If the email exists in our database, you will receive a recovery link'
        }), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Resets the password using a recovery token.
    
    Requires in the body:
    - token: string (recovery token)
    - new_password: string
    
    Returns:
    - 200: Password reset successfully
    - 400: Invalid data
    - 401: Invalid or expired token
    """
    try:
        data = request.get_json()
        if not all(key in data for key in ['token', 'new_password']):
            return jsonify({'error': 'Missing required fields: token, new_password'}), 400
        token = data['token']
        new_password = data['new_password']
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        # Find user by token
        user = User.query.filter_by(reset_password_token=token).first()
        if not user or not user.reset_password_token_expiration:
            return jsonify({'error': 'Invalid or expired token'}), 401
        from datetime import datetime
        if user.reset_password_token_expiration < datetime.utcnow():
            return jsonify({'error': 'Token has expired'}), 401
        # Update password and clear token
        user.password = generate_password_hash(new_password)
        user.reset_password_token = None
        user.reset_password_token_expiration = None
        db.session.commit()
        return jsonify({'message': 'Password reset successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Gets the profile of the authenticated user.
    
    Requires:
    - Header Authorization: Bearer <access_token>
    
    Returns:
    - 200: User profile
    - 404: User not found
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.serialize()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Updates the profile of the authenticated user.
    
    Requires:
    - Header Authorization: Bearer <access_token>
    - Body: username, email (optional)
    
    Returns:
    - 200: Profile updated successfully
    - 400: Invalid data
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update username if provided
        if 'username' in data:
            new_username = data['username'].strip()
            if len(new_username) < 3:
                return jsonify({'error': 'Username must be at least 3 characters'}), 400
            
            # Check if username is already taken
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Username already taken'}), 400
            
            user.username = new_username
        
        # Update email if provided
        if 'email' in data:
            new_email = data['email'].strip().lower()
            
            # Validate email format
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, new_email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already registered
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email already registered'}), 400
            
            user.email = new_email
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.serialize()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth.route('/auth/verify-email', methods=['GET'])
def verify_email():
    """
    Verifies the user's email using the token sent by email.
    Query param: token
    Returns:
    - 200: Email verified successfully
    - 400: Invalid or expired token
    """
    token = request.args.get('token')
    if not token:
        return jsonify({'error': 'Missing token'}), 400
    user = User.query.filter_by(email_verification_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400
    user.email_verified = True
    user.email_verification_token = None
    db.session.commit()
    return jsonify({'message': 'Email verified successfully'}), 200
