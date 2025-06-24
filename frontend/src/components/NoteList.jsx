import React from "react";
import { AnimatePresence } from "framer-motion";
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
  isReadOnly = false,
}) {
  return (
    <section className="col-span-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
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
              isReadOnly={isReadOnly}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
