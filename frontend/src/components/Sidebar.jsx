import React from "react";
import tablaPic from "../assets/TablasPicReal.png";

export default function Sidebar({ taals, selectedTaal, handleFilterChange, user }) {
  return (
    <aside className="h-full w-64 bg-[var(--color-bg-accent)] border-r border-neutral-200 flex flex-col p-6 gap-8 shadow-md">
      <div className="flex flex-col items-center gap-2 mb-8">
        <img src={tablaPic} alt="Tabla Icon" className="w-20 h-20 mb-2" />
        <span className="font-serif text-xl text-[var(--color-brown)] tracking-tight">Tabla Notes</span>
        {user && (
          <span className="text-sm text-neutral-700 mt-1">Welcome, <b>{user.username}</b></span>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-2">Filter by Taal</label>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleFilterChange("All")}
            className={`text-left px-4 py-2 rounded-lg border transition-all ${
              selectedTaal === "All"
                ? "bg-[var(--color-indigo)] text-amber-800"
                : "bg-white text-black border-neutral-300"
            }`}
          >
            All Notes
          </button>
          {taals.map((taal, idx) => (
            <button
              key={idx}
              onClick={() => handleFilterChange(taal)}
              className={`text-left px-4 py-2 rounded-lg border transition-all ${
                selectedTaal === taal
                  ? "bg-[var(--color-indigo)] text-amber-800"
                  : "bg-white text-black border-neutral-300"
              }`}
            >
              {taal}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto text-xs text-neutral-400 text-center">
        <span>Tabla Notes App &#9836; 2025</span>
        <br />
        <span>Vihaan Kerekatte</span>
      </div>
    </aside>
  );
}
