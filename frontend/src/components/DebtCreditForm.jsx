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
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Add Debt / Credit
      </h2>

      <div className="space-y-5">
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
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
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
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
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
            rows="3"
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Interest Preview */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between">
          <span className="text-sm font-semibold text-green-700">
            Estimated Interest
          </span>
          <span className="text-xl font-bold text-green-700">
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
            className="py-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition"
          >
            {loading ? "Saving..." : "Save Debt"}
          </button>

          <button
            onClick={() => handleSubmit("credit")}
            disabled={loading}
            className="py-3 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition"
          >
            {loading ? "Saving..." : "Save Credit"}
          </button>
        </div>
      </div>
    </div>
  );
}
