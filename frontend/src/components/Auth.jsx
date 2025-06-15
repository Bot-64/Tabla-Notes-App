import React, { useState } from "react";

export default function Auth({
  show,
  mode,
  onClose,
  onAuthSuccess,
  initialMode = "login",
}) {
  const [authMode, setAuthMode] = useState(mode || initialMode);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Helper: fetch with timeout
  function fetchWithTimeout(resource, options = {}, timeout = 40000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  }

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
        if (data && data.token) {
          onAuthSuccess(data);
        } else {
          setAuthError(data.message || "Authentication failed");
        }
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => setAuthLoading(false));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs border border-neutral-200 relative">
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
            className="w-full py-2 rounded bg-neutral-900 text-black font-semibold hover:bg-neutral-800 transition mb-2"
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
          onClick={onClose}
          aria-label="Close auth modal"
        >
          ×
        </button>
      </div>
    </div>
  );
}
