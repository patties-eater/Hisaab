import React, { useState } from "react";
import { useI18n } from "../i18n";

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });
};

const normalizeDate = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

const formatDateInputValue = (value) => {
  const date = normalizeDate(value);
  return date ? date.toISOString().split("T")[0] : "";
};

const addMonths = (date, months) => {
  const nextDate = new Date(date.getTime());
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
  return nextDate;
};

const daysBetween = (start, end) =>
  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

const getProratedMonths = (start, end, durationMonths) => {
  if (!start || !end) {
    return 0;
  }

  if (end.getTime() === start.getTime()) {
    const firstMonthEnd = addMonths(start, 1);
    const firstMonthDays = Math.max(daysBetween(start, firstMonthEnd), 1);
    return Math.min(durationMonths, 1 / firstMonthDays);
  }

  if (end.getTime() < start.getTime()) {
    return 0;
  }

  let completedMonths = 0;

  while (completedMonths < durationMonths) {
    const nextMonthDate = addMonths(start, completedMonths + 1);

    if (nextMonthDate.getTime() <= end.getTime()) {
      completedMonths += 1;
      continue;
    }

    break;
  }

  if (completedMonths >= durationMonths) {
    return durationMonths;
  }

  const monthStart = addMonths(start, completedMonths);
  const monthEnd = addMonths(start, completedMonths + 1);
  const daysInCurrentMonthSlice = Math.max(daysBetween(monthStart, monthEnd), 1);
  const usedDaysInCurrentMonth = Math.max(daysBetween(monthStart, end), 0);
  const partialMonth = Math.min(usedDaysInCurrentMonth / daysInCurrentMonthSlice, 1);

  return Math.min(durationMonths, completedMonths + partialMonth);
};

const calculateInterestByDate = (item, closeDate) => {
  const start = normalizeDate(item.date);
  const end = normalizeDate(closeDate);

  if (!start || !end) {
    return 0;
  }

  const elapsedMonths = getProratedMonths(
    start,
    end,
    Number(item.duration || 0),
  );

  return Number(
    (
      Number(item.amount || 0) *
      (Number(item.rate || 0) / 100) *
      elapsedMonths
    ).toFixed(2),
  );
};

export default function DebtCreditTable({
  records = [],
  loading,
  onCloseRecord,
  closingRecordId,
}) {
  const { t } = useI18n();
  const [closeDates, setCloseDates] = useState({});

  if (loading) return <p className="text-gray-500">{t("debtCreditTable.loading")}</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {t("debtCreditTable.title")}
      </h2>

      {records.length === 0 ? (
        <p className="text-gray-500">{t("debtCreditTable.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3">{t("debtCreditTable.name")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.type")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.amount")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.rate")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.duration")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.interest")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.date")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.status")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.clearance")}</th>
                <th className="py-2 px-3">{t("debtCreditTable.notes")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => {
                const closeDate =
                  closeDates[item.id] || formatDateInputValue(new Date());
                const previewInterest =
                  item.status === "closed"
                    ? Number(item.settled_interest || 0)
                    : calculateInterestByDate(item, closeDate);

                return (
                  <tr
                    key={item.id}
                    className="border-b align-top hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-3">{item.name}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        item.type === "debt"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.type === "debt"
                        ? t("debtCreditPage.totalDebt")
                        : t("debtCreditPage.totalCredit")}
                    </td>

                    <td className="py-2 px-3">{formatCurrency(item.amount)}</td>

                    <td className="py-2 px-3">{item.rate}%</td>

                    <td className="py-2 px-3">{item.duration} {t("debtCreditTable.monthsShort")}</td>

                    <td className="py-2 px-3">
                      <div>{formatCurrency(item.estimated_interest)}</div>
                      {item.status !== "closed" && (
                        <div className="text-xs text-gray-500">
                          {t("debtCreditTable.closeInterest")}: {formatCurrency(previewInterest)}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3">
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td className="py-2 px-3">
                      {item.status === "closed" ? (
                        <div className="space-y-1">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            {t("debtCreditTable.closed")}
                          </span>
                          <div className="text-xs text-gray-500">
                            {item.closed_at
                              ? `${t("debtCreditTable.closedOn")} ${new Date(item.closed_at).toLocaleDateString()}`
                              : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {t("debtCreditTable.active")}
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 min-w-[220px]">
                      {item.status === "closed" ? (
                        <div className="text-xs text-gray-600">
                          {item.type === "credit"
                            ? t("debtCreditTable.creditInterestPosted")
                            : t("debtCreditTable.debtInterestPosted")}:
                          {" "}
                          {formatCurrency(item.settled_interest)}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={closeDate}
                            min={formatDateInputValue(item.date)}
                            onChange={(e) =>
                              setCloseDates((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border p-2"
                          />
                          <button
                            type="button"
                            onClick={() => onCloseRecord?.(item, closeDate)}
                            disabled={closingRecordId === item.id}
                            className="w-full rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {closingRecordId === item.id
                              ? t("debtCreditTable.clearing")
                              : t("debtCreditTable.clear")}
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3 text-gray-500">
                      {item.notes || t("debtCreditTable.noNotes")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
