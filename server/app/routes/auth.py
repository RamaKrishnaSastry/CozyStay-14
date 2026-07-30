import requests
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data'}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'guest')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already in use'}), 400

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role}
    )

    return jsonify({'token': access_token, 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role}
    )

    return jsonify({'token': access_token, 'user': user.to_dict()})

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})

@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.get_json()
    if not data or not data.get('credential'):
        return jsonify({'error': 'Google credential is required'}), 400

    credential = data['credential']
    client_id = current_app.config.get('GOOGLE_CLIENT_ID')

    if not client_id:
        return jsonify({'error': 'Google OAuth not configured'}), 501

    try:
        resp = requests.post(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'id_token': credential},
            timeout=10,
        )
        if resp.status_code != 200:
            return jsonify({'error': 'Invalid Google token'}), 401
        google_info = resp.json()

        if google_info.get('aud') != client_id:
            return jsonify({'error': 'Token audience mismatch'}), 401

        email = google_info.get('email')
        name = google_info.get('name', email.split('@')[0])
        google_id = google_info.get('sub')

        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                name=name,
                email=email,
                role='guest',
            )
            user.set_password(google_id)
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'role': user.role}
        )
        return jsonify({'token': access_token, 'user': user.to_dict()})

    except requests.RequestException:
        return jsonify({'error': 'Failed to verify Google token'}), 502
