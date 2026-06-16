from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'my_super_secret_key_123'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'expenses.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- MIDDLEWARE FOR TOKEN VERIFICATION ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Token should be passed in the 'Authorization' header
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] # Format: "Bearer <token>"

        if not token:
            return jsonify({'message': 'Token is missing! Access denied.'}), 401

        try:
            # Decode the token to get the user ID
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user_id, *args, **kwargs)
    return decorated

# --- REGISTER USER ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required!"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
        conn.commit()
        return jsonify({"message": "Registered successfully!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "Username already exists!"}), 400
    finally:
        conn.close()

# --- LOGIN USER ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()

    # Check if user exists and password is correct
    if user and check_password_hash(user['password'], password):
        # Generate 24-hour token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'token': token})

    return jsonify({"message": "Invalid username or password!"}), 401


# --- GET & ADD EXPENSES (PROTECTED) ---
@app.route('/api/expenses', methods=['GET', 'POST'])
@token_required
def manage_expenses(current_user_id):
    conn = get_db_connection()

    if request.method == 'GET':
        # Fetch expenses ONLY for the logged-in user
        expenses = conn.execute('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', (current_user_id,)).fetchall()
        output = [{'id': exp['id'], 'title': exp['title'], 'amount': exp['amount'], 'type': exp['type'], 'date': exp['date']} for exp in expenses]
        conn.close()
        return jsonify(output)

    if request.method == 'POST':
        new_data = request.json
        title = new_data.get('title')
        amount = new_data.get('amount')
        expense_type = new_data.get('type')

        # Add expense linked to the current user
        conn.execute('INSERT INTO expenses (user_id, title, amount, type) VALUES (?, ?, ?, ?)',
                     (current_user_id, title, amount, expense_type))
        conn.commit()
        conn.close()
        return jsonify({"message": "Added successfully!"}), 201

# --- DELETE EXPENSE (PROTECTED) ---
@app.route('/api/expenses/<int:id>', methods=['DELETE'])
@token_required
def delete_expense(current_user_id, id):
    conn = get_db_connection()
    # User can only delete their own expense
    conn.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', (id, current_user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)