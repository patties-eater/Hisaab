import React, { useState } from "react";
import { useAccountMode } from "../accountMode";
import { apiUrl, getAuthHeaders, getFriendlyErrorMessage } from "./api";
import { useI18n } from "../i18n";

export default function DebtCreditForm({ onSuccess }) {
  const { t } = useI18n();
  const { isShopMode } = useAccountMode();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    rate: "",
    duration: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate interest (NUMBER only)
  const calculateInterest = () => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const duration = parseFloat(formData.duration) || 0;
    return amount * (rate / 100) * (duration / 12);
  };

  const handleSubmit = async (type) => {
    setError("");

    if (
      !formData.name ||
      !formData.phone ||
      !formData.amount ||
      (!isShopMode && (!formData.rate || !formData.duration))
    ) {
      return setError(
        !formData.phone
          ? t("debtCreditForm.phoneRequired")
          : t("debtCreditForm.fillRequired"),
      );
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/debt-credit"), {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          ...formData,
          rate: isShopMode ? 0 : formData.rate,
          duration: isShopMode ? 0 : formData.duration,
          type,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Reset form
        setFormData({
          name: "",
          phone: "",
          amount: "",
          rate: "",
          duration: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });

        if (onSuccess) onSuccess(); // refresh table
      } else {
        setError(
          getFriendlyErrorMessage({
            status: res.status,
            defaultMessage: t("debtCreditForm.saveFailed"),
          }),
        );
      }
    } catch {
      setError(t("debtCreditForm.serverError"));
    }

    setLoading(false);
  };

  const formattedInterest = calculateInterest().toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

  return (
    <div className="self-start rounded-2xl border border-gray-100 bg-white p-4 shadow-md lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden lg:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-800">
          {t("debtCreditForm.title")}
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          {t("debtCreditForm.badge")}
        </span>
      </div>

      <div className="space-y-4 lg:overflow-y-auto lg:pr-1">
        {/* name */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            {t("debtCreditForm.name")}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            {t("debtCreditForm.phone")}
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("debtCreditForm.phonePlaceholder")}
            className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400">
            {t("debtCreditForm.phoneHint")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {t("debtCreditForm.amount")}
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {t("debtCreditForm.date")}
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Rate + Duration */}
        {!isShopMode && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {t("debtCreditForm.interestRate")}
              </label>

              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {t("debtCreditForm.duration")}
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            {t("debtCreditForm.notes")}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className="rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Interest Preview */}
        {!isShopMode && (
          <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-3">
            <span className="text-sm font-semibold text-green-700">
              {t("debtCreditForm.estimatedInterest")}
            </span>
            <span className="text-lg font-bold text-green-700">
              {formattedInterest}
            </span>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Buttons */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          <button
            onClick={() => handleSubmit("debt")}
            disabled={loading}
            className="rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600"
          >
            {loading ? t("debtCreditForm.saving") : t("debtCreditForm.saveDebt")}
          </button>

          <button
            onClick={() => handleSubmit("credit")}
            disabled={loading}
            className="rounded-xl bg-green-500 py-3 font-bold text-white transition hover:bg-green-600"
          >
            {loading ? t("debtCreditForm.saving") : t("debtCreditForm.saveCredit")}
          </button>
        </div>
      </div>
    </div>
  );
}
