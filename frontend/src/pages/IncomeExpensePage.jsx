import { useState, useEffect, useMemo } from "react";
import StatCard from "../components/StatCard";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { getAuthHeaders } from "../components/api";
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

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions", {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) setTransactions(data.data);
      } catch (err) {
        console.error(err);
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
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newTransaction),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions((prev) =>
          [data.data, ...prev].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="p-8 space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title={t("incomeExpense.totalIncome")}
          value={formatCurrency(totalIncome)}
          icon="💰"
          color="green"
        />
        <StatCard
          title={t("incomeExpense.totalExpenses")}
          value={formatCurrency(totalExpense)}
          icon="💸"
          color="red"
        />
        <StatCard
          title={t("incomeExpense.netBalance")}
          value={formatCurrency(netBalance)}
          icon={netBalance >= 0 ? "📈" : "📉"}
          color={netBalance >= 0 ? "blue" : "red"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <TransactionForm onAdd={handleAddTransaction} />
        <div className="lg:col-span-2">
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default IncomeExpensePage;
