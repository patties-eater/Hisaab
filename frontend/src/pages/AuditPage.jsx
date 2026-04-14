import React, { useEffect, useMemo, useState } from "react";
import { apiUrl, getAuthHeaders, getFriendlyErrorMessage } from "../components/api";
import { useI18n } from "../i18n";
import { formatDisplayDate } from "../utils/dates";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

const AUDIT_SECTIONS = [
  {
    id: "journal",
    labelKey: "audit.journalEntries",
    descriptionKey: "audit.journalDescription",
    endpoint: apiUrl("/api/accounting-journal"),
    live: true,
  },
  {
    id: "ledger",
    labelKey: "audit.ledger",
    descriptionKey: "audit.ledgerDescription",
    endpoint: apiUrl("/api/accounting-journal/ledger"),
    live: true,
  },
  {
    id: "cashbook",
    labelKey: "audit.cashBook",
    descriptionKey: "audit.cashBookDescription",
    endpoint: apiUrl("/api/accounting-journal/cash-book"),
    live: true,
  },
  {
    id: "bankbook",
    labelKey: "audit.bankBook",
    descriptionKey: "audit.bankBookDescription",
    endpoint: apiUrl("/api/accounting-journal/bank-book"),
    live: true,
  },
  {
    id: "trialbalance",
    labelKey: "audit.trialBalance",
    descriptionKey: "audit.trialBalanceDescription",
    endpoint: apiUrl("/api/accounting-journal/trial-balance"),
    live: true,
  },
];

function SectionButton({ section, selected, onSelect, t }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(section.id)}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
          : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{t(section.labelKey)}</p>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
            selected ? "bg-emerald-400/20 text-emerald-100" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {t("audit.live")}
        </span>
      </div>
      <p className={`mt-2 text-sm ${selected ? "text-white/75" : "text-slate-500"}`}>
        {t(section.descriptionKey)}
      </p>
    </button>
  );
}

function SummaryCard({ label, value, tone = "slate" }) {
  const toneClass =
    tone === "blue"
      ? "text-blue-700"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-slate-900";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-slate-500 shadow-sm">
      {children}
    </div>
  );
}

