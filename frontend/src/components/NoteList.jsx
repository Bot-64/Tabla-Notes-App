import React from "react";
import NoteCard from "./NoteCard";

export default function NoteList({
  filteredNotes,
  editingNoteId,
  editedNote,
  handleEditClick,
  handleEditInputChange,
  handleSaveEdit,
  handleDeleteNote,
  setEditingNoteId,
}) {
  return (
    <section className="col-span-4">
      <div className="grid grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            editingNoteId={editingNoteId}
            editedNote={editedNote}
            handleEditClick={handleEditClick}
            handleEditInputChange={handleEditInputChange}
            handleSaveEdit={handleSaveEdit}
            handleDeleteNote={handleDeleteNote}
            setEditingNoteId={setEditingNoteId}
          />
        ))}
      </div>
    </section>
  );
}
