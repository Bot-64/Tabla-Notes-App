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
  isReadOnly = false,
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
      </div>
    );
  }

  // View mode
  return (
    <div className="glassmorphic card-bg rounded-2xl shadow-xl p-8 mb-4 border border-neutral-200 transition-all duration-300">
      <h2 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight drop-shadow-sm">{note.title}</h2>
      <div className="flex gap-6 mb-4 text-base text-neutral-800 font-medium">
        <span><span className="font-semibold">Taal:</span> {note.taal}</span>
        <span><span className="font-semibold">Structure:</span> {note.structure.charAt(0).toUpperCase() + note.structure.slice(1)}</span>
      </div>
      <div className="bg-white/70 rounded-xl border border-neutral-200 p-4 mb-6 font-mono text-base whitespace-pre-wrap text-neutral-900 shadow-sm">
        {note.main || note.content}
        {Array.isArray(note.bals) && note.bals.length > 0 && (
          <>
            <br />
            <span className="font-semibold">Bals:</span>
            <ol className="list-decimal ml-6 mt-1">
              {note.bals.map((bal, idx) => {
                const lines = bal.split('\n');
                return (
                  <li key={idx} className="pl-0 list-inside whitespace-pre-line">
                    {lines.map((line, i) => (
                      <div key={i} style={i === 0 ? {} : { paddingLeft: '2em' }}>{line}</div>
                    ))}
                  </li>
                );
              })}
            </ol>
          </>
        )}
        {note.tehai && (
          <>
            <br />
            <span className="font-semibold">Tehai:</span>
            <br />
            {note.tehai}
          </>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-neutral-500 text-sm font-semibold">
          Date Modified: {note.date_modified && new Date(note.date_modified).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              className="border border-neutral-300 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-neutral-100 transition shadow-sm"
              onClick={() => handleEditClick(note)}
            >
              Edit
            </button>
            <button
              className="border border-neutral-300 bg-white text-neutral-700 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-100 transition shadow-sm"
              onClick={() => handleDeleteNote(note.id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
