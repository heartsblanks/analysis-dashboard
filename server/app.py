from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)
# Global variable to track the status of data population
population_status = {"in_progress": False, "completed": False}

@app.route('/api/populate_data', methods=['GET'])
def populate_data():
    global population_status
    # Start data population in a separate thread
    population_status["in_progress"] = True
    population_status["completed"] = False
    thread = Thread(target=populate_missing_data_in_db)
    thread.start()
    return jsonify({"message": "Data population started"}), 200

@app.route('/api/population_status', methods=['GET'])
def population_status():
    # Return the current status of data population
    return jsonify(population_status), 200

def populate_missing_data_in_db():
    global population_status
    # Simulated data population process
    time.sleep(5)  # Simulate delay for data population
    # Update status to completed
    population_status["in_progress"] = False
    population_status["completed"] = True
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
@app.route('/api/paps/<pap>/integration_servers', methods=['GET'])
def get_integration_servers_for_pap(pap):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Fetch integration servers related to the given PAP
        cursor.execute("""
            SELECT * 
            FROM INTEGRATION_SERVERS 
            WHERE SERVER_ID IN (
                SELECT SERVER_ID 
                FROM PAP_INTEGRATION_SERVERS 
                WHERE PAP_ID = (SELECT PAP_ID FROM PAPS WHERE PAP_NAME = ?)
            )
        """, (pap,))
        integration_servers = cursor.fetchall()

        result = [dict(row) for row in integration_servers]

        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/paps/<pap>/databases', methods=['GET'])
def get_databases_for_pap(pap):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Step 1: Fetch database properties grouped by environment
        cursor.execute("""
            SELECT dp.DB_NAME, dp.ENVIRONMENT, dp.VALUE
            FROM DATABASE_PROPERTIES dp
            JOIN PROPERTY_FILES pf ON dp.FILE_ID = pf.FILE_ID
            WHERE pf.PAP_ID = (SELECT PAP_ID FROM PAPS WHERE PAP_NAME = ?)
            ORDER BY dp.ENVIRONMENT
        """, (pap,))
        databases = cursor.fetchall()

        # Step 2: Fetch SQL operations and tables associated with the PAP
        cursor.execute("""
            SELECT so.OPERATION_TYPE, so.TABLE_NAME
            FROM SQL_OPERATIONS so
            JOIN FUNCTIONS f ON so.FUNCTION_ID = f.FUNCTION_ID
            JOIN ESQLFILES ef ON f.ESQL_FILE_ID = ef.ESQL_FILE_ID
            JOIN PROJECTS p ON ef.PROJECT_ID = p.PROJECT_ID
            WHERE p.PAP_ID = (SELECT PAP_ID FROM PAPS WHERE PAP_NAME = ?)
        """, (pap,))
        operations_and_tables = cursor.fetchall()

        result = {
            'databases': [dict(row) for row in databases],
            'operations_and_tables': [dict(row) for row in operations_and_tables]
        }

        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
