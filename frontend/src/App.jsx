import { useState, useEffect } from "react";
import Header from "./components/Header";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";

// Helper: fetch with timeout
function fetchWithTimeout(resource, options = {}, timeout = 40000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export default function App() {
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
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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
      // Optionally decode token for username, or fetch user info
      setUser({ username: authForm.username });
      localStorage.setItem("jwt", token);
    } else {
      setUser(null);
      localStorage.removeItem("jwt");
    }
  }, [token]);

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const endpoint =
      authMode === "login"
        ? "https://flask-backend-2tg6.onrender.com/login"
        : "https://flask-backend-2tg6.onrender.com/register";
    fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authForm),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          setUser({ username: authForm.username });
          setShowAuthModal(false);
          setAuthForm({ username: "", password: "" });
        } else {
          throw new Error(data.message || "Authentication failed");
        }
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => setAuthLoading(false));
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("jwt");
  };

  // Fetch notes from the backend
  useEffect(() => {
    setError("");
    setLoading(true);
    fetchWithTimeout("https://flask-backend-2tg6.onrender.com/notes")
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
  }, []);

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
    fetchWithTimeout(`https://flask-backend-2tg6.onrender.com/notes/${id}`, {
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
    fetchWithTimeout(`https://flask-backend-2tg6.onrender.com/notes/${editingNoteId}`, {
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
    fetchWithTimeout("https://flask-backend-2tg6.onrender.com/notes", {
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
      {/* --- Auth Modal --- */}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs border border-neutral-200">
            <h2 className="text-xl font-bold mb-4 text-center">
              {authMode === "login" ? "Login" : "Register"}
            </h2>
            <form onSubmit={handleAuthSubmit}>
              <input
                className="w-full mb-3 p-2 rounded bg-neutral-100 border border-neutral-300 focus:outline-none"
                type="text"
                name="username"
                placeholder="Username"
                value={authForm.username}
                onChange={handleAuthInputChange}
                required
                autoFocus
              />
              <input
                className="w-full mb-3 p-2 rounded bg-neutral-100 border border-neutral-300 focus:outline-none"
                type="password"
                name="password"
                placeholder="Password"
                value={authForm.password}
                onChange={handleAuthInputChange}
                required
              />
              {authError && (
                <div className="text-red-600 text-sm mb-2 text-center">{authError}</div>
              )}
              <button
                className="w-full py-2 rounded bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition mb-2"
                type="submit"
                disabled={authLoading}
              >
                {authLoading ? "Loading..." : authMode === "login" ? "Login" : "Register"}
              </button>
            </form>
            <div className="text-center mt-2">
              <button
                className="text-neutral-500 hover:underline text-sm"
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              >
                {authMode === "login"
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </button>
            </div>
            <button
              className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close auth modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <Header
        taals={taals}
        selectedTaal={selectedTaal}
        handleFilterChange={handleFilterChange}
        user={user}
        onLoginClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
        onRegisterClick={() => { setAuthMode("register"); setShowAuthModal(true); }}
        onLogoutClick={handleLogout}
      />
      <main className="grid grid-cols-4 gap-4 p-6 w-full h-full">
        {user && showNewNote && !editingNoteId ? (
          <NoteForm
            newNote={newNote}
            handleInputChange={handleInputChange}
            handleFormSubmit={handleFormSubmit}
            isEditing={false}
          />
        ) : editingNoteId && user ? (
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
          handleEditClick={user ? handleEditClick : null}
          handleEditInputChange={handleEditInputChange}
          handleSaveEdit={handleSaveEdit}
          handleDeleteNote={user ? handleDeleteNote : null}
          setEditingNoteId={setEditingNoteId}
          isReadOnly={!user}
        />
      </main>
    </div>
  );
}