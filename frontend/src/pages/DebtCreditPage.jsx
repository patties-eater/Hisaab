// src/pages/DebtCreditPage.jsx

import React, { useEffect, useState } from "react";
import DebtCreditForm from "../components/DebtCreditForm";
import DebtCreditTable from "../components/DebtCreditTable";
import { getAuthHeaders } from "../components/api";
import { useI18n } from "../i18n";

const formatCurrency = (value) => {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });
};

export default function DebtCreditPage() {
  const { t } = useI18n();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingRecordId, setClosingRecordId] = useState(null);
  const [error, setError] = useState("");

  const fetchRecords = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/debt-credit", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.success) {
        setRecords(data.data);
        setError("");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(t("debtCreditPage.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Summary calculations
  const activeRecords = records.filter(
    (record) => (record.status || "active") === "active",
  );

  const totalDebt = activeRecords
    .filter((r) => r.type === "debt")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalCredit = activeRecords
    .filter((r) => r.type === "credit")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const netBalance = totalCredit - totalDebt;

  const handleCloseRecord = async (record, closeDate) => {
    const confirmed = window.confirm(
      record.type === "credit"
        ? t("debtCreditPage.confirmCredit")
        : t("debtCreditPage.confirmDebt"),
    );

    if (!confirmed) {
      return;
    }

    setClosingRecordId(record.id);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/debt-credit/${record.id}/close`,
        {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ closeDate }),
        },
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.message || t("debtCreditPage.clearError"));
        return;
      }

      await fetchRecords();
    } catch (err) {
      console.error("Close record error:", err);
      setError(t("debtCreditPage.clearError"));
    } finally {
      setClosingRecordId(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <h3 className="text-sm font-bold text-red-600 uppercase">
            {t("debtCreditPage.totalDebt")}
          </h3>
          <p className="text-2xl font-bold text-red-700 mt-2">
            {formatCurrency(totalDebt)}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-sm font-bold text-green-600 uppercase">
            {t("debtCreditPage.totalCredit")}
          </h3>
          <p className="text-2xl font-bold text-green-700 mt-2">
            {formatCurrency(totalCredit)}
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-600 uppercase">
            {t("debtCreditPage.netPosition")}
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form + Table */}
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <DebtCreditForm onSuccess={fetchRecords} />

        <div className="lg:col-span-2">
          <DebtCreditTable
            records={records}
            loading={loading}
            onCloseRecord={handleCloseRecord}
            closingRecordId={closingRecordId}
          />
        </div>
      </div>
    </div>
  );
}
