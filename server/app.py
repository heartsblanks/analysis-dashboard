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

            # Step 3: Check if the queue has a target queue attribute
            target_queue_name = None
            for d in definitions:
                if d['ATTRIBUTE_KEY'] == 'target':
                    target_queue_name = d['ATTRIBUTE_VALUE']

            # Step 4: If target queue exists, fetch its attributes
            if target_queue_name:
                cursor.execute("""
                    SELECT d.NAME, a.ATTRIBUTE_KEY, a.ATTRIBUTE_VALUE
                    FROM QUEUE_DEFINITIONS d
                    LEFT JOIN ATTRIBUTES a ON d.DEFINITION_ID = a.DEFINITION_ID
                    WHERE d.NAME = ?
                """, (target_queue_name,))
                target_definitions = cursor.fetchall()

                # Add target queue details to the main queue details
                if target_definitions:
                    queue_details['target_queue'] = {
                        'queue_name': target_queue_name,
                        'attributes': [{'attribute_key': td['ATTRIBUTE_KEY'], 'attribute_value': td['ATTRIBUTE_VALUE']} for td in target_definitions]
                    }

            results.append(queue_details)

        conn.close()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/paps/<pap>/uembd_entries', methods=['GET'])
def get_uembd_entries_for_pap(pap):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Step 1: Get PF numbers associated with the given PAP
        cursor.execute("""
            SELECT PF_NUMBER 
            FROM PFNUMBERS 
            WHERE PAP_ID = (SELECT PAP_ID FROM PAPS WHERE PAP_NAME = ?)
        """, (pap,))
        pf_numbers = [row['PF_NUMBER'] for row in cursor.fetchall()]

        if not pf_numbers:
            return jsonify({'error': 'No PF numbers found for the specified PAP'}), 404

        # Convert the PF numbers into a format for SQL's IN clause
        pf_number_placeholders = ','.join(['?'] * len(pf_numbers))

        # Step 2: Fetch all columns from UEMBD02T, UEMBD20T, UEMBD21T
        cursor.execute(f"""
            SELECT * FROM UEMBD02T
            WHERE PROCESS_ID IN ({pf_number_placeholders})
        """, pf_numbers)
        uembd02_entries = cursor.fetchall()

        cursor.execute(f"""
            SELECT * FROM UEMBD20T
            WHERE PROCESS_ID IN ({pf_number_placeholders})
        """, pf_numbers)
        uembd20_entries = cursor.fetchall()

        cursor.execute(f"""
            SELECT * FROM UEMBD21T
            WHERE PROCESS_ID IN ({pf_number_placeholders})
        """, pf_numbers)
        uembd21_entries = cursor.fetchall()

        # Organize results
        result = {
            'uembd02t': [dict(row) for row in uembd02_entries],
            'uembd20t': [dict(row) for row in uembd20_entries],
            'uembd21t': [dict(row) for row in uembd21_entries]
        }

        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/paps/<pap>/webservices', methods=['GET'])
def get_webservices_for_pap(pap):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Fetch web services related to the given PAP
        cursor.execute("""
            SELECT * 
            FROM WEBSERVICES 
            WHERE PAP_ID = (SELECT PAP_ID FROM PAPS WHERE PAP_NAME = ?)
        """, (pap,))
        webservices = cursor.fetchall()

        result = [dict(row) for row in webservices]

        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/paps/<pap>/other_properties', methods=['GET'])
def get_other_properties_for_pap(pap):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Fetch other properties related to the given PAP
        cursor.execute("""
            SELECT * 
            FROM OTHER_PROPERTIES 
            WHERE PROPERTY_FILE_ID IN (
                SELECT FILE_ID 
                FROM PROPERTY_FILES 
                WHERE PAP_ID = (SELECT PAP_ID FROM PAPS WHERE PAP_NAME = ?)
            )
        """, (pap,))
        other_properties = cursor.fetchall()

        result = [dict(row) for row in other_properties]

        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
