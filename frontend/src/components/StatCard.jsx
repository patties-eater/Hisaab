// StatCard.jsx

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: "border-green-400",
    red: "border-red-400",
    blue: "border-blue-400",
  };

  const iconBg = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colorClasses[color]} flex justify-between items-center`}
    >
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase">
          {title}
        </h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full text-2xl ${iconBg[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;