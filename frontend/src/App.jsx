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
  apiUrl,
  getStoredAccountMode,
  getAuthToken,
  getStoredRole,
  setStoredAccountMode,
  setStoredLanguage,
} from "./components/api";
import { AccountModeProvider, useAccountMode } from "./accountMode";
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

function mobileNavLinkClasses({ isActive }) {
  return `min-w-[64px] rounded-full px-3 py-2 text-center text-xs font-semibold leading-tight transition ${
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
  }`;
}

function MobileNavItem({ to, label, children, onClick }) {
  return (
    <NavLink to={to} className={mobileNavLinkClasses} onClick={onClick}>
      <span className="block">{children}</span>
      <span className="block text-[10px] opacity-85">{label}</span>
    </NavLink>
  );
}

function MobileMoreButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[64px] rounded-full px-3 py-2 text-center text-xs font-semibold leading-tight transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <span className="block">M</span>
      <span className="block text-[10px] opacity-85">{label}</span>
    </button>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white shadow-sm">
        H
      </div>
      <div className="leading-tight">
        <p className="text-sm font-black tracking-wide text-slate-900">Hisaab</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Finance</p>
      </div>
    </div>
  );
}

function MobileBrandBar({ dark = false }) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b px-3 md:hidden ${
        dark ? "border-slate-800 bg-slate-900/95 backdrop-blur" : "border-slate-200 bg-white/95 backdrop-blur"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shadow-sm ${dark ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-white"}`}>
          H
        </div>
        <div className="leading-tight">
          <p className={`text-xs font-black tracking-wide ${dark ? "text-white" : "text-slate-900"}`}>Hisaab</p>
        </div>
      </div>
    </div>
  );
}

function UserNav({ onLogout }) {
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMore = () => setMoreOpen(false);

  return (
    <>
      <MobileBrandBar />
      <nav className="fixed inset-x-0 top-0 z-50 hidden border-b border-slate-200 bg-white/95 shadow-md backdrop-blur md:block">
        <div className="flex items-center gap-4 px-4 py-3">
          <BrandMark />
          <div className="flex flex-1 gap-2 overflow-x-auto md:justify-center">
            <NavLink to="/dashboard" className={navLinkClasses}>
              {t("nav.dashboard")}
            </NavLink>
            <NavLink to="/people" className={navLinkClasses}>
              {t("nav.people")}
            </NavLink>
            <NavLink to="/add" className={navLinkClasses}>
              {t("nav.debtCredit")}
            </NavLink>
            <NavLink to="/income-expense" className={navLinkClasses}>
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
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            {t("nav.logout")}
          </button>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-3">
          <MobileNavItem to="/dashboard" label={t("navShort.dashboard")} onClick={closeMore}>
            {t("navShort.dashboardIcon")}
          </MobileNavItem>
          <MobileNavItem to="/people" label={t("navShort.people")} onClick={closeMore}>
            {t("navShort.peopleIcon")}
          </MobileNavItem>
          <MobileNavItem to="/add" label={t("navShort.debtCredit")} onClick={closeMore}>
            {t("navShort.debtCreditIcon")}
          </MobileNavItem>
          <MobileNavItem to="/income-expense" label={t("navShort.incomeExpense")} onClick={closeMore}>
            {t("navShort.incomeExpenseIcon")}
          </MobileNavItem>
          <MobileMoreButton
            active={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
            label={t("navShort.more")}
          />
        </div>
        {moreOpen ? (
          <div className="border-t border-slate-200 bg-white px-3 pb-4 pt-3">
            <div className="grid gap-2">
              <NavLink
                to="/analytics"
                onClick={closeMore}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
              >
                {t("nav.analytics")}
              </NavLink>
              <NavLink
                to="/audit"
                onClick={closeMore}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
              >
                {t("nav.audit")}
              </NavLink>
              <NavLink
                to="/settings"
                onClick={closeMore}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
              >
                {t("nav.settings")}
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  closeMore();
                  onLogout();
                }}
                className="rounded-2xl bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-600"
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>
        ) : null}
      </nav>
    </>
  );
}

function AdminNav({ onLogout }) {
  const { t } = useI18n();

  return (
    <>
      <MobileBrandBar dark />
      <nav className="fixed inset-x-0 top-0 z-50 hidden border-b border-slate-800 bg-slate-900/95 shadow-md backdrop-blur md:block">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-slate-950 shadow-sm">
              H
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black tracking-wide text-white">Hisaab</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Admin</p>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <NavLink to="/admin/dashboard" className={adminNavLinkClasses}>
              {t("nav.adminDashboard")}
            </NavLink>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-slate-800 hover:text-rose-200"
          >
            {t("nav.logout")}
          </button>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-900/95 shadow-[0_-8px_24px_rgba(15,23,42,0.18)] backdrop-blur md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-3">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `min-w-max rounded-full px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`
            }
          >
            {t("nav.adminDashboard")}
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="min-w-max rounded-full bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
          >
            {t("nav.logout")}
          </button>
        </div>
      </nav>
    </>
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
  const { setAccountMode } = useAccountMode();
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
      const storedAccountMode = getStoredAccountMode();

      if (!token) {
        setAuthState({ isLoggedIn: false, role: null });
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch(apiUrl("/api/auth/me"), {
          headers: getAuthHeaders(),
        });

        const result = await res.json();

        if (!res.ok) {
          handleLogout();
          return;
        }

        const role = result.data?.role || storedRole || "user";
        const preferredLanguage = result.data?.preferredLanguage;
        const preferredAccountMode = result.data?.preferredAccountMode || storedAccountMode;

        if (preferredLanguage) {
          applyLanguage(preferredLanguage);
          setStoredLanguage(preferredLanguage);
        }

        setAccountMode(preferredAccountMode);
        setStoredAccountMode(preferredAccountMode);

        setAuthState({ isLoggedIn: true, role });
      } catch {
        handleLogout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    validateToken();
  }, [applyLanguage, setAccountMode]);

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

        <div className="flex-grow pb-24 pt-16 md:pb-0 md:pt-20">
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
      <AccountModeProvider>
        <AppShell />
      </AccountModeProvider>
    </I18nProvider>
  );
}
