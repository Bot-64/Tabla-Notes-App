import { useState, useEffect } from "react";
import Header from "./components/Header";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import Auth from "./components/Auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper: fetch with timeout
function fetchWithTimeout(resource, options = {}, timeout = 40000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export default function App() {
  // Clear JWT on browser reload only
  const navType = performance.getEntriesByType("navigation")[0]?.type;
  if (navType === "reload") {
    localStorage.removeItem("jwt");
  }

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [taals, setTaals] = useState([]);
  const [selectedTaal, setSelectedTaal] = useState("All");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNote, setEditedNote] = useState({});
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    taal: "",
    structure: "",
  });
  const [showNewNote, setShowNewNote] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Auth state ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || "");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // or "register"

  // Helper: serialize split fields for backend
  function serializeNote(note) {
    if (["peshkar", "kaida", "rela"].includes(note.structure)) {
      return {
        ...note,
        content: JSON.stringify({
          main: note.main || "",
          tehai: note.tehai || "",
          bals: note.bals || [],
        }),
      };
    } else {
      return { ...note, content: note.content };
    }
  }

  // Helper: parse note content from backend
  function parseNote(note) {
    if (["peshkar", "kaida", "rela"].includes(note.structure)) {
      try {
        const parsed = JSON.parse(note.content);
        return {
          ...note,
          main: parsed.main || "",
          tehai: parsed.tehai || "",
          bals: parsed.bals || [],
        };
      } catch {
        return { ...note, main: "", tehai: "", bals: [] };
      }
    } else {
      return note;
    }
  }

  // --- Auth logic ---
  useEffect(() => {
    if (token) {
      setUser({ username: user?.username || "" });
      localStorage.setItem("jwt", token);
      // Fetch notes from the backend
      setError("");
      setLoading(true);
      const fetchNotes = () => {
        const url = `${BACKEND_URL}/notes`;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        fetchWithTimeout(url, { headers })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch notes");
            return response.json();
          })
          .then((data) => {
            const parsedNotes = data.map(parseNote);
            setNotes(parsedNotes);
            setFilteredNotes(parsedNotes);
            // Extract unique taals from the notes
            const uniqueTaals = [...new Set(parsedNotes.map((note) => note.taal))];
            setTaals(uniqueTaals);
            setLoading(false);
          })
          .catch((error) => {
            if (error.name === "AbortError") {
              setError("Request timed out. Please try again later.");
            } else {
              setError("Error fetching notes: " + error.message);
            }
            setLoading(false);
          });
      };
      fetchNotes();
      // Re-fetch notes when token changes (login/logout)
    } else {
      setUser(null);
      localStorage.removeItem("jwt");
      setNotes([]);
      setFilteredNotes([]);
      setTaals([]);
    }
  }, [token]);

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("jwt");
  };

  // Handle filtering notes by taal
  const handleFilterChange = (taal) => {
    setSelectedTaal(taal);
    if (taal === "All") {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(notes.filter((note) => note.taal === taal));
    }
  };

  // Handle deleting a note
  const handleDeleteNote = (id) => {
    setError("");
    fetchWithTimeout(`${BACKEND_URL}/notes/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (response.ok) {
          setNotes((prev) => prev.filter((note) => note.id !== id));
          setFilteredNotes((prev) => prev.filter((note) => note.id !== id));
        } else {
          throw new Error("Failed to delete note");
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          setError("Delete request timed out. Please try again.");
        } else {
          setError("Error deleting note: " + error.message);
        }
      });
  };

  // Handle editing a note
  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
    setEditedNote(parseNote(note));
    setShowNewNote(false); // Hide new note form while editing
    // Move the editing note to the top
    setFilteredNotes((prev) => [note, ...prev.filter((n) => n.id !== note.id)]);
    setNotes((prev) => [note, ...prev.filter((n) => n.id !== note.id)]);
  };

  // Handle input changes for the edited note
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedNote((prev) => ({ ...prev, [name]: value }));
  };

  // Handle saving the edited note
  const handleSaveEdit = () => {
    setError("");
    const noteToSend = serializeNote(editedNote);
    fetchWithTimeout(`${BACKEND_URL}/notes/${editingNoteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(noteToSend),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to update note");
        }
      })
      .then((data) => {
        const parsed = parseNote(data);
        setNotes((prev) => [parsed, ...prev.filter((note) => note.id !== editingNoteId)]);
        setFilteredNotes((prev) => {
          if (selectedTaal && selectedTaal !== "All" && parsed.taal !== selectedTaal) {
            return prev.filter((note) => note.id !== editingNoteId);
          }
          return [parsed, ...prev.filter((note) => note.id !== editingNoteId)];
        });
        setEditingNoteId(null);
        setShowNewNote(true); // Show new note form again
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          setError("Update request timed out. Please try again.");
        } else {
          setError("Error updating note: " + error.message);
        }
      });
  };

  // Handle adding a new note
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");
    const noteToSend = serializeNote(newNote);
    fetchWithTimeout(`${BACKEND_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(noteToSend),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to add note");
        }
      })
      .then((data) => {
        const parsed = parseNote(data);
        setNotes((prev) => [parsed, ...prev]);
        setFilteredNotes((prev) => {
          if (selectedTaal && selectedTaal !== "All" && parsed.taal !== selectedTaal) {
            return prev;
          }
          return [parsed, ...prev];
        });
        if (parsed.taal && !taals.includes(parsed.taal)) {
          setTaals((prev) => [...prev, parsed.taal]);
        }
        setNewNote({ title: "", content: "", taal: "", structure: "" });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          setError("Add request timed out. Please try again.");
        } else {
          setError("Error adding note: " + error.message);
        }
      });
  };

  // Handle input changes for the new note
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={
      `min-h-screen w-screen h-screen transition-colors duration-300 ` +
      'bg-neutral-100 text-neutral-900'
    }>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg border border-red-300 text-center">
          {error}
        </div>
      )}
      {loading && !error && (
        <div className="bg-blue-100 text-blue-700 p-4 mb-4 rounded-lg border border-blue-300 text-center">
          Loading notes...
        </div>
      )}
      {/* --- Auth Modal (modular) --- */}
      <Auth
        show={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(data) => {
          setToken(data.token);
          setUser({ username: data.username });
          setShowAuthModal(false);
          // Notes will auto-refetch due to [token] dependency
        }}
      />
      <Header
        taals={taals}
        selectedTaal={selectedTaal}
        handleFilterChange={handleFilterChange}
        user={user}
        onLoginClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
        onRegisterClick={() => { setAuthMode("register"); setShowAuthModal(true); }}
        onLogoutClick={handleLogout}
      />
      {!user && (
        <div className="text-center mt-10 text-lg text-gray-700">
          Please log in or register to access notes.
        </div>
      )}
      {user && (
        <main className="grid grid-cols-4 gap-4 p-6 w-full h-full">
          {showNewNote && !editingNoteId ? (
            <NoteForm
              newNote={newNote}
              handleInputChange={handleInputChange}
              handleFormSubmit={handleFormSubmit}
              isEditing={false}
            />
          ) : editingNoteId ? (
            <NoteForm
              newNote={editedNote}
              handleInputChange={handleEditInputChange}
              handleFormSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              isEditing={true}
            />
          ) : (
            <div className="col-span-1" />
          )}
          <NoteList
            filteredNotes={filteredNotes.filter((note) => note.id !== editingNoteId)}
            editingNoteId={editingNoteId}
            editedNote={editedNote}
            handleEditClick={handleEditClick}
            handleEditInputChange={handleEditInputChange}
            handleSaveEdit={handleSaveEdit}
            handleDeleteNote={handleDeleteNote}
            setEditingNoteId={setEditingNoteId}
            isReadOnly={false}
          />
        </main>
      )}
    </div>
  );
}