import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl, getFriendlyErrorMessage, setAuthSession } from "../components/api";

export default function AdminLoginPage({ setAuthState }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/auth/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          getFriendlyErrorMessage({
            status: res.status,
            defaultMessage: "We could not open the admin room. Please try again.",
          }),
        );
        return;
      }

      setAuthSession({ token: data.token, role: "admin" });
      setAuthState({ isLoggedIn: true, role: "admin" });
    } catch {
      setError("Server is busy right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-amber-400">
          Moderator Access
        </p>
        <h2 className="mt-4 text-center text-3xl font-extrabold">
          Admin Control Room
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Sign in with your admin user ID and password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-200">
                Admin User ID
              </label>
              <input
                id="userId"
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Open Admin Dashboard"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <Link to="/login" className="text-amber-300 hover:text-amber-200">
              Back to user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
