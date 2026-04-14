// src/pages/DebtCreditPage.jsx

import React, { useCallback, useEffect, useState } from "react";
import { useAccountMode } from "../accountMode";
import DebtCreditForm from "../components/DebtCreditForm";
import DebtCreditTable from "../components/DebtCreditTable";
import { apiUrl, getAuthHeaders, getFriendlyErrorMessage } from "../components/api";
import { useI18n } from "../i18n";

const formatCurrency = (value) => {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });
};

export default function DebtCreditPage() {
  const { isShopMode } = useAccountMode();
  const { t } = useI18n();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingRecordId, setClosingRecordId] = useState(null);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/debt-credit"), {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.success) {
        setRecords(data.data);
        setError("");
      }
    } catch {
      setError("Server is busy right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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
      isShopMode
        ? `Clear this ${record.type} on the selected date?`
        : record.type === "credit"
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
        apiUrl(`/api/debt-credit/${record.id}/close`),
        {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ closeDate }),
        },
      );
      const data = await res.json();

      if (!data.success) {
        setError(getFriendlyErrorMessage({ status: res.status, defaultMessage: t("debtCreditPage.clearError") }));
        return;
      }

      await fetchRecords();
    } catch {
      setError("Server is busy right now. Please try again in a moment.");
    } finally {
      setClosingRecordId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Debt / Credit</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Manage running balances</h1>
          </div>
          <p className="text-sm text-slate-500">Add, review, and close every debt or credit entry from one clean place.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            {t("debtCreditPage.totalDebt")}
          </h3>
          <p className="mt-2 text-2xl font-black text-red-700">
            {formatCurrency(totalDebt)}
          </p>
        </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
            {t("debtCreditPage.totalCredit")}
          </h3>
          <p className="mt-2 text-2xl font-black text-green-700">
            {formatCurrency(totalCredit)}
          </p>
        </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            {t("debtCreditPage.netPosition")}
          </h3>
          <p
            className={`mt-2 text-2xl font-black ${
              netBalance >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form + Table */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
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
