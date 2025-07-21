import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link, Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (user === null && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-blue-900">{user?.name}</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            You are logged in as{" "}
            <span className="font-medium text-blue-800">{user?.role}</span>
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Manage Users",
              description: "Add, edit, or remove staff and students",
              link: "/admin/users",
              icon: "👥",
            },
            {
              title: "View Transactions",
              description: "Review all financial transactions and logs",
              link: "/admin/transactions",
              icon: "💳",
            },
            {
              title: "Budget Management",
              description: "Allocate and track departmental budgets",
              link: "/admin/budgets",
              icon: "📊",
            },
            {
              title: "Financial Reports",
              description: "Generate revenue and expense reports",
              link: "/admin/reports",
              icon: "📈",
            },
            {
              title: "Staff Management",
              description: "Manage payroll and grants",
              link: "/admin/staff",
              icon: "💼",
            },
            {
              title: "Fee Collection",
              description: "Manage student fee payments and records",
              link: "/admin/fees",
              icon: "₹",
            },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-800">
                    {item.title}
                  </h2>
                </div>
                <p className="text-gray-600">{item.description}</p>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-blue-700 font-medium group-hover:bg-blue-50 transition-colors duration-300">
                Access panel →
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { value: "1,248", label: "Active Users", trend: "↑ 12%" },
            { value: "₹42.8L", label: "This Month", trend: "↑ 5.2%" },
            { value: "97%", label: "Fee Collection", trend: "↑ 3%" },
            { value: "32", label: "Pending Actions", trend: "↓ 8" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
              <p className="text-gray-600 mt-1">{stat.label}</p>
              <p
                className={`mt-2 text-sm ${stat.trend.startsWith("↑")
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {stat.trend}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
