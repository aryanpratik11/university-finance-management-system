import { useEffect, useState } from "react";
import api from "../api.js";
import { format } from "date-fns";

export default function FinManDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/finance-manager/expenses");
        setExpenses(data);
        
        // Calculate stats
        const pending = data.filter(e => e.status === 'pending').length;
        const approved = data.filter(e => e.status === 'approved').length;
        const rejected = data.filter(e => e.status === 'rejected').length;
        const totalAmount = data.reduce((sum, e) => sum + e.amount, 0);
        
        setStats({
          pending,
          approved,
          rejected,
          totalAmount
        });
      } catch (err) {
        console.error("Error fetching expenses:", err);
        alert("Failed to load expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.post(`/finance-manager/expenses/${id}/${action}`);
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: action } : e
        )
      );
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: action === 'approve' ? prev.pending - 1 : prev.pending - 1,
        approved: action === 'approve' ? prev.approved + 1 : prev.approved,
        rejected: action === 'reject' ? prev.rejected + 1 : prev.rejected
      }));
    } catch (err) {
      console.error(`Error trying to ${action}:`, err);
      alert(`Failed to ${action} expense.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Finance Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and manage expense requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
            <p className="mt-2 text-3xl font-bold text-blue-900">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-500 mt-1">Total approved</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-500 mt-1">Total rejected</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="mt-2 text-3xl font-bold text-blue-900">₹{stats.totalAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Across all requests</p>
          </div>
        </div>

        {/* Expense Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expense Requests</h2>
            <p className="text-sm text-gray-500 mt-1">
              {expenses.length} total requests ({stats.pending} pending review)
            </p>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No expense requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {e.faculty_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {e.department_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{e.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {e.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          e.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(e.submitted_at), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {e.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(e.id, "approve")}
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(e.id, "reject")}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}