import React, { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";
import PayrollEditModal from "../components/PayrollEditModal";
import { jsPDF } from "jspdf";

export default function PayrollManagement() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/allpayrolls");
            setPayrolls(res.data.payrolls || []);
        } catch (err) {
            console.error("Failed to fetch payrolls", err);
            setMessage({
                text: "Failed to load payroll data",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (payrollId) => {
        try {
            setMessage({ text: "Processing payment...", type: "info" });
            const res = await api.post(`/admin/pay/${payrollId}`);
            console.log(res);
            setMessage({
                text: res.data.message || "Payment successful",
                type: "success",
            });
            fetchPayrolls();
        } catch (err) {
            console.error("Payment failed:", err);
            setMessage({
                text: err.response?.data?.error || "Payment failed",
                type: "error",
            });
        }
    };


    const generatePayrolls = async () => {
        try {
            setGenerating(true);
            setMessage({ text: "Generating payrolls...", type: "info" });
            const res = await api.post("/admin/generatepayroll");
            setMessage({
                text: res.data.message || "Payrolls generated successfully!",
                type: "success"
            });
            await fetchPayrolls();
        } catch (err) {
            console.error(err);
            setMessage({
                text: err.response?.data?.message || "Failed to generate payrolls",
                type: "error"
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateSuccess = () => {
        setEditModalOpen(false);
        fetchPayrolls();
        setMessage({
            text: "Payroll updated successfully!",
            type: "success"
        });
    };

    const generatePayrollReceipt = (payroll) => {
        const doc = new jsPDF();

        // Logo (hosted or public folder)
        const logoUrl = "/AcadmiVault UFM header.png";
        const imgWidth = 25;
        const imgHeight = 25;

        doc.addImage(logoUrl, "PNG", 20, 10, imgWidth, imgHeight);

        // Header Text
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("AcadmiVault UFM", 50, 18);
        doc.setFontSize(10);
        doc.text("University Finance Management Webapp", 50, 24);

        // Title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PAYROLL PAYMENT RECEIPT", 105, 40, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Receipt Info
        let y = 55;
        const lineGap = 8;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, y - 20);

        const rows = [
            ["Payroll ID", payroll.id],
            ["Employee Name", payroll.staff_name || payroll.name],
            ["Employee ID", payroll.staff_id || "N/A"],
            ["Department", payroll.department || "N/A"],
            ["Month", payroll.month],
            ["Amount Paid", `₹${payroll.amount}`],
            ["Payment Status", payroll.status],
            ["Paid On", new Date(payroll.paid_on).toLocaleDateString()],
            ["Payment Method", "Online"],
            ["Approved By", payroll.approved_by || "Finance Manager"]
        ];

        rows.forEach(([label, value]) => {
            doc.text(`${label}:`, 30, y);
            doc.text(`${value}`, 90, y);
            y += lineGap;
        });

        // Footer Line
        doc.line(20, y + 5, 190, y + 5);

        // Footer Note
        doc.setFontSize(10);
        doc.text("This is a system-generated receipt. No signature required.", 105, y + 20, { align: "center" });

        doc.save(`payroll-receipt-${payroll.id}.pdf`);
    };




    useEffect(() => {
        fetchPayrolls();
    }, []);

    if (loading) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div><p className="text-gray-600 mt-2">Loading Staff Management Portal...</p></div></div>); }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                        <p className="text-gray-600 mt-1">
                            View and manage all payroll records
                        </p>
                    </div>
                    <button
                        onClick={generatePayrolls}
                        disabled={generating}
                        className={`px-4 py-2.5 rounded-lg font-medium transition-colors duration-300 shadow-sm whitespace-nowrap ${generating
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-900 hover:bg-blue-800 text-white"
                            }`}
                    >
                        {generating ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : "Generate Current Month Payroll"}
                    </button>
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

                {/* Payroll Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600">Loading payroll data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                No payroll records found
                                            </td>
                                        </tr>
                                    ) : (
                                        payrolls.map((payroll) => (
                                            <tr key={payroll.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{payroll.staff_id}</div>
                                                    {payroll.staff_name && (
                                                        <div className="text-sm text-gray-500">{payroll.staff_name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                    {payroll.role}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {payroll.month}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₹{parseFloat(payroll.amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payroll.paid_on
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}>
                                                        {payroll.paid_on ? "Paid" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {payroll.processed_by || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPayroll(payroll);
                                                            setEditModalOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 hover:underline"
                                                    >
                                                        Edit
                                                    </button>

                                                    {!payroll.paid_on ? (
                                                        <button
                                                            onClick={() => handlePay(payroll.id)}
                                                            className="text-green-600 hover:text-green-800 hover:underline"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => generatePayrollReceipt(payroll)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            Download Receipt
                                                        </button>
                                                    )}

                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                <PayrollEditModal
                    isOpen={editModalOpen}
                    payroll={selectedPayroll}
                    onClose={() => setEditModalOpen(false)}
                    onUpdate={fetchPayrolls}
                />
            </div>
        </div>
    );
}