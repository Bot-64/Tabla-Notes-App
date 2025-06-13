import React, { useState, useEffect } from "react";

const STRUCTURE_OPTIONS = [
  { value: "theka", label: "Theka" },
  { value: "peshkar", label: "Peshkar" },
  { value: "kaida", label: "Kaida" },
  { value: "rela", label: "Rela" },
  { value: "mukhda", label: "Mukhda" },
  { value: "chakradhar", label: "Chakradhar" },
];

// Helper: auto-capitalize sentences
function autoCapitalize(text) {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
}

// Helper: capitalize every word
function capitalizeWords(text) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper: handle Shift key to insert ' | '
function handleShiftInsert(e, value, onChange) {
  if (e.key === 'Shift') {
    e.preventDefault();
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + '| ' + value.slice(end);
    // Move cursor after inserted ' | '
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 3;
    }, 0);
    onChange({ target: { name: textarea.name, value: newValue } });
  }
}

export default function NoteForm({ newNote, handleInputChange, handleFormSubmit, isEditing }) {
  const [bals, setBals] = useState(newNote.bals || []);

  // Keep bals in sync with newNote.bals (for edit mode)
  useEffect(() => {
    setBals(newNote.bals || []);
  }, [newNote.bals]);

  // Reset bals if structure changes to something else
  const handleStructureChange = (e) => {
    handleInputChange(e);
    const val = e.target.value;
    if (!["peshkar", "kaida", "rela"].includes(val)) {
      setBals([]);
    }
  };

  const handleMainChange = (e) => {
    handleInputChange({ target: { name: "main", value: e.target.value } });
  };
  const handleTehaiChange = (e) => {
    handleInputChange({ target: { name: "tehai", value: e.target.value } });
  };
  const handleBalChange = (idx, e) => {
    const newBals = [...bals];
    newBals[idx] = e.target.value;
    setBals(newBals);
    handleInputChange({ target: { name: "bals", value: newBals } });
  };
  const handleAddBal = () => {
    setBals((prev) => {
      const updated = [...prev, ""];
      handleInputChange({ target: { name: "bals", value: updated } });
      return updated;
    });
  };
  const handleDeleteBal = (idx) => {
    setBals((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      handleInputChange({ target: { name: "bals", value: updated } });
      return updated;
    });
  };

  const isSplitStructure = ["peshkar", "kaida", "rela"].includes(newNote.structure);

  return (
    <section className="col-span-4 mb-6">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white/60 backdrop-blur-md border border-neutral-200 shadow-xl p-6 rounded-2xl transition-colors duration-300"
      >
        <h2 className="text-lg font-bold mb-4 drop-shadow-lg text-neutral-900">{isEditing ? "Editing Note" : "Add New Note"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={newNote.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="p-2 rounded border focus:ring-2 focus:ring-neutral-800 transition-all bg-white text-neutral-900 border-neutral-300"
            required
          />
          <input
            type="text"
            name="taal"
            value={newNote.taal}
            onChange={handleInputChange}
            placeholder="Taal"
            className="p-2 rounded border focus:ring-2 focus:ring-neutral-800 transition-all bg-white text-neutral-900 border-neutral-300"
          />
          {/* Structure Dropdown */}
          <div className="relative w-full">
            <select
              name="structure"
              value={newNote.structure}
              onChange={handleStructureChange}
              className="appearance-none rounded-lg px-5 py-2 pr-10 border focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all w-full capitalize bg-white text-neutral-900 border-neutral-300"
              required
            >
              <option value="">Select Structure</option>
              {STRUCTURE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="capitalize">{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Content or Split Fields */}
          {isSplitStructure ? (
            <div className="col-span-2 flex flex-col gap-2">
              <textarea
                name="main"
                value={newNote.main || ""}
                onChange={e => {
                  const value = capitalizeWords(e.target.value);
                  handleMainChange({ target: { name: "main", value } });
                }}
                onKeyDown={e => handleShiftInsert(e, newNote.main || "", handleMainChange)}
                placeholder="Main"
                className="p-2 rounded border mb-2 focus:ring-2 focus:ring-neutral-800 transition-all bg-white text-neutral-900 border-neutral-300"
                required
              />
              {/* Bals List */}
              {bals.map((bal, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <textarea
                    name={`bal${idx}`}
                    value={bal}
                    onChange={e => {
                      const value = capitalizeWords(e.target.value);
                      handleBalChange(idx, { target: { name: `bal${idx}`, value } });
                    }}
                    onKeyDown={e => handleShiftInsert(e, bal, ev => handleBalChange(idx, ev))}
                    placeholder={`Bal ${idx + 1}`}
                    className="p-2 rounded border w-full h-24 focus:ring-2 focus:ring-neutral-800 transition-all bg-white text-neutral-900 border-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBal(idx)}
                    className="px-2 py-1 bg-neutral-200 text-black rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <textarea
                name="tehai"
                value={newNote.tehai || ""}
                onChange={e => {
                  const value = capitalizeWords(e.target.value);
                  handleTehaiChange({ target: { name: "tehai", value } });
                }}
                onKeyDown={e => handleShiftInsert(e, newNote.tehai || "", handleTehaiChange)}
                placeholder="Tehai"
                className="p-2 rounded border mb-2 focus:ring-2 focus:ring-neutral-800 transition-all bg-white text-neutral-900 border-neutral-300"
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleAddBal}
                  className="px-4 py-2 bg-neutral-900 text-black rounded w-fit hover:bg-neutral-800 transition"
                >
                  Add Bal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-black rounded hover:bg-neutral-800 transition"
                >
                  {isEditing ? "Save Note" : "Add Note"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                name="content"
                value={newNote.content}
                onChange={e => {
                  const value = capitalizeWords(e.target.value);
                  handleInputChange({ target: { name: "content", value } });
                }}
                onKeyDown={e => handleShiftInsert(e, newNote.content, handleInputChange)}
                placeholder="Content"
                className="p-2 rounded border col-span-2 focus:ring-2 focus:ring-neutral-800 transition-all bg-white text-neutral-900 border-neutral-300"
                required
              />
            </>
          )}
        </div>
        {/* Only show the bottom Add/Save Note button if not split structure */}
        {!isSplitStructure && (
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-black rounded hover:bg-neutral-800 transition"
            >
              {isEditing ? "Save Note" : "Add Note"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
