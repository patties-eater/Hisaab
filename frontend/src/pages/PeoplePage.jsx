import React from 'react';

// --- Mock Data ---
const peopleData = [
  { id: 1, name: 'Alice Johnson', owedByThem: 12000, youOweThem: 0, interestRate: '12% p.a.' },
  { id: 2, name: 'Bob Smith', owedByThem: 0, youOweThem: 8500, interestRate: '2% p.m.' },
  { id: 3, name: 'Charlie Brown', owedByThem: 5000, youOweThem: 2000, interestRate: '1.5% p.m.' },
  { id: 4, name: 'David Wilson', owedByThem: 150000, youOweThem: 0, interestRate: '10% p.a.' },
  { id: 5, name: 'Eva Davis', owedByThem: 0, youOweThem: 0, interestRate: '0%' },
  { id: 6, name: 'Frank Miller', owedByThem: 4500, youOweThem: 1200, interestRate: '5% p.a.' },
];

// --- Helper Functions ---
const formatCurrency = (value) => {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

export default function PeoplePage() {
  const handleAction = (action, personName) => {
    console.log(`${action} clicked for ${personName}`);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 font-sans text-gray-800">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">People</h1>
        <p className="text-gray-500 mt-1">Manage your lending and borrowing relationships</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {peopleData.map((person) => (
          <div 
            key={person.id} 
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Section */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{person.name}</h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {person.interestRate}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Owed by them</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(person.owedByThem)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">You owe them</span>
                  <span className="text-lg font-bold text-red-500">
                    {formatCurrency(person.youOweThem)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section (Buttons) */}
            <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleAction('Add Debt', person.name)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-center"
              >
                Add Debt
              </button>
              <button 
                onClick={() => handleAction('Add Credit', person.name)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-center"
              >
                Add Credit
              </button>
              <button 
                onClick={() => handleAction('Add Transaction', person.name)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-center"
              >
                Transaction
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
