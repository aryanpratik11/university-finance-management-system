import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";

export default function DepartmentDashboard() {
    const [data, setData] = useState({
        budget: {},
        total_spent: 0,
        pendingExpenses: [],
        grants: [],
    });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        remainingBudget: 0,
        activeGrants: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/hod/dashboard");
                setData(data);

                setStats({
                    remainingBudget: data.budget.budget - data.total_spent,
                    activeGrants: data.grants.filter(g => g.status === 'active').length,
                });
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAction = async (id, action) => {
        const confirmMsg = `Are you sure you want to ${action} this expense?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.put(`/hod/expenses/${id}/${action}`);
            setData(prev => ({
                ...prev,
                pendingExpenses: prev.pendingExpenses.filter(e => e.id !== id)
            }));
            alert(`Expense ${action}d successfully.`);
        } catch (err) {
            console.error(`Failed to ${action} expense:`, err);
            alert(`Failed to ${action} expense. Please try again.`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-2">Loading department dashboard</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Department Dashboard</h1>
                    <p className="text-gray-600 mt-1">{data.budget.name || "Department"} financial overview</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-900">₹{data.budget.budget?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-900">₹{data.total_spent?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Remaining Budget</h3>
                        <p className={`mt-2 text-3xl font-bold ${stats.remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{stats.remainingBudget?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                {/* Pending Expenses */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Pending Expense Approvals</h2>
                            <p className="text-sm text-gray-500 mt-1">{data.pendingExpenses.length} requests awaiting your approval</p>
                        </div>
                    </div>
                    {data.pendingExpenses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No pending expenses to approve</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.pendingExpenses.map((e) => (
                                        <tr key={e.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{e.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.submitted_by_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(e.submitted_at), "dd MMM yyyy")}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Grants Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Grants</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {data.grants.length} total grants — {stats.activeGrants} active
                        </p>
                    </div>
                    {data.grants.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No grants available</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.grants.map((g) => (
                                        <tr key={g.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{g.funding_agency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{g.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(g.start_date), "MMM yyyy")} – {format(new Date(g.end_date), "MMM yyyy")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    g.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    g.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {g.status}
                                                </span>
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
