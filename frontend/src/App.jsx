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
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import {
  clearAuthSession,
  getAuthHeaders,
  getAuthToken,
  getStoredRole,
} from "./components/api";

function UserNav({ onLogout }) {
  return (
    <nav className="bg-white shadow-md p-4 flex gap-4 justify-center">
      <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-semibold">
        Dashboard
      </Link>
      <Link to="/people" className="text-gray-700 hover:text-blue-600 font-semibold">
        People
      </Link>
      <Link to="/add" className="text-gray-700 hover:text-blue-600 font-semibold">
        Add Debt/Credit
      </Link>
      <Link
        to="/income-expense"
        className="text-gray-700 hover:text-blue-600 font-semibold"
      >
        Income/Expense
      </Link>
      <Link to="/analytics" className="text-gray-700 hover:text-blue-600 font-semibold">
        Analytics
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="text-red-600 hover:text-red-700 font-semibold"
      >
        Logout
      </button>
    </nav>
  );
}

function AdminNav({ onLogout }) {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 flex gap-4 justify-center">
      <Link to="/admin/dashboard" className="text-slate-100 hover:text-amber-300 font-semibold">
        Admin Dashboard
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="text-rose-400 hover:text-rose-300 font-semibold"
      >
        Logout
      </button>
    </nav>
  );
}

export default function App() {
  const [authState, setAuthState] = useState({ isLoggedIn: false, role: null });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleLogout = () => {
    clearAuthSession();
    setAuthState({ isLoggedIn: false, role: null });
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = getAuthToken();
      const storedRole = getStoredRole();

      if (!token) {
        setAuthState({ isLoggedIn: false, role: null });
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: getAuthHeaders(),
        });

        const result = await res.json();

        if (!res.ok) {
          handleLogout();
          return;
        }

        const role = result.data?.role || storedRole || "user";
        setAuthState({ isLoggedIn: true, role });
      } catch (err) {
        handleLogout();
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

  const isAdmin = authState.role === "admin";
  const isUser = authState.role === "user";

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {isUser && <UserNav onLogout={handleLogout} />}
        {isAdmin && <AdminNav onLogout={handleLogout} />}

        <div className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                authState.isLoggedIn ? (
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/login"
              element={
                authState.isLoggedIn ? (
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />
                ) : (
                  <LoginPage setAuthState={setAuthState} />
                )
              }
            />

            <Route
              path="/register"
              element={
                authState.isLoggedIn ? (
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />
                ) : (
                  <RegisterPage />
                )
              }
            />

            <Route
              path="/admin/login"
              element={
                authState.isLoggedIn ? (
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />
                ) : (
                  <AdminLoginPage setAuthState={setAuthState} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={isUser ? <Dashboard /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />}
            />
            <Route
              path="/people"
              element={isUser ? <PeoplePage /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />}
            />
            <Route
              path="/add"
              element={isUser ? <DebtCrediPage /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />}
            />
            <Route
              path="/income-expense"
              element={
                isUser ? <IncomeExpensePage /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />
              }
            />
            <Route
              path="/analytics"
              element={isUser ? <AnalyticsPage /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />}
            />

            <Route
              path="/admin/dashboard"
              element={isAdmin ? <AdminDashboardPage /> : <Navigate to={isUser ? "/dashboard" : "/admin/login"} />}
            />

            <Route
              path="*"
              element={<div className="text-center p-8 text-gray-500">Page Not Found</div>}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
