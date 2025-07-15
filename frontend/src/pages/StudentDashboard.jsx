import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { format } from "date-fns";

export default function StudentDashboard() {
    const [fees, setFees] = useState([]);
    const [applications, setApplications] = useState([]);
    const [disbursements, setDisbursements] = useState([]);
    const [stats, setStats] = useState({
        totalFees: 0,
        pendingFees: 0,
        totalAid: 0,
        pendingApps: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [feesRes, appsRes, disbRes] = await Promise.all([
                    api.get("/student/fees"),
                    api.get("/student/aid-applications"),
                    api.get("/student/disbursements"),
                ]);

                const feesData = feesRes.data?.fees || [];
                const appsData = appsRes.data?.applications || [];
                const disbData = disbRes.data?.disbursements || [];

                setFees(feesData);
                setApplications(appsData);
                setDisbursements(disbData);

                // Calculate stats
                setStats({
                    totalFees: feesData.reduce((sum, f) => sum + f.amount, 0),
                    pendingFees: feesData.filter(f => f.status === 'pending').length,
                    totalAid: disbData.reduce((sum, d) => sum + d.amount, 0),
                    pendingApps: appsData.filter(a => a.status === 'pending').length
                });
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-2">Loading your dashboard</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your fees, aid applications, and disbursements</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Fees Due</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-900">
                            ₹{stats.totalFees.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.pendingFees} pending payments
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Aid Received</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">
                            ₹{stats.totalAid.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            From {disbursements.length} disbursements
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Pending Applications</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">
                            {stats.pendingApps}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Aid applications under review
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
                        <div className="mt-4 space-y-2">
                            <Link
                                to="/student/pay-fees"
                                className="inline-block w-full px-3 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg text-center hover:bg-blue-800 transition-colors"
                            >
                                Pay Fees
                            </Link>
                            <Link
                                to="/student/apply-aid"
                                className="inline-block w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg text-center hover:bg-gray-50 transition-colors"
                            >
                                Apply for Aid
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Fees Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Fee Payments</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {fees.length} total fees - {stats.pendingFees} pending
                            </p>
                        </div>
                        <Link
                            to="/student/fees"
                            className="text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>

                    {fees.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No fee records found
                        </div>
                    ) : (
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
                                            Due Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fees.slice(0, 3).map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {fee.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₹{fee.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {fee.due_date ? format(new Date(fee.due_date), "dd MMM yyyy") : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Aid Applications Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Aid Applications</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {applications.length} total applications - {stats.pendingApps} pending
                            </p>
                        </div>
                        <Link
                            to="/student/aid-applications"
                            className="text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>

                    {applications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No aid applications submitted yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aid Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.slice(0, 3).map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {app.aid_type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₹{app.amount_requested.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(app.submitted_at), "dd MMM yyyy")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Disbursements Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Aid Disbursements</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {disbursements.length} total disbursements received
                            </p>
                        </div>
                        <Link
                            to="/student/disbursements"
                            className="text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>

                    {disbursements.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No disbursements received yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aid Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Disbursed On
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {disbursements.slice(0, 3).map((d) => (
                                        <tr key={d.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {d.aid_type || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₹{d.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(d.disbursed_at), "dd MMM yyyy")}
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