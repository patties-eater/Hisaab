import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import {
  clearAuthSession,
  getAuthHeaders,
  getAuthToken,
  getStoredRole,
  setStoredLanguage,
} from "./components/api";
import { I18nProvider, useI18n } from "./i18n";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const PeoplePage = lazy(() => import("./pages/PeoplePage.jsx"));
const DebtCrediPage = lazy(() => import("./pages/DebtCreditPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const IncomeExpensePage = lazy(() => import("./pages/IncomeExpensePage.jsx"));
const AuditPage = lazy(() => import("./pages/AuditPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));
const LoginPage = lazy(() => import("./pages/loginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));

function navLinkClasses({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-gray-700 hover:bg-slate-100 hover:text-blue-600"
  }`;
}

function adminNavLinkClasses({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-amber-400 text-slate-950 shadow-sm"
      : "text-slate-100 hover:bg-slate-800 hover:text-amber-300"
  }`;
}

function UserNav({ onLogout }) {
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 md:justify-center">
        <NavLink to="/dashboard" className={navLinkClasses}>
        {t("nav.dashboard")}
        </NavLink>
        <NavLink to="/people" className={navLinkClasses}>
        {t("nav.people")}
        </NavLink>
        <NavLink to="/add" className={navLinkClasses}>
        {t("nav.debtCredit")}
        </NavLink>
        <NavLink
        to="/income-expense"
        className={navLinkClasses}
      >
        {t("nav.incomeExpense")}
        </NavLink>
        <NavLink to="/analytics" className={navLinkClasses}>
        {t("nav.analytics")}
        </NavLink>
        <NavLink to="/audit" className={navLinkClasses}>
        {t("nav.audit")}
        </NavLink>
        <NavLink to="/settings" className={navLinkClasses}>
        {t("nav.settings")}
        </NavLink>
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 md:ml-0"
        >
          {t("nav.logout")}
        </button>
      </div>
    </nav>
  );
}

function AdminNav({ onLogout }) {
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-900/95 shadow-md backdrop-blur">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 md:justify-center">
        <NavLink to="/admin/dashboard" className={adminNavLinkClasses}>
        {t("nav.adminDashboard")}
        </NavLink>
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto rounded-full px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-slate-800 hover:text-rose-200 md:ml-0"
        >
          {t("nav.logout")}
        </button>
      </div>
    </nav>
  );
}

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
      Loading page...
    </div>
  );
}

function AppShell() {
  const { applyLanguage } = useI18n();
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
        const preferredLanguage = result.data?.preferredLanguage;

        if (preferredLanguage) {
          applyLanguage(preferredLanguage);
          setStoredLanguage(preferredLanguage);
        }

        setAuthState({ isLoggedIn: true, role });
      } catch (err) {
        handleLogout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    validateToken();
  }, [applyLanguage]);

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

        <div className="flex-grow pt-20">
          <Suspense fallback={<RouteFallback />}>
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
                path="/audit"
                element={isUser ? <AuditPage /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />}
              />
              <Route
                path="/settings"
                element={isUser ? <SettingsPage /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />}
              />
              <Route
                path="/journal-entries"
                element={<Navigate to="/audit" replace />}
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
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}
