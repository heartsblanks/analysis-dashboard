from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

# Function to interact with the SQLite database
def get_paps_from_db(filter_text=""):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    if filter_text:
        cursor.execute("SELECT PAP_NAME FROM PAPS WHERE PAP_NAME LIKE ?", (f'{filter_text}%',))
    else:
        cursor.execute("SELECT PAP_NAME FROM PAPS")
    
    paps = cursor.fetchall()
    conn.close()
    return [pap[0] for pap in paps]

@app.route('/api/paps', methods=['GET'])
def get_paps():
    filter_text = request.args.get('filter', '')
    paps = get_paps_from_db(filter_text)
    return jsonify(paps)

if __name__ == "__main__":
    app.run(debug=True)
