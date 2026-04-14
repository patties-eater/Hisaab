import { useState } from "react";
import { useI18n } from "../i18n";

export default function TransactionForm({ onAdd, availableBalance = 0 }) {
  const { t } = useI18n();
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [type, setType] = useState("Income");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "NRS",
      maximumFractionDigits: 0,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !amount) {
      setError(t("transactionForm.requiredDetails"));
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t("transactionForm.validAmount"));
      return;
    }

    if (type === "Expense" && numericAmount > availableBalance) {
      setError(t("transactionForm.expenseExceeded"));
      return;
    }

    const newTransaction = {
      name,
      type,
      title,
      amount: numericAmount,
      date: date || today,
    };

    const result = await onAdd(newTransaction);

    if (!result?.success) {
      setError(result?.message || t("transactionForm.serverBusy"));
      return;
    }

    setName("");
    setTitle("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("Income");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3">
      <h3 className="font-bold text-gray-700">{t("transactionForm.title")}</h3>
      <div>
        <label className="block text-sm font-semibold">{t("transactionForm.name")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("transactionForm.namePlaceholder")}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">{t("transactionForm.type")}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="Income">{t("transactionForm.income")}</option>
          <option value="Expense" disabled={availableBalance <= 0}>
            {t("transactionForm.expense")}
          </option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {type === "Expense"
            ? `${t("transactionForm.availableBalance")}: ${formatCurrency(availableBalance)}`
            : t("transactionForm.expenseHint")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold">{t("transactionForm.titleLabel")}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("transactionForm.titlePlaceholder")}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">{t("transactionForm.amount")}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t("transactionForm.amountPlaceholder")}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">{t("transactionForm.date")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {t("transactionForm.submit")}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
