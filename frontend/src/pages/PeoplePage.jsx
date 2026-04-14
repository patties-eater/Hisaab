import React, { useEffect, useState } from "react";
import { useAccountMode } from "../accountMode";
import { apiUrl, getAuthHeaders } from "../components/api";
import { formatDisplayDate } from "../utils/dates";

const formatCurrency = (value) => {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });
};

export default function PeoplePage() {
  const { isShopMode } = useAccountMode();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/people"), {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTransactions(data.data);
        else setError("Server is busy right now. Please try again in a moment.");
      })
      .catch(() => setError("Server is busy right now. Please try again in a moment."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Debt & Credit Records</h1>
      <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Type
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Amount
              </th>
              {!isShopMode && (
                <th className="px-3 py-2 text-left text-sm font-semibold">
                  Rate
                </th>
              )}
              {!isShopMode && (
                <th className="px-3 py-2 text-left text-sm font-semibold">
                  Duration
                </th>
              )}
              {!isShopMode && (
                <th className="px-3 py-2 text-left text-sm font-semibold">
                  Interest
                </th>
              )}
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50 transition">
                <td
                  className={`px-3 py-2 font-semibold ${tx.type === "debt" ? "text-red-600" : "text-green-600"}`}
                >
                  {tx.type.toUpperCase()}
                </td>
                <td className="px-3 py-2">{formatCurrency(tx.amount)}</td>
                {!isShopMode && <td className="px-3 py-2">{tx.rate}%</td>}
                {!isShopMode && <td className="px-3 py-2">{tx.duration}</td>}
                {!isShopMode && (
                  <td className="px-3 py-2">
                    {formatCurrency(tx.estimated_interest)}
                  </td>
                )}
                <td className="px-3 py-2">
                  {formatDisplayDate(tx.date)}
                </td>
                <td className="px-3 py-2">{tx.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
