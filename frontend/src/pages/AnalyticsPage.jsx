import React from "react";
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

const monthlyData = [
  { name: "Jan", inflow: 45000, outflow: 32000 },
  { name: "Feb", inflow: 52000, outflow: 28000 },
  { name: "Mar", inflow: 48000, outflow: 40000 },
  { name: "Apr", inflow: 61000, outflow: 35000 },
  { name: "May", inflow: 55000, outflow: 45000 },
  { name: "Jun", inflow: 67000, outflow: 38000 },
  { name: "Jul", inflow: 72000, outflow: 42000 },
  { name: "Aug", inflow: 68000, outflow: 39000 },
  { name: "Sep", inflow: 64000, outflow: 31000 },
  { name: "Oct", inflow: 75000, outflow: 46000 },
  { name: "Nov", inflow: 81000, outflow: 50000 },
  { name: "Dec", inflow: 95000, outflow: 60000 },
];

const debtCreditData = [
  { name: "Debt", value: 125000 },
  { name: "Credit", value: 340000 },
];

const COLORS = ["#EF4444", "#10B981"];

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Financial Analytics</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Download Report
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Monthly Cash Flow
            </h2>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
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

          {/* Pie Chart */}
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Simple Legend */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-red-600 font-medium">
                <span>Total Debt</span>
                <span>₹125,000</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Total Credit</span>
                <span>₹340,000</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;