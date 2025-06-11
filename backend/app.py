from flask import Flask
from flask_cors import CORS
from models import init_db
from routes.notes import notes_bp  # Import the notes blueprint
import os

app = Flask(__name__)
CORS(app)

# Run this once at startup to create the table
init_db()

# Register the notes blueprint
app.register_blueprint(notes_bp)

@app.route("/")
def home():
    from models import get_connection
    # Query the database size from Postgres
    try:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT pg_database_size(current_database())")
        size_bytes = c.fetchone()[0]
        c.close()
        conn.close()
        # Human-readable size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                break
            size_bytes /= 1024.0
        size_str = f"{size_bytes:.2f} {unit}"
    except Exception as e:
        size_str = f"Error: {e}"
    return f"""
    <h1>Tabla Notes API</h1>
    <p>Backend is running!</p>
    <p>Try <a href='/notes'>/notes</a> to see stored compositions.</p>
    <p><b>Database size:</b> {size_str}</p>
    """

if __name__ == "__main__":
    app.run(debug=True)