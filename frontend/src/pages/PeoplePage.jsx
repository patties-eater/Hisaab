import React, { useEffect, useMemo, useState } from "react";
import { apiUrl, getAuthHeaders } from "../components/api";
import { useI18n } from "../i18n";
import { formatDisplayDate } from "../utils/dates";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

const normalizePhoneForTel = (phone) => {
  if (!phone) {
    return "";
  }

  return String(phone).trim().replace(/\s+/g, "");
};

const normalizePhoneForWhatsApp = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("977")) {
    return digits;
  }

  if (digits.length === 10) {
    return `977${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `977${digits.slice(1)}`;
  }

  return digits;
};

export default function PeoplePage() {
  const { t, language } = useI18n();
  const locale = language === "ne" ? "ne-NP" : "en-NP";
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/people"), {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPeople(data.data || []);
        } else {
          setError(t("peoplePage.serverBusy"));
        }
      })
      .catch(() => setError(t("peoplePage.serverBusy")))
      .finally(() => setLoading(false));
  }, [t]);

  const totals = useMemo(() => {
    return people.reduce(
      (acc, person) => {
        acc.totalDebt += Number(person.total_debt || 0);
        acc.totalCredit += Number(person.total_credit || 0);
        acc.netBalance += Number(person.net_balance || 0);
        return acc;
      },
      { totalDebt: 0, totalCredit: 0, netBalance: 0 },
    );
  }, [people]);

  if (loading) return <p>{t("peoplePage.loading")}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("peoplePage.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t("peoplePage.subtitle")}</p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {t("peoplePage.totalPeople")}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {people.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
            {t("peoplePage.totalDebt")}
          </p>
          <p className="mt-2 text-2xl font-black text-red-600">
            {formatCurrency(totals.totalDebt)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            {t("peoplePage.totalCredit")}
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrency(totals.totalCredit)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        {people.length === 0 ? (
          <p className="text-gray-500">{t("peoplePage.empty")}</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {people.map((person) => {
                const telLink = normalizePhoneForTel(person.phone);
                const whatsappNumber = normalizePhoneForWhatsApp(person.phone);
                const hasPhone = Boolean(telLink);
                const hasWhatsApp = Boolean(whatsappNumber);
                const isNetPositive = Number(person.net_balance || 0) >= 0;

                return (
                  <div
                    key={`${person.person_key}-${person.phone || "no-phone"}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          {t("peoplePage.person")}
                        </p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">
                          {person.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {person.phone || t("peoplePage.noPhone")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isNetPositive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {Number(person.record_count || 0)}{" "}
                        {t("peoplePage.records")}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          {t("peoplePage.totalDebt")}
                        </p>
                        <p className="mt-1 font-black text-red-600">
                          {formatCurrency(person.total_debt)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          {t("peoplePage.totalCredit")}
                        </p>
                        <p className="mt-1 font-black text-emerald-600">
                          {formatCurrency(person.total_credit)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("peoplePage.netBalance")}
                      </p>
                      <p
                        className={`mt-1 text-lg font-black ${
                          isNetPositive ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(person.net_balance)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          {t("peoplePage.lastActivity")}
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {formatDisplayDate(person.last_activity_date, locale)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={hasPhone ? `tel:${telLink}` : undefined}
                          onClick={(event) => {
                            if (!hasPhone) {
                              event.preventDefault();
                            }
                          }}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            hasPhone
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                          }`}
                        >
                          {t("peoplePage.call")}
                        </a>
                        <a
                          href={
                            hasWhatsApp
                              ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t("peoplePage.whatsappMessage"))}`
                              : undefined
                          }
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => {
                            if (!hasWhatsApp) {
                              event.preventDefault();
                            }
                          }}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            hasWhatsApp
                              ? "bg-emerald-600 text-white hover:bg-emerald-500"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                          }`}
                        >
                          {t("peoplePage.whatsapp")}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.person")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.phone")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.totalDebt")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.totalCredit")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.netBalance")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.lastActivity")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {t("peoplePage.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => {
                    const telLink = normalizePhoneForTel(person.phone);
                    const whatsappNumber = normalizePhoneForWhatsApp(person.phone);
                    const hasPhone = Boolean(telLink);
                    const hasWhatsApp = Boolean(whatsappNumber);
                    const isNetPositive = Number(person.net_balance || 0) >= 0;

                    return (
                      <tr
                        key={`${person.person_key}-${person.phone || "no-phone"}`}
                        className="border-b align-top transition hover:bg-gray-50"
                      >
                        <td className="px-3 py-3 font-semibold text-slate-900">
                          {person.name}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {person.phone || t("peoplePage.noPhone")}
                        </td>
                        <td className="px-3 py-3 font-semibold text-red-600">
                          {formatCurrency(person.total_debt)}
                        </td>
                        <td className="px-3 py-3 font-semibold text-emerald-600">
                          {formatCurrency(person.total_credit)}
                        </td>
                        <td
                          className={`px-3 py-3 font-semibold ${
                            isNetPositive ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(person.net_balance)}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {formatDisplayDate(person.last_activity_date, locale)}
                          <div className="mt-1 text-xs text-slate-400">
                            {Number(person.record_count || 0)}{" "}
                            {t("peoplePage.records")}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <a
                              href={hasPhone ? `tel:${telLink}` : undefined}
                              onClick={(event) => {
                                if (!hasPhone) {
                                  event.preventDefault();
                                }
                              }}
                              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                hasPhone
                                  ? "bg-slate-900 text-white hover:bg-slate-800"
                                  : "cursor-not-allowed bg-slate-100 text-slate-400"
                              }`}
                            >
                              {t("peoplePage.call")}
                            </a>
                            <a
                              href={
                                hasWhatsApp
                                  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t("peoplePage.whatsappMessage"))}`
                                  : undefined
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => {
                                if (!hasWhatsApp) {
                                  event.preventDefault();
                                }
                              }}
                              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                hasWhatsApp
                                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                  : "cursor-not-allowed bg-slate-100 text-slate-400"
                              }`}
                            >
                              {t("peoplePage.whatsapp")}
                            </a>
                          </div>
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
    </div>
  );
}
