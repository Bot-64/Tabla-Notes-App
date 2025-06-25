from flask import Blueprint, request, jsonify
from models import get_connection
from routes.auth import get_user_id_from_token

# Create a Blueprint for notes
notes_bp = Blueprint("notes", __name__)

@notes_bp.route("/notes", methods=["GET"])
def get_notes():
    user_id = get_user_id_from_token(request)
    conn = get_connection()
    c = conn.cursor()
    if user_id:
        # Authenticated: return this user's notes AND public notes (user_id IS NULL)
        c.execute("SELECT id, title, content, taal, structure, date_modified, user_id FROM notes WHERE user_id = %s OR user_id IS NULL ORDER BY date_modified DESC", (user_id,))
    else:
        # Not authenticated: return only public notes
        c.execute("SELECT id, title, content, taal, structure, date_modified, user_id FROM notes WHERE user_id IS NULL ORDER BY date_modified DESC")
    notes = [
        {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "taal": row[3],
            "structure": row[4],
            "date_modified": row[5],
            "user_id": row[6],
        }
        for row in c.fetchall()
    ]
    c.close()
    conn.close()
    return jsonify(notes)

@notes_bp.route("/notes", methods=["POST"])
def add_note():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO notes (title, content, taal, structure, date_modified, user_id) VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, %s) RETURNING id",
            (data["title"], data["content"], data.get("taal"), data.get("structure"), user_id)
        )
        note_id = c.fetchone()[0]
        conn.commit()
        c.execute("SELECT id, title, content, taal, structure, date_modified, user_id FROM notes WHERE id = %s", (note_id,))
        row = c.fetchone()
        if row:
            note = {
                "id": row[0],
                "title": row[1],
                "content": row[2],
                "taal": row[3],
                "structure": row[4],
                "date_modified": row[5],
                "user_id": row[6],
            }
            return jsonify(note), 201
        else:
            return jsonify({"error": "Note not found after insert"}), 500
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to add note: {str(e)}"}), 500
    finally:
        c.close()
        conn.close()

@notes_bp.route("/notes/<int:id>", methods=["DELETE"])
def delete_note(id):
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    conn = get_connection()
    c = conn.cursor()
    # Only delete if the note belongs to the user
    c.execute("DELETE FROM notes WHERE id = %s AND user_id = %s", (id, user_id))
    conn.commit()
    c.close()
    conn.close()
    return jsonify({"message": "Note deleted successfully"}), 200

@notes_bp.route("/notes/<int:id>", methods=["PUT"])
def update_note(id):
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    conn = get_connection()
    c = conn.cursor()
    # Only update if the note belongs to the user
    c.execute(
        "UPDATE notes SET title = %s, content = %s, taal = %s, structure = %s, date_modified = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s",
        (data["title"], data["content"], data["taal"], data["structure"], id, user_id)
    )
    conn.commit()
    c.execute("SELECT id, title, content, taal, structure, date_modified, user_id FROM notes WHERE id = %s", (id,))
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
            "user_id": row[6],
        }
        return jsonify(note), 200
    else:
        return jsonify({"error": "Note not found"}), 404