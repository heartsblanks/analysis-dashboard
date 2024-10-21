from flask import Flask, jsonify, request
import sqlite3
import os

app = Flask(__name__)

# Path to the SQLite3 database file
DATABASE = os.path.join(os.getcwd(), 'database.db')

# Utility function to connect to the database
def connect_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Allows returning rows as dictionaries
    return conn

# Fetch all PAPs with optional filtering
@app.route('/api/paps', methods=['GET'])
def get_paps():
    filter_text = request.args.get('filter', '')  # Get filter text from query params
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Apply filtering if filter_text is provided
        if filter_text:
            cursor.execute("SELECT PAP_NAME FROM PAPS WHERE PAP_NAME LIKE ?", (f'{filter_text}%',))
        else:
            cursor.execute("SELECT PAP_NAME FROM PAPS")
        
        paps = [row["PAP_NAME"] for row in cursor.fetchall()]
        conn.close()
        return jsonify(paps), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Fetch details for a specific PAP
@app.route('/api/paps/<pap_name>', methods=['GET'])
def get_pap_details(pap_name):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        query = """SELECT * FROM PAPS WHERE PAP_NAME = ?"""
        cursor.execute(query, (pap_name,))
        pap_details = cursor.fetchone()

        if pap_details:
            pap_dict = {key: pap_details[key] for key in pap_details.keys()}
            conn.close()
            return jsonify(pap_dict), 200
        else:
            return jsonify({'message': 'PAP not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)