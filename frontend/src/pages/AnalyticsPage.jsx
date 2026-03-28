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
import { getAuthHeaders } from "../components/api";

const COLORS = ["#EF4444", "#10B981"];
const TIME_RANGES = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
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

function getWeeklyBuckets() {
  const weeks = [];
  const today = new Date();

  for (let i = 7; i >= 0; i -= 1) {
    const date = getWeekStart(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (i * 7)));
    weeks.push({
      key: date.toISOString().split("T")[0],
      name: `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`,
      inflow: 0,
      outflow: 0,
    });
  }

  return weeks;
}

function getMonthlyBuckets() {
  const months = [];
  const today = new Date();

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      name: date.toLocaleString("en-US", { month: "short" }),
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
          fetch("http://localhost:5000/api/transactions", { headers }),
          fetch("http://localhost:5000/api/debt-credit", { headers }),
        ]);

        const [transactionsJson, debtCreditJson] = await Promise.all([
          transactionsRes.json(),
          debtCreditRes.json(),
        ]);

        if (!transactionsRes.ok || !transactionsJson.success) {
          throw new Error(transactionsJson.message || "Failed to load analytics data");
        }

        if (!debtCreditRes.ok || !debtCreditJson.success) {
          throw new Error(debtCreditJson.message || "Failed to load analytics data");
        }

        setTransactions(transactionsJson.data || []);
        setDebtCreditRecords(debtCreditJson.data || []);
        setError("");
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const monthlyData = useMemo(() => {
    const baseBuckets =
      timeRange === "weekly"
        ? getWeeklyBuckets()
        : timeRange === "yearly"
          ? getYearlyBuckets()
          : getMonthlyBuckets();
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
  }, [timeRange, transactions]);

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
    return <div className="min-h-screen bg-gray-50 p-6 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Financial Analytics</h1>
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
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              {timeRange === "weekly"
                ? "Weekly Cash Flow"
                : timeRange === "yearly"
                  ? "Yearly Cash Flow"
                  : "Monthly Cash Flow"}
            </h2>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
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

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Debt vs Credit
            </h2>

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
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-red-600 font-medium">
                <span>Total Debt</span>
                <span>{formatCurrency(debtCreditData[0]?.value)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Total Credit</span>
                <span>{formatCurrency(debtCreditData[1]?.value)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
