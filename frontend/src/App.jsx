// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import PeoplePage from "./pages/PeoplePage.jsx";
import DebtCreditForm from "./components/DebtCreditForm.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import IncomeExpensePage from "./pages/IncomeExpensePage.jsx";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* --- Navbar --- */}
        <nav className="bg-white shadow-md p-4 flex gap-4 justify-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-semibold">Dashboard</Link>
          <Link to="/people" className="text-gray-700 hover:text-blue-600 font-semibold">People</Link>
          <Link to="/add" className="text-gray-700 hover:text-blue-600 font-semibold">Add Debt/Credit</Link>
          <Link to="/income-expense" className="text-gray-700 hover:text-blue-600 font-semibold">Income/Expense</Link>
          <Link to="/analytics" className="text-gray-700 hover:text-blue-600 font-semibold">Analytics</Link>
        </nav>

        {/* --- Page Content --- */}
        <div className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/add" element={<DebtCreditForm />} />
            <Route path="/income-expense" element={<IncomeExpensePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            {/* Fallback */}
            <Route path="*" element={<div className="text-center text-gray-500">Page Not Found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}