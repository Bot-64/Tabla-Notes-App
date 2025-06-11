import React from "react";

export default function Header({ taals, selectedTaal, handleFilterChange }) {
  return (
    <header className="p-6 bg-white shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold text-black">Tabla Notes</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            value={selectedTaal}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="appearance-none bg-white text-black rounded-lg px-5 py-2 pr-10 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
      </div>
    </header>
  );
}
