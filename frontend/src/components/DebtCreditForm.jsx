import React, { useState } from "react";
import { getAuthHeaders } from "./api";

export default function DebtCreditForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
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
    return amount * (rate / 100) * duration;
  };

  const handleSubmit = async (type) => {
    setError("");

    if (
      !formData.name ||
      !formData.amount ||
      !formData.rate ||
      !formData.duration
    ) {
      return setError("Please fill all required fields");
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/debt-credit", {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          ...formData,
          type,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Reset form
        setFormData({
          name: "",
          amount: "",
          rate: "",
          duration: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });

        if (onSuccess) onSuccess(); // refresh table
      } else {
        setError(data.message || "Failed to save");
      }
    } catch (err) {
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  const formattedInterest = calculateInterest().toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });

  return (
    <div className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-hidden self-start rounded-xl border border-gray-100 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-800">
          Add Debt / Credit
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Entry
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {/* name */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Name
          </label>
          <textarea
            name="name"
            value={formData.name}
            onChange={handleChange}
            rows="1"
            className="rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Rate + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Interest Rate (%)
            </label>

            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Duration (Months)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className="rounded-lg border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Interest Preview */}
        <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-3">
          <span className="text-sm font-semibold text-green-700">
            Estimated Interest
          </span>
          <span className="text-lg font-bold text-green-700">
            {formattedInterest}
          </span>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => handleSubmit("debt")}
            disabled={loading}
            className="rounded-lg bg-red-500 py-2.5 font-bold text-white transition hover:bg-red-600"
          >
            {loading ? "Saving..." : "Save Debt"}
          </button>

          <button
            onClick={() => handleSubmit("credit")}
            disabled={loading}
            className="rounded-lg bg-green-500 py-2.5 font-bold text-white transition hover:bg-green-600"
          >
            {loading ? "Saving..." : "Save Credit"}
          </button>
        </div>
      </div>
    </div>
  );
}
