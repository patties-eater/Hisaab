import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useI18n } from "../i18n";
import { apiUrl, getAuthHeaders } from "../components/api";

const COLORS = ["#EF4444", "#10B981"];
const TIME_RANGES = [
  { key: "weekly", labelKey: "analytics.weekly" },
  { key: "monthly", labelKey: "analytics.monthly" },
  { key: "yearly", labelKey: "analytics.yearly" },
];

const formatCurrency = (value, locale) =>
  Number(value || 0).toLocaleString(locale, {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

function getWeekStart(date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getWeeklyBuckets(locale) {
  const weeks = [];
  const today = new Date();
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  });

  for (let i = 7; i >= 0; i -= 1) {
    const date = getWeekStart(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (i * 7)));
    weeks.push({
      key: date.toISOString().split("T")[0],
      name: formatter.format(date),
      inflow: 0,
      outflow: 0,
    });
  }

  return weeks;
}

function getMonthlyBuckets(locale) {
  const months = [];
  const today = new Date();
  const formatter = new Intl.DateTimeFormat(locale, { month: "short" });

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      name: formatter.format(date),
      inflow: 0,
      outflow: 0,
    });
  }

  return months;
}

function getYearlyBuckets() {
  const years = [];
  const today = new Date();

  for (let i = 4; i >= 0; i -= 1) {
    const year = today.getFullYear() - i;
    years.push({
      key: String(year),
      name: String(year),
      inflow: 0,
      outflow: 0,
    });
  }

  return years;
}

export default function AnalyticsPage() {
  const { language, t } = useI18n();
  const locale = language === "ne" ? "ne-NP" : "en-IN";
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale],
  );
  const [transactions, setTransactions] = useState([]);
  const [debtCreditRecords, setDebtCreditRecords] = useState([]);
  const [timeRange, setTimeRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers = getAuthHeaders();
        const [transactionsRes, debtCreditRes] = await Promise.all([
          fetch(apiUrl("/api/transactions"), { headers }),
          fetch(apiUrl("/api/debt-credit"), { headers }),
        ]);

        const [transactionsJson, debtCreditJson] = await Promise.all([
          transactionsRes.json(),
          debtCreditRes.json(),
        ]);

        if (!transactionsRes.ok || !transactionsJson.success) {
          throw new Error("Transactions failed");
        }

        if (!debtCreditRes.ok || !debtCreditJson.success) {
          throw new Error("Debt and credit failed");
        }

        setTransactions(transactionsJson.data || []);
        setDebtCreditRecords(debtCreditJson.data || []);
        setError("");
    } catch {
      setError(t("analytics.serverBusy"));
    } finally {
      setLoading(false);
    }
    };

    fetchAnalytics();
  }, [t]);

  const monthlyData = useMemo(() => {
    const baseBuckets =
      timeRange === "weekly"
        ? getWeeklyBuckets(locale)
        : timeRange === "yearly"
          ? getYearlyBuckets()
          : getMonthlyBuckets(locale);
    const bucketMap = new Map(baseBuckets.map((item) => [item.key, { ...item }]));

    transactions.forEach((tx) => {
      const date = new Date(tx.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key =
        timeRange === "weekly"
          ? getWeekStart(date).toISOString().split("T")[0]
          : timeRange === "yearly"
            ? String(date.getFullYear())
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthEntry = bucketMap.get(key);

      if (!monthEntry) {
        return;
      }

      if (String(tx.type).toLowerCase() === "income") {
        monthEntry.inflow += Number(tx.amount || 0);
      } else {
        monthEntry.outflow += Number(tx.amount || 0);
      }
    });

    return Array.from(bucketMap.values());
  }, [locale, timeRange, transactions]);

  const debtCreditData = useMemo(() => {
    const activeRecords = debtCreditRecords.filter(
      (record) => (record.status || "active") === "active",
    );

    const debt = activeRecords
      .filter((record) => record.type === "debt")
      .reduce((sum, record) => sum + Number(record.amount || 0), 0);

    const credit = activeRecords
      .filter((record) => record.type === "credit")
      .reduce((sum, record) => sum + Number(record.amount || 0), 0);

    return [
      { name: "Debt", value: debt },
      { name: "Credit", value: credit },
    ];
  }, [debtCreditRecords]);

    if (loading) {
    return <div className="min-h-screen bg-gray-50 px-4 py-4 text-gray-500 sm:px-6 lg:px-8">{t("analytics.loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{t("analytics.title")}</h1>
          <div className="flex gap-2 rounded-xl bg-white p-1 shadow">
            {TIME_RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setTimeRange(option.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  timeRange === option.key
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow sm:p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">
              {timeRange === "weekly"
                ? t("analytics.weeklyCashFlow")
                : timeRange === "yearly"
                  ? t("analytics.yearlyCashFlow")
                  : t("analytics.monthlyCashFlow")}
            </h2>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => numberFormatter.format(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value, locale)} />
                  <Line
                    type="monotone"
                    dataKey="inflow"
                    stroke="#10B981"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="outflow"
                    stroke="#EF4444"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">{t("analytics.debtVsCredit")}</h2>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtCreditData}
                    dataKey="value"
                    outerRadius={100}
                  >
                    {debtCreditData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, locale)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-red-600 font-medium">
                <span>{t("analytics.totalDebt")}</span>
                <span>{formatCurrency(debtCreditData[0]?.value, locale)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>{t("analytics.totalCredit")}</span>
                <span>{formatCurrency(debtCreditData[1]?.value, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
