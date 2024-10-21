import os
import sqlite3

DATABASE = os.path.join(os.getcwd(), 'database.db')


conn = sqlite3.connect(DATABASE)
conn.row_factory = sqlite3.Row

cursor = conn.cursor()
cursor.execute('''DROP TABLE IF EXISTS PAPS''')
cursor.execute('''CREATE TABLE PAPS (PAP_NAME TEXT PRIMARY KEY)''')
count =1
while count <= 99:
    count +=1
    cursor.execute("INSERT INTO PAPS (PAP_NAME) VALUES (?)", (count,))

conn.commit()
conn.close()