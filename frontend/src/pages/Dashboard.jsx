// import React from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';

// // --- Mock Data ---

// const summaryData = {
//   given: 150000,
//   taken: 220000,
// };

// const recentTransactions = [
//   { id: 1, name: 'Alice Johnson', type: 'credit', amount: 5000, date: '2023-10-24' },
//   { id: 2, name: 'Bob Smith', type: 'debt', amount: 1200, date: '2023-10-23' },
//   { id: 3, name: 'Charlie Brown', type: 'credit', amount: 15000, date: '2023-10-22' },
//   { id: 4, name: 'David Wilson', type: 'debt', amount: 300, date: '2023-10-21' },
//   { id: 5, name: 'Eva Davis', type: 'credit', amount: 2200, date: '2023-10-20' },
// ];

// const upcomingPayments = [
//   { id: 1, name: 'Frank Miller', amount: 10000, rate: '5%', dueDate: '2023-10-25', status: 'Due Soon' },
//   { id: 2, name: 'Grace Lee', amount: 5000, rate: '2%', dueDate: '2023-10-15', status: 'Overdue' },
//   { id: 3, name: 'Henry Ford', amount: 20000, rate: '4%', dueDate: '2023-11-01', status: 'Due Soon' },
// ];

// const monthlyData = [
//   { name: 'Jan', inflow: 4000, outflow: 2400 },
//   { name: 'Feb', inflow: 3000, outflow: 1398 },
//   { name: 'Mar', inflow: 2000, outflow: 9800 },
//   { name: 'Apr', inflow: 2780, outflow: 3908 },
//   { name: 'May', inflow: 1890, outflow: 4800 },
//   { name: 'Jun', inflow: 2390, outflow: 3800 },
//   { name: 'Jul', inflow: 3490, outflow: 4300 },
//   { name: 'Aug', inflow: 4000, outflow: 2400 },
//   { name: 'Sep', inflow: 3000, outflow: 1398 },
//   { name: 'Oct', inflow: 2000, outflow: 9800 },
//   { name: 'Nov', inflow: 2780, outflow: 3908 },
//   { name: 'Dec', inflow: 1890, outflow: 4800 },
// ];

// const pieData = [
//   { name: 'Total Debt', value: 400 },
//   { name: 'Total Credit', value: 300 },
// ];

// const COLORS = ['#EF4444', '#10B981']; // Red for Debt, Green for Credit

// // --- Helper Functions ---

// const formatCurrency = (value) => {
//   return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
// };

// // --- Components ---

// export default function Dashboard() {
//   const netBalance = summaryData.taken - summaryData.given;
//   const isProfit = netBalance >= 0;

//   return (
//     <div className="min-h-screen bg-[#f9fafb] p-6 font-sans text-gray-800">
//       <header className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hisaab Dashboard</h1>
//           <p className="text-gray-500 mt-1">Overview of your financial activity</p>
//         </div>
//         <div className="hidden md:block">
//           <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
//             Beta v1.0
//           </span>
//         </div>
//       </header>

