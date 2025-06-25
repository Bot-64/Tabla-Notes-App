import React from "react";
import { motion } from "framer-motion";

export default function NoteCard({
  note,
  editingNoteId,
  editedNote,
  handleEditClick,
  handleEditInputChange,
  handleSaveEdit,
  handleDeleteNote,
  setEditingNoteId,
  isReadOnly = false,
}) {
  // Color by structure
  const structureColor = {
    peshkar: "bg-[var(--color-note-peshkar)] border-blue-200",
    kaida: "bg-[var(--color-note-kaida)] border-green-200",
    rela: "bg-[var(--color-note-rela)] border-orange-200",
    default: "bg-[var(--color-note-default)] border-neutral-200",
  };
  const cardColor = structureColor[note.structure] || structureColor.default;

  if (editingNoteId === note.id) {
    const isSplitStructure = ["peshkar", "kaida", "rela"].includes(editedNote.structure);
    return (
      <motion.div
        initial={{ scale: 0.97, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0.7 }}
        className={`glassmorphic border ${cardColor} shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300`}
      >
        <h2 className="text-lg font-bold mb-4 text-neutral-900 drop-shadow-lg">Editing Note</h2>
        <input
          type="text"
          name="title"
          value={editedNote.title || ""}
          onChange={handleEditInputChange}
          className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
          disabled={isReadOnly}
        />
        {isSplitStructure ? (
          <>
            {/* Main field */}
            <textarea
              name="main"
              placeholder="Main"
              value={editedNote.main || ""}
              onChange={handleEditInputChange}
              className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
              disabled={isReadOnly}
            />
            {/* Bals fields */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-700 font-semibold">Bals</span>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="px-2 py-1 bg-blue-600 text-black rounded text-xs"
                    onClick={() => {
                      const bals = editedNote.bals ? [...editedNote.bals] : [];
                      bals.push("");
                      handleEditInputChange({
                        target: { name: "bals", value: bals },
                        isBal: true,
                      });
                    }}
                  >
                    + Add Bal
                  </button>
                )}
              </div>
              {editedNote.bals && editedNote.bals.length > 0 && (
                <ol className="list-decimal list-inside space-y-1">
                  {editedNote.bals.map((bal, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <textarea
                        name={`bal-${idx}`}
                        value={bal}
                        onChange={e => {
                          const bals = [...editedNote.bals];
                          bals[idx] = e.target.value;
                          handleEditInputChange({
                            target: { name: "bals", value: bals },
                            isBal: true,
                          });
                        }}
                        className="p-2 rounded bg-white text-neutral-900 w-full mb-1"
                        rows={1}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-600 text-black rounded text-xs"
                          onClick={() => {
                            const bals = [...editedNote.bals];
                            bals.splice(idx, 1);
                            handleEditInputChange({
                              target: { name: "bals", value: bals },
                              isBal: true,
                            });
                          }}
                          aria-label="Delete bal"
                        >
                          &times;
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {/* Tehai field */}
            <textarea
              name="tehai"
              placeholder="Tehai"
              value={editedNote.tehai || ""}
              onChange={handleEditInputChange}
              className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
              disabled={isReadOnly}
            />
          </>
        ) : (
          <textarea
            name="content"
            value={editedNote.content || ""}
            onChange={handleEditInputChange}
            className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
            disabled={isReadOnly}
          />
        )}
        <input
          type="text"
          name="taal"
          value={editedNote.taal || ""}
          onChange={handleEditInputChange}
          className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
          disabled={isReadOnly}
        />
        <input
          type="text"
          name="structure"
          value={editedNote.structure || ""}
          onChange={handleEditInputChange}
          className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
          disabled={isReadOnly}
        />
        {!isReadOnly && (
          <>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-green-600 text-black rounded mr-2"
            >
              Save Note
            </button>
            <button
              onClick={() => setEditingNoteId(null)}
              className="px-4 py-2 bg-red-600 text-black rounded"
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    );
  }

  // View mode
  const isUserNote = note.user_id !== null && note.user_id !== undefined;
  const isSplitStructure = ["peshkar", "kaida", "rela"].includes(note.structure);
  const handleCardClick = () => {
    if (isReadOnly) return;
    console.log('DEBUG note.user_id:', note); // Debug statement
    if (note.user_id === null || note.user_id === undefined) {
      alert("You cannot delete/edit notes without an associated user.");
      return;
    }
    handleEditClick(note);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (note.user_id === null || note.user_id === undefined) {
      alert("You cannot delete/edit notes without an associated user.");
      return;
    }
    handleDeleteNote(note.id);
  };
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 12px 36px 0 rgba(31,38,135,0.22)" }}
      className={`glassmorphic border ${cardColor} shadow-xl rounded-2xl p-4 cursor-pointer transition-all duration-300`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-lg font-bold text-neutral-900 drop-shadow-lg">{note.title}</h2>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--color-indigo)] text-white">{note.taal}</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--color-saffron)] text-white">{note.structure.charAt(0).toUpperCase() + note.structure.slice(1)}</span>
        </div>
      </div>
      <div className="text-neutral-800 text-base mb-2">
        {isSplitStructure ? (
          <div className="whitespace-pre-line">
            {note.main && (
              <div>
                <span className="font-semibold">Main:</span>
                <span className="block">{note.main}</span>
              </div>
            )}
            {Array.isArray(note.bals) && note.bals.length > 0 && (
              <div>
                <span className="font-semibold">Bals:</span>
                <ol className="list-decimal ml-6">
                  {note.bals.map((bal, idx) => {
                    // Split bal into lines
                    const lines = bal.split(/\r?\n/);
                    return (
                      <li key={idx} className="block whitespace-pre-line">
                        {/* First line with number, rest indented */}
                        <span className="font-semibold mr-1">{idx + 1}.</span>
                        {lines.map((line, lineIdx) => (
                          <div key={lineIdx} className={lineIdx === 0 ? "inline" : "block ml-6"}>
                            {line}
                          </div>
                        ))}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
            {note.tehai && (
              <div>
                <span className="font-semibold">Tehai:</span>
                <span className="block">{note.tehai}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="line-clamp-3 whitespace-pre-line">
            {note.content}
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {isUserNote && !isReadOnly && (
          <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={handleDelete}>Delete</button>
        )}
      </div>
    </motion.div>
  );
}
