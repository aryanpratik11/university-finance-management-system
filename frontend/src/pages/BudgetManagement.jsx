import React, { useEffect, useState } from "react";
import api from "../api";

export default function BudgetManagement() {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [departmentId, setDepartmentId] = useState("");
    const [amount, setAmount] = useState("");
    const [availableBalance, setAvailableBalance] = useState(0);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        fetchDepartments();
        fetchAvailableBalance();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/budget-summary");
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
            setMessage({
                text: "Failed to load department budget summary",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };


    const fetchAvailableBalance = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/available-balance");
            setAvailableBalance(res.data.balance);
        } catch (err) {
            console.error(err);
            setMessage({
                text: "Failed to load available balance",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAllocate = async (e) => {
        e.preventDefault();

        if (!departmentId || !amount) {
            setMessage({
                text: "Please select a department and enter an amount",
                type: "error"
            });
            return;
        }

        try {
            const res = await api.put("/admin/budgets", {
                department_id: departmentId,
                allocated: amount,
            });

            setAmount("");
            setDepartmentId("");
            fetchAvailableBalance();
            fetchDepartments();
            setMessage({
                text: "Budget allocated successfully!",
                type: "success"
            });
        } catch (err) {
            console.error(err);
            setMessage({
                text: err.response?.data?.error || "Failed to allocate budget",
                type: "error"
            });
        }
    };
    if (loading) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div><p className="text-gray-600 mt-2">Loading Budget Management Portal...</p></div></div>); }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Departmental Budget Allocation</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and allocate budgets to departments
                    </p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-3 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-700 border-l-4 border-red-500" :
                        message.type === "success" ? "bg-green-100 text-green-700 border-l-4 border-green-500" :
                            "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Available Balance Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Available Balance</h2>
                    <div className="text-2xl font-bold text-blue-900"><p className="text-2xl font-bold text-green-600">
                        ₹ {availableBalance !== null && availableBalance !== undefined
                            ? availableBalance.toLocaleString()
                            : "Loading..."}
                    </p></div>
                </div>

                {/* Allocation Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Allocate Budget</h2>
                    <form onSubmit={handleAllocate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                required
                            >
                                <option value="">-- Select Department --</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Allocate (₹)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min={0}
                                step={0.01}
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-300 shadow-sm"
                        >
                            Allocate Budget
                        </button>
                    </form>
                </div>

                {/* Department Budgets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Department Budgets</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Money Spent</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {departments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{dept.allocated_budget?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{dept.spent?.toLocaleString() || '0'}
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