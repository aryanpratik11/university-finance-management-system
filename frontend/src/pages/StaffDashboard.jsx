import { useEffect, useState } from "react";
import api from "../api.js";
import { format } from "date-fns";

export default function StaffDashboard() {
    const [payroll, setPayroll] = useState([]);
    const [stats, setStats] = useState({
        totalAmount: 0,
        lastPayment: null,
        averagePayment: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.get("/staff/payroll");
                const payrollData = res.data?.payroll || [];
                setPayroll(payrollData);

                // Calculate stats
                const totalAmount = payrollData.reduce((sum, p) => sum + (p.amount || 0), 0);

                let lastPayment = null;
                if (payrollData.length > 0) {
                    const validPayments = payrollData
                        .filter(p => p.paid_on && !isNaN(new Date(p.paid_on).getTime()))
                        .map(p => new Date(p.paid_on).getTime());

                    if (validPayments.length > 0) {
                        lastPayment = new Date(Math.max(...validPayments));
                    }
                }

                const averagePayment = payrollData.length > 0
                    ? totalAmount / payrollData.length
                    : 0;

                setStats({
                    totalAmount,
                    lastPayment,
                    averagePayment
                });
            } catch (err) {
                console.error("Failed to fetch payroll:", err);
                setPayroll([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-2">Loading your payroll information</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Staff Payroll Dashboard</h1>
                    <p className="text-gray-600 mt-1">View your salary payment history and details</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-900">
                            ₹{stats.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Across {payroll.length} payments
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Average Payment</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-900">
                            ₹{stats.averagePayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Per payment period
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Last Payment</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-900">
                            {stats.lastPayment ? format(stats.lastPayment, "MMM yyyy") : "-"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.lastPayment ? format(stats.lastPayment, "dd MMM yyyy") : "No payments yet"}
                        </p>
                    </div>
                </div>

                {/* Payroll Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Detailed record of all salary payments
                        </p>
                    </div>

                    {payroll.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No payroll records found
                        </div>
                    ) : (
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
                                    {payroll.map((p, idx) => (
                                        <tr key={`${p.month}-${idx}`} className="hover:bg-gray-50">
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
                    )}
                </div>

                {/* Download Section */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Download Records</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Export your payroll history for personal records
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200"
                            onClick={() => alert("Export functionality will be implemented here")}
                        >
                            Download as PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}