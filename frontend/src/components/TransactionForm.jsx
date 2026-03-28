// src/components/TransactionForm.jsx
import { useState } from "react";
import { useI18n } from "../i18n";

export default function TransactionForm({ onAdd }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [type, setType] = useState("Income");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(""); // optional, defaults to today

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newTransaction = {
      name,
      type,
      title,
      amount: Number(amount),
      date: date || new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };

    onAdd(newTransaction);

    // Reset form
    setName("");
    setTitle("");
    setAmount("");
    setDate("");
    setType("Income");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow space-y-3"
    >
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
          <option value="Expense">{t("transactionForm.expense")}</option>
        </select>
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
    </form>
  );
}
