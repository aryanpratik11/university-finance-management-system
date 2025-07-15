import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchInvoices = async () => {
        const { data } = await api.get("/admin/invoices", {
            params: statusFilter ? { status: statusFilter } : {},
        });
        setInvoices(data);
    };

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const handleStatusChange = async (id, newStatus) => {
        await api.put(`/admin/invoices/${id}`, { status: newStatus });
        fetchInvoices();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this invoice?")) return;
        await api.delete(`/admin/invoices/${id}`);
        fetchInvoices();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Invoices</h1>

            <div className="mb-4 flex gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            <table className="w-full border text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Student</th>
                        <th className="border p-2">Amount</th>
                        <th className="border p-2">Due Date</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((inv) => (
                        <tr key={inv.id}>
                            <td className="border p-2">{inv.id}</td>
                            <td className="border p-2">
                                {inv.student_name} ({inv.enrollment_no})
                            </td>
                            <td className="border p-2">₹{inv.amount}</td>
                            <td className="border p-2">
                                {format(new Date(inv.due_date), "dd/MM/yyyy")}
                            </td>
                            <td className="border p-2">{inv.status}</td>
                            <td className="border p-2 flex gap-2">
                                <select
                                    value={inv.status}
                                    onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                                    className="border px-1 py-1 rounded"
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                                <button
                                    onClick={() => handleDelete(inv.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
