import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# NeonDB/Postgres connection string
NEONDB_URL = os.environ.get('NEONDB_URL')

def get_connection():
    return psycopg2.connect(NEONDB_URL)

def init_db():
    conn = get_connection()
    c = conn.cursor()
    # Create the notes table if it doesn't exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            taal TEXT,
            structure TEXT,
            date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    c.close()
    conn.close()