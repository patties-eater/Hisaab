import React, { useState } from "react";
import { Link } from "react-router-dom";
import { setAuthSession, setStoredLanguage } from "../components/api";
import { useI18n } from "../i18n";

export default function LoginPage({ setAuthState }) {
  const { applyLanguage } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.token) {
        if (data.preferredLanguage) {
          applyLanguage(data.preferredLanguage);
          setStoredLanguage(data.preferredLanguage);
        }

        setAuthSession({ token: data.token, role: "user" });
        setAuthState({ isLoggedIn: true, role: "user" });
      }

      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(JSON.stringify({ error: err.message }, null, 2));
    }

    setLoading(false);
  };

  const handleDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setOutput(JSON.stringify({ error: "Login first" }, null, 2));
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(JSON.stringify({ error: err.message }, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Hisaab
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Manage your finances efficiently
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to Hisaab?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create an account
              </Link>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/admin/login"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Admin / Moderator Login
              </Link>
            </div>
          </div>

          {/* Debug/Dev Tools Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Developer Tools
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleDashboard}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Test Dashboard API
              </button>
            </div>
          </div>
        </div>

        {output && (
          <div className="mt-6 bg-gray-900 rounded-lg p-4 shadow-lg overflow-hidden">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">
              API Output
            </h3>
            <pre className="text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