function JournalPanel({ data, t }) {
  const [filter, setFilter] = useState("all");

  const filteredVouchers = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((voucher) => voucher.source_type === filter);
  }, [data, filter]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label={t("audit.vouchers")} value={data.length} />
        <SummaryCard
          label={t("audit.debitTotal")}
          value={formatCurrency(
            filteredVouchers.reduce(
              (sum, voucher) =>
                sum + voucher.lines.reduce((lineSum, line) => lineSum + Number(line.debit), 0),
              0,
            ),
          )}
          tone="blue"
        />
        <SummaryCard
          label={t("audit.creditTotal")}
          value={formatCurrency(
            filteredVouchers.reduce(
              (sum, voucher) =>
                sum + voucher.lines.reduce((lineSum, line) => lineSum + Number(line.credit), 0),
              0,
            ),
          )}
          tone="emerald"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            {t("audit.source")}
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <option value="all">{t("audit.allVouchers")}</option>
            <option value="transaction">{t("audit.incomeExpense")}</option>
            <option value="debt_credit_create">{t("audit.debtCreditCreate")}</option>
            <option value="debt_credit_close">{t("audit.debtCreditClose")}</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredVouchers.length === 0 ? (
          <EmptyState>{t("audit.empty")}</EmptyState>
        ) : (
          filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {voucher.description || t("audit.voucherFallback")}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {voucher.source_type} | {t("audit.reference")}: {voucher.reference_no || voucher.id}
                  </p>
                </div>
                <div className="text-sm text-slate-500">{formatDisplayDate(voucher.date)}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t("audit.account")}</th>
                      <th className="px-4 py-3 font-semibold">{t("audit.accountType")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("audit.debit")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("audit.credit")}</th>
                      <th className="px-4 py-3 font-semibold">{t("audit.lineNotes")}</th>
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
                        <td className="px-4 py-3 text-slate-500">{line.notes || t("audit.noNotes")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-800" colSpan="2">
                        {t("audit.voucherTotal")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {formatCurrency(voucher.lines.reduce((sum, line) => sum + Number(line.debit), 0))}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(voucher.lines.reduce((sum, line) => sum + Number(line.credit), 0))}
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

function LedgerPanel({ data, t }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t("audit.totalAccounts")} value={data.summary.totalAccounts} />
        <SummaryCard label={t("audit.debitTotal")} value={formatCurrency(data.summary.totalDebit)} tone="blue" />
        <SummaryCard label={t("audit.creditTotal")} value={formatCurrency(data.summary.totalCredit)} tone="emerald" />
      </div>

      {data.accounts.length === 0 ? (
        <EmptyState>{t("audit.noLedgerAccounts")}</EmptyState>
      ) : (
        <div className="space-y-4">
          {data.accounts.map((account) => (
            <div key={`${account.accountName}-${account.accountType}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">{account.accountName}</h2>
                  <p className="text-sm text-slate-500">{account.accountType}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-slate-500">{t("audit.debitTotal")}</p>
                    <p className="font-semibold text-blue-700">{formatCurrency(account.totalDebit)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("audit.creditTotal")}</p>
                    <p className="font-semibold text-emerald-700">{formatCurrency(account.totalCredit)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("audit.closingBalance")}</p>
                    <p className="font-semibold text-slate-900">
                      {account.closingDebit > 0
                        ? `${formatCurrency(account.closingDebit)} Dr`
                        : `${formatCurrency(account.closingCredit)} Cr`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t("audit.dateLabel")}</th>
                      <th className="px-4 py-3 font-semibold">{t("audit.reference")}</th>
                      <th className="px-4 py-3 font-semibold">{t("audit.descriptionLabel")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("audit.debit")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("audit.credit")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("audit.balance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.entries.map((entry) => (
                      <tr key={entry.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-500">{formatDisplayDate(entry.date)}</td>
                        <td className="px-4 py-3 text-slate-500">{entry.referenceNo || entry.voucherId}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{entry.description || "-"}</td>
                        <td className="px-4 py-3 text-right text-blue-700">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {entry.runningDebit > 0
                            ? `${formatCurrency(entry.runningDebit)} Dr`
                            : `${formatCurrency(entry.runningCredit)} Cr`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookPanel({ data, t, emptyKey }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t("audit.receipts")} value={formatCurrency(data.totalReceipts || 0)} tone="blue" />
        <SummaryCard label={t("audit.payments")} value={formatCurrency(data.totalPayments || 0)} tone="emerald" />
        <SummaryCard
          label={t("audit.closingBalance")}
          value={
            data.closingDebit > 0
              ? `${formatCurrency(data.closingDebit)} Dr`
              : `${formatCurrency(data.closingCredit)} Cr`
          }
        />
      </div>

      {!data.entries || data.entries.length === 0 ? (
        <EmptyState>{t(emptyKey)}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">{data.accountName}</h2>
            <p className="text-sm text-slate-500">{data.accountType}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("audit.dateLabel")}</th>
                  <th className="px-4 py-3 font-semibold">{t("audit.reference")}</th>
                  <th className="px-4 py-3 font-semibold">{t("audit.descriptionLabel")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.receipts")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.payments")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.balance")}</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-500">{formatDisplayDate(entry.date)}</td>
                    <td className="px-4 py-3 text-slate-500">{entry.referenceNo || entry.voucherId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{entry.description || "-"}</td>
                    <td className="px-4 py-3 text-right text-blue-700">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {entry.runningDebit > 0
                        ? `${formatCurrency(entry.runningDebit)} Dr`
                        : `${formatCurrency(entry.runningCredit)} Cr`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BankBookPanel({ data, t }) {
  if (!data.accounts || data.accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label={t("audit.receipts")} value={formatCurrency(0)} tone="blue" />
          <SummaryCard label={t("audit.payments")} value={formatCurrency(0)} tone="emerald" />
          <SummaryCard label={t("audit.totalAccounts")} value={0} />
        </div>
        <EmptyState>{t("audit.noBankEntries")}</EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t("audit.receipts")} value={formatCurrency(data.totalReceipts)} tone="blue" />
        <SummaryCard label={t("audit.payments")} value={formatCurrency(data.totalPayments)} tone="emerald" />
        <SummaryCard label={t("audit.totalAccounts")} value={data.accounts.length} />
      </div>

      <div className="space-y-4">
        {data.accounts.map((account) => (
          <div key={`${account.accountName}-${account.accountType}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">{account.accountName}</h2>
              <p className="text-sm text-slate-500">{account.accountType}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t("audit.dateLabel")}</th>
                    <th className="px-4 py-3 font-semibold">{t("audit.reference")}</th>
                    <th className="px-4 py-3 font-semibold">{t("audit.descriptionLabel")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("audit.receipts")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("audit.payments")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("audit.balance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {account.entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-500">{formatDisplayDate(entry.date)}</td>
                      <td className="px-4 py-3 text-slate-500">{entry.referenceNo || entry.voucherId}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{entry.description || "-"}</td>
                      <td className="px-4 py-3 text-right text-blue-700">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {entry.runningDebit > 0
                          ? `${formatCurrency(entry.runningDebit)} Dr`
                          : `${formatCurrency(entry.runningCredit)} Cr`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrialBalancePanel({ data, t }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard label={t("audit.debitTotal")} value={formatCurrency(data.totals.closingDebit)} tone="blue" />
        <SummaryCard label={t("audit.creditTotal")} value={formatCurrency(data.totals.closingCredit)} tone="emerald" />
      </div>

      {data.accounts.length === 0 ? (
        <EmptyState>{t("audit.noTrialBalance")}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("audit.account")}</th>
                  <th className="px-4 py-3 font-semibold">{t("audit.accountType")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.debitTotal")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.creditTotal")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.closingDebit")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("audit.closingCredit")}</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((account) => (
                  <tr key={`${account.accountName}-${account.accountType}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{account.accountName}</td>
                    <td className="px-4 py-3 text-slate-500">{account.accountType}</td>
                    <td className="px-4 py-3 text-right text-blue-700">{formatCurrency(account.totalDebit)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(account.totalCredit)}</td>
                    <td className="px-4 py-3 text-right text-blue-700">
                      {account.closingDebit > 0 ? formatCurrency(account.closingDebit) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700">
                      {account.closingCredit > 0 ? formatCurrency(account.closingCredit) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800" colSpan="4">
                    {t("audit.voucherTotal")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">
                    {formatCurrency(data.totals.closingDebit)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                    {formatCurrency(data.totals.closingCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState("journal");
  const [sectionData, setSectionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const selectedSection = AUDIT_SECTIONS.find((section) => section.id === activeSection);

    if (!selectedSection) {
      return;
    }

    const fetchSectionData = async () => {
      setLoading(true);
      try {
        const res = await fetch(selectedSection.endpoint, { headers: getAuthHeaders() });
        const json = await res.json();

        if (!res.ok || !json.success) {
          setError(
            getFriendlyErrorMessage({
              status: res.status,
              defaultMessage: t("audit.loadError"),
            }),
          );
          return;
        }

        setSectionData((current) => ({
          ...current,
          [activeSection]: json.data,
        }));
        setError("");
      } catch {
        setError("Server is busy right now. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [activeSection, t]);

  const selectedSection =
    AUDIT_SECTIONS.find((section) => section.id === activeSection) || AUDIT_SECTIONS[0];

  const currentData = sectionData[activeSection];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
            {t("audit.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("audit.title")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("audit.subtitle")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {AUDIT_SECTIONS.map((section) => (
            <SectionButton
              key={section.id}
              section={section}
              selected={selectedSection.id === section.id}
              onSelect={setActiveSection}
              t={t}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <EmptyState>{t("audit.loading")}</EmptyState>
        ) : activeSection === "journal" ? (
          <JournalPanel data={currentData || []} t={t} />
        ) : activeSection === "ledger" ? (
          <LedgerPanel
            data={currentData || { accounts: [], summary: { totalAccounts: 0, totalDebit: 0, totalCredit: 0 } }}
            t={t}
          />
        ) : activeSection === "cashbook" ? (
          <BookPanel
            data={currentData || { entries: [], totalReceipts: 0, totalPayments: 0, closingDebit: 0, closingCredit: 0 }}
            t={t}
            emptyKey="audit.noCashEntries"
          />
        ) : activeSection === "bankbook" ? (
          <BankBookPanel data={currentData || { accounts: [], totalReceipts: 0, totalPayments: 0 }} t={t} />
        ) : (
          <TrialBalancePanel
            data={currentData || { accounts: [], totals: { closingDebit: 0, closingCredit: 0 } }}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
