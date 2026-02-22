import React, { useState } from 'react';

export default function DebtCreditForm() {
  const [formData, setFormData] = useState({
    amount: '',
    rate: '',
    duration: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateInterest = () => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const duration = parseFloat(formData.duration) || 0;
    // Formula: Amount * (Interest Rate / 100) * Duration
    const interest = amount * (rate / 100) * duration;
    return interest.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  const handleSubmit = (type) => {
    console.log(`Saving ${type}:`, {
      ...formData,
      type,
      estimatedInterest: calculateInterest()
    });
    // Future: API call to save data
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg border border-gray-100 font-sans">
      <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">Add Transaction</h2>
      
      <div className="space-y-5">
        {/* Amount Input */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 50000"
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium placeholder-gray-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Interest Rate Input */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Interest Rate (%)</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              placeholder="e.g. 2"
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium placeholder-gray-300"
            />
          </div>

          {/* Duration Input */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration (Months)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 12"
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium placeholder-gray-300"
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium"
          />
        </div>

        {/* Notes Input */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Add any details here..."
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium placeholder-gray-300 resize-none"
          />
        </div>

        {/* Live Interest Preview */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
          <span className="text-sm text-green-700 font-semibold">Estimated Interest</span>
          <span className="text-xl font-bold text-green-700">{calculateInterest()}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button onClick={() => handleSubmit('debt')} className="py-3 rounded-lg font-bold text-white shadow-md bg-red-500 hover:bg-red-600 hover:scale-[1.02] transition-all duration-200">Save Debt</button>
          <button onClick={() => handleSubmit('credit')} className="py-3 rounded-lg font-bold text-white shadow-md bg-green-500 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200">Save Credit</button>
        </div>
      </div>
    </div>
  );
}
