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

        # Step 1: Fetch queue names and queue types associated with the given PAP
        cursor.execute("""
            SELECT q.QUEUE_NAME, q.QUEUE_TYPE
            FROM PAPS p
            JOIN PAP_QUEUES pq ON p.PAP_ID = pq.PAP_ID
            JOIN QUEUES q ON pq.QUEUE_ID = q.QUEUE_ID
            WHERE p.PAP_NAME = ?
        """, (pap,))

        queues = cursor.fetchall()

        # Step 2: Fetch queue definitions and attributes for each queue
        results = []
        for queue in queues:
            queue_name = queue['QUEUE_NAME']
            queue_type = queue['QUEUE_TYPE']

            # Fetch the queue's definition and attributes
            cursor.execute("""
                SELECT d.TYPE, a.ATTRIBUTE_KEY, a.ATTRIBUTE_VALUE
                FROM QUEUE_DEFINITIONS d
                LEFT JOIN ATTRIBUTES a ON d.DEFINITION_ID = a.DEFINITION_ID
                WHERE d.NAME = ?
            """, (queue_name,))
            definitions = cursor.fetchall()

            # Add queue details to results
            queue_details = {
                'queue_name': queue_name,
                'queue_type': queue_type,
                'definitions': [{'type': d['TYPE'], 'attribute_key': d['ATTRIBUTE_KEY'], 'attribute_value': d['ATTRIBUTE_VALUE']} for d in definitions]
            }

            # Step 3: Check if the queue has a target queue and fetch its details
            # (Assuming target queue details are stored in the QUEUE_DEFINITIONS table under a specific attribute)
            cursor.execute("""
                SELECT d.NAME AS target_queue, a.ATTRIBUTE_KEY, a.ATTRIBUTE_VALUE
                FROM QUEUE_DEFINITIONS d
                LEFT JOIN ATTRIBUTES a ON d.DEFINITION_ID = a.DEFINITION_ID
                WHERE d.NAME = (
                    SELECT a.ATTRIBUTE_VALUE
                    FROM ATTRIBUTES a
                    WHERE a.DEFINITION_ID = (SELECT d.DEFINITION_ID FROM QUEUE_DEFINITIONS d WHERE d.NAME = ?)
                    AND a.ATTRIBUTE_KEY = 'target'
                )
            """, (queue_name,))
            target_queue = cursor.fetchone()

            if target_queue:
                queue_details['target_queue'] = {
                    'queue_name': target_queue['target_queue'],
                    'attributes': {
                        'attribute_key': target_queue['ATTRIBUTE_KEY'],
                        'attribute_value': target_queue['ATTRIBUTE_VALUE']
                    }
                }

            results.append(queue_details)

        conn.close()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)