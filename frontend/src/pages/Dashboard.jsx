import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { getAuthHeaders } from "../components/api";
import { useI18n } from "../i18n";
import { formatDisplayDate } from "../utils/dates";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

function DashboardCard({ title, value, tone, meta }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-80">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{meta}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function QuickLink({ to, title, hint }) {
  return (
    <NavLink
      to={to}
      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
    >
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </NavLink>
  );
}

export default function Dashboard() {
  const { language, t } = useI18n();
  const locale = language === "ne" ? "ne-NP" : "en-NP";
  const [dashboardData, setDashboardData] = useState({
    incomeTotal: 0,
    expenseTotal: 0,
    debtTotal: 0,
    creditTotal: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [debtCreditRecords, setDebtCreditRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const headers = getAuthHeaders();
        const [dashboardRes, transactionsRes, debtCreditRes] = await Promise.all([
          fetch("http://localhost:5000/api/dashboard", { headers }),
          fetch("http://localhost:5000/api/transactions", { headers }),
          fetch("http://localhost:5000/api/debt-credit", { headers }),
        ]);

        const [dashboardJson, transactionsJson, debtCreditJson] = await Promise.all([
          dashboardRes.json(),
          transactionsRes.json(),
          debtCreditRes.json(),
        ]);

        if (!dashboardRes.ok || !dashboardJson.success) {
          throw new Error(dashboardJson.message || "Failed to load dashboard");
        }

        setDashboardData(dashboardJson.data);
        setTransactions(transactionsJson.success ? transactionsJson.data : []);
        setDebtCreditRecords(debtCreditJson.success ? debtCreditJson.data : []);
        setError("");
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const insights = useMemo(() => {
    const totalIncome = Number(dashboardData.incomeTotal || 0);
    const totalExpense = Number(dashboardData.expenseTotal || 0);
    const totalDebt = Number(dashboardData.debtTotal || 0);
    const totalCredit = Number(dashboardData.creditTotal || 0);
    const netCash = totalIncome - totalExpense;
    const netPosition = totalCredit - totalDebt;
    const activeDebtCredit = debtCreditRecords.filter(
      (item) => (item.status || "active") === "active",
    );
    const closedDebtCredit = debtCreditRecords.filter(
      (item) => item.status === "closed",
    );

    return {
      totalIncome,
      totalExpense,
      totalDebt,
      totalCredit,
      netCash,
      netPosition,
      activeCount: activeDebtCredit.length,
      closedCount: closedDebtCredit.length,
      incomeVsExpense:
        totalIncome === 0
          ? 0
          : Number(((totalExpense / totalIncome) * 100).toFixed(1)),
    };
  }, [dashboardData, debtCreditRecords]);

  const recentTransactions = useMemo(
    () => [...transactions].slice(0, 5),
    [transactions],
  );

  const recentDebtCredit = useMemo(
    () => [...debtCreditRecords].slice(0, 5),
    [debtCreditRecords],
  );

  if (loading) {
    return <div className="p-8 text-slate-500">{t("dashboard.loading")}</div>;
  }

  return (
    <div className="space-y-8 p-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title={t("dashboard.income")}
          value={formatCurrency(insights.totalIncome)}
          tone="green"
          meta="All recorded income including auto interest income"
        />
        <DashboardCard
          title={t("dashboard.expense")}
          value={formatCurrency(insights.totalExpense)}
          tone="red"
          meta="All recorded expenses including debt clearance interest"
        />
        <DashboardCard
          title={t("dashboard.activeDebt")}
          value={formatCurrency(insights.totalDebt)}
          tone="amber"
          meta={`${insights.activeCount} active debt/credit records right now`}
        />
        <DashboardCard
          title={t("dashboard.activeCredit")}
          value={formatCurrency(insights.totalCredit)}
          tone="blue"
          meta={`${insights.closedCount} records already cleared and closed`}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Recent Transactions"
          subtitle={t("dashboard.recentTransactionsHint")}
          action={
            <NavLink
              to="/income-expense"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {t("dashboard.viewAll")}
            </NavLink>
          }
        >
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-500">{t("dashboard.noTransactions")}</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.title || item.name || "Transaction"}</p>
                    <p className="text-sm text-slate-500">
                      {item.name || "General"} | {formatDisplayDate(item.date, locale)}
                    </p>
                  </div>
                  <div
                    className={`text-right font-bold ${
                      item.type === "Income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {item.type === "Income" ? "+" : "-"} {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t("dashboard.quickHealth")} subtitle={t("dashboard.quickHealthHint")}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">{t("dashboard.expenseLoad")}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {insights.incomeVsExpense}%
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t("dashboard.incomeCoveredByExpense")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">{t("dashboard.cashDirection")}</p>
              <p
                className={`mt-2 text-2xl font-black ${
                  insights.netCash >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {insights.netCash >= 0 ? t("dashboard.positive") : t("dashboard.negative")}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t("dashboard.cashDirectionHint")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">{t("dashboard.debtCreditDirection")}</p>
              <p
                className={`mt-2 text-2xl font-black ${
                  insights.netPosition >= 0 ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {insights.netPosition >= 0 ? t("dashboard.creditHeavy") : t("dashboard.debtHeavy")}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t("dashboard.debtCreditDirectionHint")}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title={t("dashboard.recentDebtCredit")}
          subtitle={t("dashboard.recentDebtCreditHint")}
          action={
            <NavLink
              to="/add"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {t("dashboard.openDrCr")}
            </NavLink>
          }
        >
          {recentDebtCredit.length === 0 ? (
            <p className="text-sm text-slate-500">{t("dashboard.noDebtCredit")}</p>
          ) : (
            <div className="space-y-3">
              {recentDebtCredit.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${
                          item.type === "debt"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${
                          item.status === "closed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {item.status || "active"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatDisplayDate(item.date, locale)} | Rate {item.rate}% | {item.duration} months
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                    <p className="text-sm text-slate-500">
                      {t("dashboard.interest")} {formatCurrency(item.status === "closed" ? item.settled_interest : item.estimated_interest)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t("dashboard.actionQueue")} subtitle={t("dashboard.actionQueueHint")}>
          <div className="grid gap-3">
            <QuickLink
              to="/add"
              title={t("dashboard.clearDue")}
              hint={t("dashboard.clearDueHint")}
            />
            <QuickLink
              to="/income-expense"
              title={t("dashboard.addCashMovement")}
              hint={t("dashboard.addCashMovementHint")}
            />
            <QuickLink
              to="/audit"
              title={t("dashboard.reviewJournal")}
              hint={t("dashboard.reviewJournalHint")}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
