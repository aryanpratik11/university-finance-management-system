import React, { useState, useEffect } from "react";

export default function RecordTransactionFormModal({ isOpen, onClose, onSave, students, feeStructures }) {
    const initialTransactionState = { student_id: "", fee_id: "", amount: "", payment_method: "cash", receipt_number: "" };
    const [transactionData, setTransactionData] = useState(initialTransactionState);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTransactionData(initialTransactionState);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const success = await onSave(transactionData);
        setFormLoading(false);
        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Record New Transaction</h2></div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Student</label><select value={transactionData.student_id} onChange={(e) => setTransactionData({ ...transactionData, student_id: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required><option value="">Select Student</option>{students.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.email})</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Fee</label><select value={transactionData.fee_id} onChange={(e) => setTransactionData({ ...transactionData, fee_id: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required><option value="">Select Fee</option>{feeStructures.map((fee) => (<option key={fee.id} value={fee.id}>{fee.name}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label><input type="number" placeholder="Enter amount" value={transactionData.amount} onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label><select value={transactionData.payment_method} onChange={(e) => setTransactionData({ ...transactionData, payment_method: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option></select></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label><input type="text" placeholder="e.g., RCPT-12345" value={transactionData.receipt_number} onChange={(e) => setTransactionData({ ...transactionData, receipt_number: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" /></div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-4 rounded-b-xl">
                        <button type="button" onClick={onClose} className="text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50" disabled={formLoading}>{formLoading ? "Recording..." : "Record Transaction"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
