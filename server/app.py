from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

def connect_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # Enable named columns
    return conn

@app.route('/api/paps/<pap>/queues', methods=['GET'])
def get_queues_for_pap(pap):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Get all queues associated with the given PAP
        cursor.execute("""
            SELECT q.QUEUE_NAME, q.QUEUE_TYPE, q.QUEUE_ID, d.TYPE, d.NAME, a.ATTRIBUTE_KEY, a.ATTRIBUTE_VALUE
            FROM QUEUES q
            LEFT JOIN QUEUE_DEFINITIONS d ON q.QUEUE_ID = d.DEFINITION_ID
            LEFT JOIN ATTRIBUTES a ON d.DEFINITION_ID = a.DEFINITION_ID
            WHERE q.QUEUE_NAME IN (
                SELECT QUEUE_NAME FROM PAPS p
                JOIN PAP_QUEUES pq ON p.PAP_ID = pq.PAP_ID
                WHERE p.PAP_NAME = ?
            )
        """, (pap,))

        queues = cursor.fetchall()
        conn.close()

        # Structure the data to include relevant queue details
        results = []
        for queue in queues:
            results.append({
                'queue_name': queue['QUEUE_NAME'],
                'queue_type': queue['QUEUE_TYPE'],
                'definition_type': queue['TYPE'],
                'definition_name': queue['NAME'],
                'attribute_key': queue['ATTRIBUTE_KEY'],
                'attribute_value': queue['ATTRIBUTE_VALUE']
            })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)