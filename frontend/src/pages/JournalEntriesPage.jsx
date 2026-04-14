import React, { useEffect, useMemo, useState } from "react";
import { apiUrl, getAuthHeaders, getFriendlyErrorMessage } from "../components/api";
import { formatDisplayDate } from "../utils/dates";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

export default function JournalEntriesPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch(apiUrl("/api/accounting-journal"), {
          headers: getAuthHeaders(),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(
            getFriendlyErrorMessage({
              status: res.status,
              defaultMessage: "We could not load journal entries. Please try again.",
            }),
          );
          return;
        }

        setVouchers(data.data);
        setError("");
      } catch {
        setError("Server is busy right now. Please try again in a moment.");
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
    return <div className="p-8 text-gray-500">Loading journal entries...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Accounting
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Journal Entries
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Balanced debit and credit postings for your account activity.
            </p>
          </div>

          <div className="w-full md:w-64">
            <label className="mb-2 block text-sm font-semibold text-slate-600">
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
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
                    <h2 className="font-semibold text-slate-900">{voucher.description || "Journal Voucher"}</h2>
                    <p className="text-sm text-slate-500">
                      {voucher.source_type} | Ref: {voucher.reference_no || voucher.id}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatDisplayDate(voucher.date)}
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
    </div>
  );
}
