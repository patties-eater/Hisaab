import { useState, useEffect, useMemo } from "react";
import StatCard from "../components/StatCard";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { apiUrl, getAuthHeaders } from "../components/api";
import { useI18n } from "../i18n";

const formatCurrency = (value) =>
  value.toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

const IncomeExpensePage = () => {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(apiUrl("/api/transactions"), {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) setTransactions(data.data);
      } catch {
        // Keep the page quiet and show a plain fallback.
      }
    };
    fetchTransactions();
  }, []);

  const { totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "Income") acc.totalIncome += Number(tx.amount);
        else acc.totalExpense += Number(tx.amount);
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );
  }, [transactions]);

  const handleAddTransaction = async (newTransaction) => {
    try {
      const res = await fetch(apiUrl("/api/transactions"), {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newTransaction),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions((prev) =>
          [data.data, ...prev].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch {
      return {
        success: false,
        message: "Server is busy right now. Please try again in a moment.",
      };
    }
  };

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title={t("incomeExpense.totalIncome")}
          value={formatCurrency(totalIncome)}
          icon="IN"
          color="green"
        />
        <StatCard
          title={t("incomeExpense.totalExpenses")}
          value={formatCurrency(totalExpense)}
          icon="EX"
          color="red"
        />
        <StatCard
          title={t("incomeExpense.netBalance")}
          value={formatCurrency(netBalance)}
          icon={netBalance >= 0 ? "UP" : "DN"}
          color={netBalance >= 0 ? "blue" : "red"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TransactionForm onAdd={handleAddTransaction} availableBalance={netBalance} />
        <div className="lg:col-span-2">
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default IncomeExpensePage;
