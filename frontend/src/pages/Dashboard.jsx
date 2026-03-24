import React, { useEffect, useState } from "react";
import { getAuthHeaders } from "../components/api";

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

export default function Dashboard() {
  const [data, setData] = useState({
    incomeTotal: 0,
    expenseTotal: 0,
    debtTotal: 0,
    creditTotal: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: getAuthHeaders(),
        });
        const result = await res.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(data.incomeTotal)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(data.expenseTotal)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Debtors</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(data.debtTotal)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Creditors</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.creditTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
