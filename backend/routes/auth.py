from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import get_connection
import jwt
import datetime
import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret')

auth_bp = Blueprint('auth', __name__)

def create_user(username, password):
    conn = get_connection()
    c = conn.cursor()
    password_hash = generate_password_hash(password)
    try:
        c.execute('INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id', (username, password_hash))
        user_id = c.fetchone()[0]
        conn.commit()
        return user_id
    except Exception as e:
        conn.rollback()
        return None
    finally:
        c.close()
        conn.close()

def verify_user(username, password):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT id, password_hash FROM users WHERE username = %s', (username,))
    row = c.fetchone()
    c.close()
    conn.close()
    if row and check_password_hash(row[1], password):
        return row[0]  # user_id
    return None

def create_access_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    user_id = create_user(username, password)
    if user_id:
        token = create_access_token(user_id)
        return jsonify({'token': token, 'username': username}), 201
    else:
        return jsonify({'error': 'Username already exists'}), 409

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user_id = verify_user(username, password)
    if user_id:
        token = create_access_token(user_id)
        return jsonify({'token': token, 'username': username}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/users', methods=['GET'])
def get_users():
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT id, username FROM users ORDER BY id')
    users = [
        {'id': row[0], 'username': row[1]} for row in c.fetchall()
    ]
    c.close()
    conn.close()
    return jsonify({'users': users})

def get_user_id_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except Exception:
        return None
