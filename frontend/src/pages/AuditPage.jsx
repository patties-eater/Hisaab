import React, { useEffect, useMemo, useState } from "react";
import { getAuthHeaders } from "../components/api";

const AUDIT_SECTIONS = [
  {
    id: "journal",
    label: "Journal Entries",
    description: "Live balanced debit and credit vouchers",
    live: true,
  },
  {
    id: "ledger",
    label: "Ledger",
    description: "Account-wise posting summaries",
    live: false,
  },
  {
    id: "cashbook",
    label: "Cash Book",
    description: "Cash movement register",
    live: false,
  },
  {
    id: "bankbook",
    label: "Bank Book",
    description: "Bank receipt and payment view",
    live: false,
  },
  {
    id: "trialbalance",
    label: "Trial Balance",
    description: "Closing debit and credit checks",
    live: false,
  },
];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

function PlaceholderPanel({ section }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Audit Section
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        {section.label}
      </h2>
      <p className="mt-3 text-slate-600">{section.description}</p>
      <p className="mt-5 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
        UI ready. Live data coming next.
      </p>
    </div>
  );
}

function JournalPanel() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/accounting-journal", {
          headers: getAuthHeaders(),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load journal entries");
          return;
        }

        setVouchers(data.data);
        setError("");
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const filteredVouchers = useMemo(() => {
    if (filter === "all") return vouchers;
    return vouchers.filter((voucher) => voucher.source_type === filter);
  }, [vouchers, filter]);

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-gray-500 shadow-sm">Loading journal entries...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Vouchers</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{vouchers.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Debit Total</p>
          <p className="mt-3 text-3xl font-bold text-blue-700">
            {formatCurrency(
              filteredVouchers.reduce(
                (sum, voucher) =>
                  sum +
                  voucher.lines.reduce((lineSum, line) => lineSum + Number(line.debit), 0),
                0,
              ),
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Credit Total</p>
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {formatCurrency(
              filteredVouchers.reduce(
                (sum, voucher) =>
                  sum +
                  voucher.lines.reduce((lineSum, line) => lineSum + Number(line.credit), 0),
                0,
              ),
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            Source
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <option value="all">All Vouchers</option>
            <option value="transaction">Income/Expense</option>
            <option value="debt_credit_create">Debt/Credit Create</option>
            <option value="debt_credit_close">Debt/Credit Close</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredVouchers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-slate-500 shadow-sm">
            No journal vouchers found.
          </div>
        ) : (
          filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {voucher.description || "Journal Voucher"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {voucher.source_type} | Ref: {voucher.reference_no || voucher.id}
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(voucher.date).toLocaleDateString()}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Account</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 text-right font-semibold">Debit</th>
                      <th className="px-4 py-3 text-right font-semibold">Credit</th>
                      <th className="px-4 py-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.lines.map((line) => (
                      <tr key={line.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{line.account_name}</td>
                        <td className="px-4 py-3 text-slate-500">{line.account_type}</td>
                        <td className="px-4 py-3 text-right text-blue-700">
                          {Number(line.debit) > 0 ? formatCurrency(line.debit) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700">
                          {Number(line.credit) > 0 ? formatCurrency(line.credit) : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{line.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-800" colSpan="2">
                        Voucher Total
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {formatCurrency(
                          voucher.lines.reduce((sum, line) => sum + Number(line.debit), 0),
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(
                          voucher.lines.reduce((sum, line) => sum + Number(line.credit), 0),
                        )}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AuditPage() {
  const [activeSection, setActiveSection] = useState("journal");
  const selectedSection =
    AUDIT_SECTIONS.find((section) => section.id === activeSection) ||
    AUDIT_SECTIONS[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
            Audit
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Audit & Books
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Journal entries live here first. Ledger, cash book, bank book, and other reports can plug into the same audit section later.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {AUDIT_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                selectedSection.id === section.id
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{section.label}</p>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                    section.live
                      ? selectedSection.id === section.id
                        ? "bg-emerald-400/20 text-emerald-100"
                        : "bg-emerald-50 text-emerald-700"
                      : selectedSection.id === section.id
                        ? "bg-white/15 text-white/80"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {section.live ? "Live" : "Soon"}
                </span>
              </div>
              <p
                className={`mt-2 text-sm ${
                  selectedSection.id === section.id ? "text-white/75" : "text-slate-500"
                }`}
              >
                {section.description}
              </p>
            </button>
          ))}
        </div>

        {selectedSection.id === "journal" ? (
          <JournalPanel />
        ) : (
          <PlaceholderPanel section={selectedSection} />
        )}
      </div>
    </div>
  );
}
