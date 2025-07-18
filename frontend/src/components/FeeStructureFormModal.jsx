import React, { useEffect, useState } from "react";

export default function FeeStructureFormModal({ isOpen, onClose, onSave, editingFee }) {
    const initialFormState = { name: "", amount: "", description: "", due_date: "" };
    const [formData, setFormData] = useState(initialFormState);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingFee) {
                const formattedDate = editingFee.due_date ? new Date(editingFee.due_date).toISOString().split('T')[0] : "";
                setFormData({ ...editingFee, due_date: formattedDate });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [editingFee, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const success = await onSave(formData, editingFee ? editingFee.id : null);
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
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">{editingFee ? "Edit Fee Structure" : "Create New Fee Structure"}</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" required /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" rows="3" /></div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-4 rounded-b-xl">
                        <button type="button" onClick={onClose} className="text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50" disabled={formLoading}>{formLoading ? "Saving..." : "Save"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