//       {/* 1️⃣ TOP SECTION – Financial Summary Cards */}
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {/* Card 1: Total You Gave */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-400 hover:shadow-lg transition-shadow duration-300 flex justify-between items-start">
//           <div>
//             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total You Gave</h3>
//             <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summaryData.given)}</p>
//             <p className="text-xs text-red-500 mt-1 font-medium">Money Out</p>
//           </div>
//           <div className="p-3 bg-red-50 rounded-full text-2xl">💸</div>
//         </div>

//         {/* Card 2: Total You Took */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-400 hover:shadow-lg transition-shadow duration-300 flex justify-between items-start">
//           <div>
//             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total You Took</h3>
//             <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summaryData.taken)}</p>
//             <p className="text-xs text-green-500 mt-1 font-medium">Money In</p>
//           </div>
//           <div className="p-3 bg-green-50 rounded-full text-2xl">💰</div>
//         </div>

//         {/* Card 3: Net Balance */}
//         <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${isProfit ? 'border-green-600' : 'border-red-600'} hover:shadow-lg transition-shadow duration-300 flex justify-between items-start`}>
//           <div>
//             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Net Balance</h3>
//             <p className={`text-3xl font-bold mt-2 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
//               {isProfit ? '+' : ''}{formatCurrency(netBalance)}
//             </p>
//             <p className={`text-xs mt-1 font-bold uppercase ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
//               {isProfit ? 'Profit' : 'Loss'}
//             </p>
//           </div>
//           <div className={`p-3 rounded-full text-xl font-bold ${isProfit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//             {isProfit ? '↗' : '↘'}
//           </div>
//         </div>
//       </section>

//       {/* 2️⃣ MIDDLE SECTION – Activity Overview */}
//       <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Left: Recent Transactions */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
//             <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-100">
//                   <th className="text-xs font-semibold text-gray-400 uppercase p-3">Person</th>
//                   <th className="text-xs font-semibold text-gray-400 uppercase p-3">Type</th>
//                   <th className="text-xs font-semibold text-gray-400 uppercase p-3">Amount</th>
//                   <th className="text-xs font-semibold text-gray-400 uppercase p-3 text-right">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {recentTransactions.map((tx) => (
//                   <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
//                     <td className="p-3 text-gray-700 font-medium">{tx.name}</td>
//                     <td className="p-3">
//                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                         {tx.type === 'credit' ? 'Credit' : 'Debt'}
//                       </span>
//                     </td>
//                     <td className={`p-3 font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
//                       {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
//                     </td>
//                     <td className="p-3 text-gray-400 text-sm text-right">{tx.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Right: Upcoming Interest Payments */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold text-gray-800">Upcoming Interest</h2>
//             <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Calendar</button>
//           </div>
//           <div className="space-y-4">
//             {upcomingPayments.map((payment) => (
//               <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
//                 <div className="flex flex-col">
//                   <span className="font-bold text-gray-800 text-lg">{payment.name}</span>
//                   <span className="text-xs text-gray-500 mt-1">
//                     Rate: <span className="font-medium text-gray-700">{payment.rate}</span> • Due: <span className="font-medium text-gray-700">{payment.dueDate}</span>
//                   </span>
//                 </div>
//                 <div className="text-right flex flex-col items-end">
//                   <span className="font-bold text-gray-900 text-lg">{formatCurrency(payment.amount)}</span>
//                   <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${payment.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
//                     {payment.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 3️⃣ BOTTOM SECTION – Analytics */}
//       <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Chart: Monthly Inflow vs Outflow */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Inflow vs Outflow</h2>
//           <div className="h-80 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//                 <XAxis 
//                   dataKey="name" 
//                   stroke="#9ca3af" 
//                   fontSize={12} 
//                   tickLine={false} 
//                   axisLine={false} 
//                   dy={10}
//                 />
//                 <YAxis 
//                   stroke="#9ca3af" 
//                   fontSize={12} 
//                   tickLine={false} 
//                   axisLine={false} 
//                   tickFormatter={(value) => `₹${value/1000}k`} 
//                 />
//                 <Tooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
//                   itemStyle={{ fontSize: '14px', fontWeight: 600 }}
//                   cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
//                 />
//                 <Legend verticalAlign="top" height={36} iconType="circle" />
//                 <Line 
//                   type="monotone" 
//                   dataKey="inflow" 
//                   name="Inflow" 
//                   stroke="#10B981" 
//                   strokeWidth={3} 
//                   dot={false} 
//                   activeDot={{ r: 6, strokeWidth: 0 }} 
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="outflow" 
//                   name="Outflow" 
//                   stroke="#EF4444" 
//                   strokeWidth={3} 
//                   dot={false} 
//                   activeDot={{ r: 6, strokeWidth: 0 }} 
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Right Chart: Debt vs Credit Ratio */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h2 className="text-xl font-bold text-gray-800 mb-6">Debt vs Credit Ratio</h2>
//           <div className="h-80 w-full flex justify-center items-center relative">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={80}
//                   outerRadius={110}
//                   paddingAngle={5}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip 
//                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
//                 />
//                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
//               </PieChart>
//             </ResponsiveContainer>
//             {/* Center Text Overlay */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
//               <span className="text-gray-400 text-sm font-medium">Total Volume</span>
//               <span className="text-3xl font-bold text-gray-800">700</span>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }



import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// --- Mock Data ---

const members = [
  { id: 1, name: 'Prajjwal' },
  { id: 2, name: 'Dad' },
  { id: 3, name: 'Mom' },
];

const activeMember = members[0];

const allTransactions = [
  // Member 1 (Prajjwal)
  { id: 1, memberId: 1, category: 'credit', personName: 'Alice Johnson', amount: 5000, date: '2023-10-24' },
  { id: 2, memberId: 1, category: 'debt', personName: 'Bob Smith', amount: 1200, date: '2023-10-23' },
  { id: 5, memberId: 1, category: 'credit', personName: 'Eva Davis', amount: 2200, date: '2023-10-20' },
  { id: 8, memberId: 1, category: 'debt', personName: 'Henry Ford', amount: 1500, date: '2023-10-17' },
  { id: 9, memberId: 1, category: 'income', personName: 'Salary', amount: 75000, date: '2023-10-01' },
  { id: 10, memberId: 1, category: 'expense', personName: 'Groceries', amount: 4500, date: '2023-10-15' },

  // Member 2 (Dad)
  { id: 3, memberId: 2, category: 'credit', personName: 'Charlie Brown', amount: 15000, date: '2023-10-22' },
  { id: 6, memberId: 2, category: 'debt', personName: 'Frank Miller', amount: 4500, date: '2023-10-19' },
  { id: 11, memberId: 2, category: 'income', personName: 'Pension', amount: 40000, date: '2023-10-05' },
  { id: 12, memberId: 2, category: 'expense', personName: 'Utilities', amount: 8000, date: '2023-10-10' },

  // Member 3 (Mom)
  { id: 4, memberId: 3, category: 'debt', personName: 'David Wilson', amount: 300, date: '2023-10-21' },
  { id: 7, memberId: 3, category: 'credit', personName: 'Grace Lee', amount: 8000, date: '2023-10-18' },
  { id: 13, memberId: 3, category: 'income', personName: 'Interest', amount: 5000, date: '2023-10-12' },
  { id: 14, memberId: 3, category: 'expense', personName: 'Shopping', amount: 7000, date: '2023-10-25' },
];

const allUpcomingPayments = [
  { id: 1, memberId: 1, name: 'Frank Miller', amount: 10000, rate: '5%', dueDate: '2023-10-25', status: 'Due Soon' },
  { id: 2, memberId: 2, name: 'Grace Lee', amount: 5000, rate: '2%', dueDate: '2023-10-15', status: 'Overdue' },
  { id: 3, memberId: 1, name: 'Henry Ford', amount: 20000, rate: '4%', dueDate: '2023-11-01', status: 'Due Soon' },
  { id: 4, memberId: 3, name: 'Ivy Chen', amount: 3000, rate: '3%', dueDate: '2023-10-28', status: 'Due Soon' },
];

// Generate monthly data for all members
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const rawMonthlyData = [];

members.forEach(member => {
  months.forEach((month, index) => {
    // Generate consistent mock data based on member ID and month index
    const baseInflow = 2000 + (member.id * 1000);
    const baseOutflow = 1000 + (member.id * 500);
    const variance = (index % 5) * 500;
    
    rawMonthlyData.push({
      memberId: member.id,
      month: month,
      inflow: baseInflow + variance,
      outflow: baseOutflow + (variance / 2),
    });
  });
});

const PIE_COLORS = ['#FBBF24', '#60A5FA']; // Yellow for Debtors, Blue for Creditors

// --- Helper Functions ---

const formatCurrency = (value) => {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

// --- Components ---

export default function Dashboard() {
  const [viewMode, setViewMode] = useState('personal'); // 'personal' | 'family'

  // --- Filter Logic ---

  const filteredTransactions = useMemo(() => {
    if (viewMode === 'personal') {
      return allTransactions.filter(tx => tx.memberId === activeMember.id);
    }
    return allTransactions;
  }, [viewMode]);

  const filteredUpcoming = useMemo(() => {
    if (viewMode === 'personal') {
      return allUpcomingPayments.filter(p => p.memberId === activeMember.id);
    }
    return allUpcomingPayments;
  }, [viewMode]);

  // --- Summary Calculations ---

  const { incomeTotal, expenseTotal, debtorsTotal, creditorsTotal } = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.category === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const expense = filteredTransactions
      .filter(tx => tx.category === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const debtors = filteredTransactions
      .filter(tx => tx.category === 'debt')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const creditors = filteredTransactions
      .filter(tx => tx.category === 'credit')
      .reduce((acc, tx) => acc + tx.amount, 0);

    return {
      incomeTotal: income,
      expenseTotal: expense,
      debtorsTotal: debtors,
      creditorsTotal: creditors,
    };
  }, [filteredTransactions]);

  // --- Chart Data Calculations ---

  const chartData = useMemo(() => {
    const dataToProcess = viewMode === 'personal'
      ? rawMonthlyData.filter(d => d.memberId === activeMember.id)
      : rawMonthlyData;

    return months.map(month => {
      const entries = dataToProcess.filter(d => d.month === month);
      return {
        name: month,
        inflow: entries.reduce((sum, e) => sum + e.inflow, 0),
        outflow: entries.reduce((sum, e) => sum + e.outflow, 0),
      };
    });
  }, [viewMode]);

  const pieData = useMemo(() => {
    return [
      { name: 'Debtors', value: debtorsTotal },
      { name: 'Creditors', value: creditorsTotal },
    ];
  }, [debtorsTotal, creditorsTotal]);

  const debtCreditTransactionsCount = useMemo(() => {
    return filteredTransactions.filter(tx => tx.category === 'debt' || tx.category === 'credit').length;
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 font-sans text-gray-800">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hisaab Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {viewMode === 'personal' 
              ? `Viewing: ${activeMember.name} (Personal)` 
              : 'Viewing: Entire Family'}
          </p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setViewMode('personal')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              viewMode === 'personal' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setViewMode('family')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              viewMode === 'family' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Family
          </button>
        </div>
      </header>

      {/* 1️⃣ TOP SECTION – Financial Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Income */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-400 hover:shadow-lg transition-shadow duration-300 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Income</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(incomeTotal)}</p>
            <p className="text-xs text-green-500 mt-1 font-medium">Money In</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-2xl">💰</div>
        </div>

        {/* Card 2: Expenses */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-400 hover:shadow-lg transition-shadow duration-300 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Expenses</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(expenseTotal)}</p>
            <p className="text-xs text-red-500 mt-1 font-medium">Money Out</p>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-2xl">💸</div>
        </div>

        {/* Card 3: Debtors */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400 hover:shadow-lg transition-shadow duration-300 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Debtors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(debtorsTotal)}</p>
            <p className="text-xs text-yellow-600 mt-1 font-medium">Others Owe You</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full text-2xl">🙌</div>
        </div>

        {/* Card 4: Creditors */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-400 hover:shadow-lg transition-shadow duration-300 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Creditors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(creditorsTotal)}</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">You Owe Others</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-2xl">🙏</div>
        </div>
      </section>

      {/* 2️⃣ MIDDLE SECTION – Activity Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-xs font-semibold text-gray-400 uppercase p-3">Person</th>
                  <th className="text-xs font-semibold text-gray-400 uppercase p-3">Type</th>
                  <th className="text-xs font-semibold text-gray-400 uppercase p-3">Amount</th>
                  <th className="text-xs font-semibold text-gray-400 uppercase p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-5">
                {filteredTransactions.map((tx) => {
                  const isInflow = tx.category === 'credit' || tx.category === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-3 text-gray-700 font-medium">{tx.personName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                          tx.category === 'income' ? 'bg-green-100 text-green-700' :
                          tx.category === 'expense' ? 'bg-red-100 text-red-700' :
                          tx.category === 'debt' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`p-3 font-bold ${isInflow ? 'text-green-600' : 'text-red-600'}`}>
                        {isInflow ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="p-3 text-gray-400 text-sm text-right">{tx.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Upcoming Interest Payments */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Interest</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Calendar</button>
          </div>
          <div className="space-y-4">
            {filteredUpcoming.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">{payment.name}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Rate: <span className="font-medium text-gray-700">{payment.rate}</span> • Due: <span className="font-medium text-gray-700">{payment.dueDate}</span>
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(payment.amount)}</span>
                  <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${payment.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ BOTTOM SECTION – Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Monthly Inflow vs Outflow */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Inflow vs Outflow</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value/1000}k`} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="inflow" 
                  name="Inflow" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="outflow" 
                  name="Outflow" 
                  stroke="#EF4444" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Debtors vs Creditors */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Debtors vs Creditors</h2>
          <div className="h-80 w-full flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-gray-400 text-sm font-medium">Total Volume</span>
              <span className="text-3xl font-bold text-gray-800">{debtCreditTransactionsCount}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
