// TransactionTable.jsx

const formatCurrency = (value) => {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "NRS",
    maximumFractionDigits: 0,
  });
};

const TransactionTable = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Recent Transactions</h2>
      </div>

      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Date</th>
            <th className="p-4">Details</th>
            <th className="p-4 text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="p-4">{tx.name}</td>
              <td className="p-4">{tx.date}</td>
              <td className="p-4">
                <div>{tx.title || "-"}</div>
                <div className="text-xs text-gray-500">
                  {tx.debt_credit_id
                    ? "Created from debt/credit clearance"
                    : tx.type}
                </div>
              </td>
              <td
                className={`p-4 text-right font-bold ${
                  tx.type === "Income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.type === "Income" ? "+" : "-"} {formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
