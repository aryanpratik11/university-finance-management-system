import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { Navigate } from "react-router-dom";
import api from "../api";
import { format } from "date-fns";

export default function FacultyDashboard() {
  const { user, isAuthenticated } = useContext(AuthContext);

  const [data, setData] = useState({ payroll: [], grants: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState({
    amount: "",
    description: "",
    receipt_url: ""
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data } = await api.get("/faculty/dashboard");
        setData(data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(user.department_id);
      console.log(expense.amount);
      const payload = {
        department_id: user?.department_id,
        amount: parseFloat(expense.amount),
        description: expense.description,
        submitted_by: user?.id,
        receipt_url: expense.receipt_url || null,
      };
      if (isNaN(payload.department_id) || isNaN(payload.amount)) {
        alert("Please enter valid department and amount.");
        return;
      }
      await api.post("/faculty/expenses", payload);
      alert("Expense request submitted successfully!");
      setExpense({ ...expense, amount: "", description: "" });
      const { data } = await api.get("/faculty/dashboard");
      setData(data);
    } catch (err) {
      alert("Failed to submit expense.");
      console.error(err);
    }
  };

  if (!isAuthenticated && user === null) {
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
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, <span className="text-blue-900">{user.name}</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Faculty Dashboard - {user.department || "No department assigned"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Salary</h3>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              ₹{(data.payroll?.reduce((sum, p) => sum + p.amount, 0) || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {data.payroll.length} payments received
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Active Grants</h3>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {data.grants.filter(g => g.status === 'active').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ₹{data.grants.reduce((sum, g) => sum + g.amount, 0).toLocaleString()} total funding
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Pending Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {data.expenses.filter(e => e.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {data.expenses.length} total requests
            </p>
          </div>
        </div>

        {/* Expense Request Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Submit New Expense Request
            </h2>
          </div>
          <form onSubmit={handleExpenseSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
                <input
                  type="text"
                  value={user.department_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={expense.amount}
                  onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Purpose of expense"
                  value={expense.description}
                  onChange={(e) => setExpense({ ...expense, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/receipt.jpg"
                  value={expense.receipt_url}
                  onChange={(e) => setExpense({ ...expense, receipt_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>

        {/* Payroll Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payroll History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.payroll.map((p) => (
                  <tr key={p.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.paid_on ? format(new Date(p.paid_on), "dd MMM yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.paid_on ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {p.paid_on ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grants Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Research Grants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funding Agency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.grants.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {g.funding_agency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{g.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.status === 'active' ? 'bg-green-100 text-green-800' :
                        g.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(g.start_date), "MMM yyyy")} - {format(new Date(g.end_date), "MMM yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expense Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {e.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{e.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(e.submitted_at), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${e.status === 'approved' ? 'bg-green-100 text-green-800' :
                        e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}