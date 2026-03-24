// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import PeoplePage from "./pages/PeoplePage.jsx";

import DebtCrediPage from "./pages/DebtCreditPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import IncomeExpensePage from "./pages/IncomeExpensePage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { getAuthHeaders, getAuthToken } from "./components/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsLoggedIn(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/dashboard", {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setIsCheckingAuth(false);
          return;
        }

        setIsLoggedIn(true);
      } catch (err) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    validateToken();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Checking login...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* --- Navbar (only show if logged in) --- */}
        {isLoggedIn && (
          <nav className="bg-white shadow-md p-4 flex gap-4 justify-center">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
              Dashboard
            </Link>
            <Link
              to="/people"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
              People
            </Link>
            <Link
              to="/add"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
              Add Debt/Credit
            </Link>
            <Link
              to="/income-expense"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
              Income/Expense
            </Link>
            <Link
              to="/analytics"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
              Analytics
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </nav>
        )}

        {/* --- Page Content --- */}
        <div className="flex-grow p-4">
          <Routes>
            {/* Login Route */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <LoginPage setIsLoggedIn={setIsLoggedIn} />
                )
              }
            />

            {/* Register Route */}
            <Route
              path="/register"
              element={
                isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage />
              }
            />

            {/* Explicit Login Route (for links) */}
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <LoginPage setIsLoggedIn={setIsLoggedIn} />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/people"
              element={isLoggedIn ? <PeoplePage /> : <Navigate to="/" />}
            />
            <Route
              path="/add"
              element={isLoggedIn ? <DebtCrediPage /> : <Navigate to="/" />}
            />
            <Route
              path="/income-expense"
              element={isLoggedIn ? <IncomeExpensePage /> : <Navigate to="/" />}
            />
            <Route
              path="/analytics"
              element={isLoggedIn ? <AnalyticsPage /> : <Navigate to="/" />}
            />

            {/* Fallback */}
            <Route
              path="*"
              element={
                <div className="text-center text-gray-500">Page Not Found</div>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
