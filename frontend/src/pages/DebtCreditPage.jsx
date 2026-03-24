// src/pages/DebtCreditPage.jsx

import React, { useEffect, useState } from "react";
import DebtCreditForm from "../components/DebtCreditForm";
import DebtCreditTable from "../components/DebtCreditTable";
import { getAuthHeaders } from "../components/api";

const formatCurrency = (value) => {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });
};

export default function DebtCreditPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/debt-credit", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Summary calculations
  const totalDebt = records
    .filter((r) => r.type === "debt")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalCredit = records
    .filter((r) => r.type === "credit")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const netBalance = totalCredit - totalDebt;

  return (
    <div className="p-8 space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <h3 className="text-sm font-bold text-red-600 uppercase">
            Total Debt
          </h3>
          <p className="text-2xl font-bold text-red-700 mt-2">
            {formatCurrency(totalDebt)}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-sm font-bold text-green-600 uppercase">
            Total Credit
          </h3>
          <p className="text-2xl font-bold text-green-700 mt-2">
            {formatCurrency(totalCredit)}
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-600 uppercase">
            Net Position
          </h3>
          <p
            className={`text-2xl font-bold mt-2 ${
              netBalance >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {/* Form + Table */}
      <div className="grid lg:grid-cols-3 gap-8">
        <DebtCreditForm onSuccess={fetchRecords} />

        <div className="lg:col-span-2">
          <DebtCreditTable records={records} loading={loading} />
        </div>
      </div>
    </div>
  );
}
