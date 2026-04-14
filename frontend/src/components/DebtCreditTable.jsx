import React, { useState } from "react";
import { useAccountMode } from "../accountMode";
import { useI18n } from "../i18n";
import { formatDisplayDate } from "../utils/dates";

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
      (elapsedMonths / 12)
    ).toFixed(2),
  );
};

export default function DebtCreditTable({
  records = [],
  loading,
  onCloseRecord,
  closingRecordId,
}) {
  const { isShopMode } = useAccountMode();
  const { language, t } = useI18n();
  const locale = language === "ne" ? "ne-NP" : "en-NP";
  const [closeDates, setCloseDates] = useState({});

  if (loading) return <p className="text-gray-500">{t("debtCreditTable.loading")}</p>;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          {t("debtCreditTable.title")}
        </h2>
      </div>

      {records.length === 0 ? (
        <p className="text-gray-500">{t("debtCreditTable.empty")}</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {records.map((item) => {
              const closeDate =
                closeDates[item.id] || formatDateInputValue(new Date());
              const previewInterest =
                item.status === "closed"
                  ? Number(item.settled_interest || 0)
                  : calculateInterestByDate(item, closeDate);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.phone || t("debtCreditTable.noPhone")}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {item.type === "debt"
                          ? t("debtCreditPage.totalDebt")
                          : t("debtCreditPage.totalCredit")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">
                        {formatCurrency(item.amount)}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          item.status === "closed"
                            ? "text-slate-500"
                            : "text-blue-700"
                        }`}
                      >
                        {item.status === "closed"
                          ? t("debtCreditTable.closed")
                          : t("debtCreditTable.active")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("debtCreditTable.date")}
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatDisplayDate(item.date, locale)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("debtCreditTable.notes")}
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {item.notes || t("debtCreditTable.noNotes")}
                      </p>
                    </div>
                  </div>

                  {!isShopMode && (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          {t("debtCreditTable.rate")}
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{item.rate}%</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          {t("debtCreditTable.duration")}
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {item.duration} {t("debtCreditTable.monthsShort")}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isShopMode && item.status !== "closed" && (
                    <div className="mt-3 rounded-xl bg-green-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">
                        {t("debtCreditForm.estimatedInterest")}
                      </p>
                      <p className="mt-1 text-lg font-black text-green-700">
                        {formatCurrency(previewInterest)}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 rounded-xl border border-slate-200 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("debtCreditTable.clearance")}
                    </p>
                    {item.status === "closed" ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {isShopMode
                          ? formatCurrency(item.amount)
                          : item.type === "credit"
                            ? `${t("debtCreditTable.creditInterestPosted")}: ${formatCurrency(item.settled_interest)}`
                            : `${t("debtCreditTable.debtInterestPosted")}: ${formatCurrency(item.settled_interest)}`}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
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
                          className="w-full rounded-xl border border-slate-200 p-3"
                        />
                        <button
                          type="button"
                          onClick={() => onCloseRecord?.(item, closeDate)}
                          disabled={closingRecordId === item.id}
                          className="w-full rounded-xl bg-slate-900 px-3 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {closingRecordId === item.id
                            ? t("debtCreditTable.clearing")
                            : t("debtCreditTable.clear")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 md:block">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.name")}</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.phone")}</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.type")}</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.amount")}</th>
                {!isShopMode && <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.rate")}</th>}
                {!isShopMode && <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.duration")}</th>}
                {!isShopMode && <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.interest")}</th>}
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.date")}</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.status")}</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.clearance")}</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t("debtCreditTable.notes")}</th>
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
                    className="border-b align-top transition hover:bg-gray-50"
                  >
                    <td className="px-3 py-3">{item.name}</td>
                    <td className="px-3 py-3 text-gray-600">{item.phone || t("debtCreditTable.noPhone")}</td>
                    <td
                      className={`px-3 py-3 font-semibold ${
                        item.type === "debt"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.type === "debt"
                        ? t("debtCreditPage.totalDebt")
                        : t("debtCreditPage.totalCredit")}
                    </td>

                    <td className="px-3 py-3">{formatCurrency(item.amount)}</td>

                    {!isShopMode && <td className="px-3 py-3">{item.rate}%</td>}

                    {!isShopMode && (
                      <td className="px-3 py-3">{item.duration} {t("debtCreditTable.monthsShort")}</td>
                    )}

                    {!isShopMode && (
                      <td className="px-3 py-3">
                        <div>{formatCurrency(item.estimated_interest)}</div>
                        {item.status !== "closed" && (
                          <div className="text-xs text-gray-500">
                            {t("debtCreditTable.closeInterest")}: {formatCurrency(previewInterest)}
                          </div>
                        )}
                      </td>
                    )}

                    <td className="px-3 py-3">
                      {formatDisplayDate(item.date, locale)}
                    </td>

                    <td className="px-3 py-3">
                      {item.status === "closed" ? (
                        <div className="space-y-1">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            {t("debtCreditTable.closed")}
                          </span>
                          <div className="text-xs text-gray-500">
                            {item.closed_at
                              ? `${t("debtCreditTable.closedOn")} ${formatDisplayDate(item.closed_at, locale)}`
                              : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {t("debtCreditTable.active")}
                        </span>
                      )}
                    </td>

                    <td className="min-w-[220px] px-3 py-3">
                      {item.status === "closed" ? (
                        <div className="text-xs text-gray-600">
                          {isShopMode
                            ? formatCurrency(item.amount)
                            : (
                              <>
                                {item.type === "credit"
                                  ? t("debtCreditTable.creditInterestPosted")
                                  : t("debtCreditTable.debtInterestPosted")}:
                                {" "}
                                {formatCurrency(item.settled_interest)}
                              </>
                            )}
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

                    <td className="px-3 py-3 text-gray-500">
                      {item.notes || t("debtCreditTable.noNotes")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
