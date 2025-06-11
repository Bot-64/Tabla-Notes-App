from flask import Blueprint, request, jsonify
from models import get_connection

# Create a Blueprint for notes
notes_bp = Blueprint("notes", __name__)

@notes_bp.route("/notes", methods=["GET"])
def get_notes():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM notes ORDER BY date_modified DESC")
    notes = [
        {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "taal": row[3],
            "structure": row[4],
            "date_modified": row[5],
        }
        for row in c.fetchall()
    ]
    c.close()
    conn.close()
    return jsonify(notes)

@notes_bp.route("/notes", methods=["POST"])
def add_note():
    data = request.json
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO notes (title, content, taal, structure, date_modified) VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP) RETURNING id",
        (data["title"], data["content"], data.get("taal"), data.get("structure"))
    )
    note_id = c.fetchone()[0]
    conn.commit()
    c.execute("SELECT id, title, content, taal, structure, date_modified FROM notes WHERE id = %s", (note_id,))
    row = c.fetchone()
    c.close()
    conn.close()
    if row:
        note = {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "taal": row[3],
            "structure": row[4],
            "date_modified": row[5],
        }
        return jsonify(note), 201
    else:
        return jsonify({"error": "Note not found after insert"}), 500

@notes_bp.route("/notes/<int:id>", methods=["DELETE"])
def delete_note(id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM notes WHERE id = %s", (id,))
    conn.commit()
    c.close()
    conn.close()
    return jsonify({"message": "Note deleted successfully"}), 200

@notes_bp.route("/notes/<int:id>", methods=["PUT"])
def update_note(id):
    data = request.json
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "UPDATE notes SET title = %s, content = %s, taal = %s, structure = %s, date_modified = CURRENT_TIMESTAMP WHERE id = %s",
        (data["title"], data["content"], data["taal"], data["structure"], id)
    )
    conn.commit()
    c.execute("SELECT id, title, content, taal, structure, date_modified FROM notes WHERE id = %s", (id,))
    row = c.fetchone()
    c.close()
    conn.close()
    if row:
        note = {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "taal": row[3],
            "structure": row[4],
            "date_modified": row[5],
        }
        return jsonify(note), 200
    else:
        return jsonify({"error": "Note not found"}), 404