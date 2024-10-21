# server/app.py
from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

def connect_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/paps', methods=['GET'])
def get_paps():
    filter_text = request.args.get('filter', '')
    try:
        conn = connect_db()
        cursor = conn.cursor()
        if filter_text:
            cursor.execute("SELECT PAP_NAME FROM PAPS WHERE PAP_NAME LIKE ?", (f'{filter_text}%',))
        else:
            cursor.execute("SELECT PAP_NAME FROM PAPS")
        paps = [row["PAP_NAME"] for row in cursor.fetchall()]
        conn.close()
        return jsonify(paps), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)