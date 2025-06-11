import React from "react";

export default function NoteCard({
  note,
  editingNoteId,
  editedNote,
  handleEditClick,
  handleEditInputChange,
  handleSaveEdit,
  handleDeleteNote,
  setEditingNoteId,
}) {
  if (editingNoteId === note.id) {
    const isSplitStructure = ["peshkar", "kaida", "rela"].includes(editedNote.structure);
    return (
      <div className="glassmorphic border border-white/20 shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-lg font-bold mb-4 text-neutral-900 drop-shadow-lg">Editing Note</h2>
        <input
          type="text"
          name="title"
          value={editedNote.title || ""}
          onChange={handleEditInputChange}
          className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
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
            />
            {/* Bals fields */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-700 font-semibold">Bals</span>
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
                      />
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
            />
          </>
        ) : (
          <textarea
            name="content"
            value={editedNote.content || ""}
            onChange={handleEditInputChange}
            className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
          />
        )}
        <input
          type="text"
          name="taal"
          value={editedNote.taal || ""}
          onChange={handleEditInputChange}
          className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
        />
        <input
          type="text"
          name="structure"
          value={editedNote.structure || ""}
          onChange={handleEditInputChange}
          className="p-2 rounded bg-white text-neutral-900 w-full mb-2"
        />
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
      </div>
    );
  }
  return (
    <div className="glassmorphic shadow-xl rounded-2xl p-4 hover:shadow-2xl transition-all duration-300">
      <h3 className="text-lg font-bold mb-1 text-neutral-900 drop-shadow-lg">{note.title}</h3>
      {(["peshkar", "kaida", "rela"].includes(note.structure)) ? (
        <div className="mb-2">
          <div className="text-sm text-neutral-700 font-semibold mb-1">Main Contents</div>
          <div className="text-sm text-neutral-800 whitespace-pre-line mb-2">{note.main}</div>
          <div className="text-sm text-neutral-700 font-semibold mb-1">Bals</div>
          {note.bals && note.bals.length > 0 && (
            <ol className="list-decimal list-inside text-sm text-neutral-800 mb-2">
              {note.bals.map((bal, idx) => (
                <li key={idx}>{bal}</li>
              ))}
            </ol>
          )}
          {note.tehai && (
            <>
              <div className="text-sm text-neutral-700 font-semibold mb-1">Tehai</div>
              <div className="text-sm text-neutral-800 whitespace-pre-line">{note.tehai}</div>
            </>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-800">{note.content}</p>
      )}
      <p className="text-sm text-neutral-800">
        <strong>Taal:</strong> {note.taal}
      </p>
      <p className="text-sm text-neutral-800">
        <strong>Structure:</strong> {note.structure.charAt(0).toUpperCase() + note.structure.slice(1)}
      </p>
      <p className="text-sm text-neutral-500">
        <strong>Date Modified:</strong>{" "}
        {note.date_modified
          ? new Date(note.date_modified).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </p>
      <button
        onClick={() => handleEditClick(note)}
        className="px-4 py-2 bg-blue-600 text-black rounded mr-2"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteNote(note.id)}
        className="px-4 py-2 bg-red-600 text-black rounded"
      >
        Delete
      </button>
    </div>
  );
}
