import React, { useState } from "react";

export default function Header({ taals, selectedTaal, handleFilterChange }) {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <header className="p-6 bg-white shadow-md flex justify-between items-center border-b border-neutral-200">
      <h1 className="text-2xl font-bold text-black tracking-tight">Tabla Notes</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            value={selectedTaal}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="appearance-none bg-white text-black rounded-lg px-5 py-2 pr-10 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all shadow-sm"
          >
            <option value="All">All Notes</option>
            {taals.map((taal, index) => (
              <option key={index} value={taal}>
                {taal}
              </option>
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
        <button
          className="ml-4 px-4 py-2 bg-neutral-100 text-black rounded-lg font-semibold border border-neutral-300 hover:bg-neutral-200 transition shadow-sm"
          onClick={() => setShowHowTo((prev) => !prev)}
        >
          How to Use
        </button>
      </div>
      {showHowTo && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-8 z-50 max-w-lg w-full text-left animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-neutral-900">How to Use Tabla Notes</h2>
          <ul className="list-disc ml-6 text-black space-y-2">
            <li><b>Add a Note:</b> Fill in the form and click <b>Add Note</b>. Use the structure dropdown for type of composition.</li>
            <li><b>Edit a Note:</b> Click <b>Edit</b> on a note card. Make changes and click <b>Save Note</b>.</li>
            <li><b>Delete a Note:</b> Click <b>Delete</b> on a note card to remove it.</li>
            <li><b>Filter by Taal:</b> Use the <b>All Notes</b> dropdown to view notes for a specific taal.</li>
            <li><b>Split Structures:</b> For Kaida, Peshkar, or Rela, use Main, Bals, and Tehai fields. Add and delete Bals as needed.</li>
            <li><b>Formatting:</b> Use Shift to automatically insert <code>"|"</code> in text fields. Sentences auto-capitalize.</li>
          </ul>
          <button
            className="mt-6 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
            onClick={() => setShowHowTo(false)}
          >
            Close
          </button>
        </div>
      )}
    </header>
  );
}
