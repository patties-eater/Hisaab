import React, { useState, useMemo } from "react";

// --- Helper Functions & Constants ---
const formatCurrency = (value) => {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const CATEGORIES = [
  "Salary",
  "Food",
  "Utilities",
  "Transport",
  "Entertainment",
  "Investment",
  "Freelance",
  "Other",
];

const initialTransactions = [
  {
    id: 1,
    type: "Income",
    amount: 75000,
    category: "Salary",
    date: "2023-10-01",
    notes: "Monthly salary",
  },
  {
    id: 2,
    type: "Expense",
    amount: 2500,
    category: "Food",
    date: "2023-10-05",
    notes: "Groceries",
  },
  {
    id: 3,
    type: "Expense",
    amount: 5000,
    category: "Utilities",
    date: "2023-10-07",
    notes: "Electricity bill",
  },
  {
    id: 4,
    type: "Expense",
    amount: 1200,
    category: "Transport",
    date: "2023-10-10",
    notes: "Metro card recharge",
  },
  {
    id: 5,
    type: "Income",
    amount: 10000,
    category: "Freelance",
    date: "2023-10-15",
    notes: "Project payment",
  },
  {
    id: 6,
    type: "Expense",
    amount: 800,
    category: "Entertainment",
    date: "2023-10-20",
    notes: "Movie tickets",
  },
];

const IncomeExpensePage = () => {
  // --- State Management ---
  const [transactions, setTransactions] = useState(initialTransactions);
  const [formData, setFormData] = useState({
    type: "Expense",
    amount: "",
    category: CATEGORIES[1], // Default to 'Food' for expense
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // --- Derived State / Calculations using useMemo for performance ---
const { totalIncome, totalExpense, netBalance } = useMemo(() => {
  const result = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "Income") {
        acc.totalIncome += tx.amount;
      } else {
        acc.totalExpense += tx.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  result.netBalance = result.totalIncome - result.totalExpense;

  return result;
}, [transactions]);

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
    };

    setTransactions((prev) =>
      [newTransaction, ...prev].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    );

    // Reset form
    setFormData({
      type: "Expense",
      amount: "",
      category: CATEGORIES[1],
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Income & Expense Tracker
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Log and review your financial transactions.
          </p>
        </header>

        {/* 3️⃣ Summary / Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpense)}
            icon="💸"
            color="red"
          />
          <StatCard
            title="Net Balance"
            value={formatCurrency(totalIncome - totalExpense)}
            icon={totalIncome - totalExpense >= 0 ? "📈" : "📉"}
            color={totalIncome - totalExpense >= 0 ? "blue" : "red"}
          />
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1️⃣ Form to Add Transactions */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Add New Transaction
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                {/* Amount */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add a note..."
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 mt-4 rounded-lg font-bold text-white shadow-md bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200"
                >
                  Add Transaction
                </button>
              </form>
            </div>
          </aside>

          {/* 2️⃣ Transaction List */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Transactions
                </h2>
                {/* Optional: Filters can be added here */}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap">
                          <div className="font-medium text-gray-800">
                            {tx.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tx.notes}
                          </div>
                        </td>
                        <td
                          className={`p-4 text-sm font-bold text-right whitespace-nowrap ${
                            tx.type === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "Income" ? "+" : "-"}{" "}
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                    No transactions yet. Add one to get started!
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

// A simple reusable StatCard component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: "border-green-400",
    red: "border-red-400",
    blue: "border-blue-400",
  };
  const iconBg = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colorClasses[color]} hover:shadow-lg transition-shadow duration-300 flex justify-between items-center`}
    >
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full text-2xl ${iconBg[color]}`}>{icon}</div>
    </div>
  );
};

export default IncomeExpensePage;
