import React, { useState, useEffect } from "react";

export default function AssignFeeFormModal({ isOpen, onClose, onAssign, feeStructures, students, departments }) {
    const initialAssignState = {
        student_id: "",
        batch: "",
        department_id: "",
        student_ids: [],
        fee_structure_id: ""
    };
    const [assignData, setAssignData] = useState(initialAssignState);
    const [assignMode, setAssignMode] = useState("single");
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAssignData(initialAssignState);
            setAssignMode("single");
        }
    }, [isOpen]);

    const isValidBatch = (batch) => /^\d{4}$/.test(batch);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((assignMode === 'batch' || assignMode === 'batch-department') && !isValidBatch(assignData.batch)) {
            alert("Please enter a valid 4-digit batch year (e.g., 2024)");
            return;
        }

        setFormLoading(true);
        const success = await onAssign(assignData, assignMode);
        setFormLoading(false);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
                    aria-label="Close"
                >
                    &times;
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Assign Fee to Students</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        {/* Fee Structure */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure</label>
                            <select
                                value={assignData.fee_structure_id}
                                onChange={(e) => setAssignData({ ...assignData, fee_structure_id: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                                required
                            >
                                <option value="">Select Fee Structure</option>
                                {feeStructures.map((fee) => (
                                    <option key={fee.id} value={fee.id} title={`${fee.name} - ₹${fee.amount.toLocaleString('en-IN')}`}>
                                        {fee.name} (₹{fee.amount.toLocaleString('en-IN')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assignment Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Mode</label>
                            <select
                                value={assignMode}
                                onChange={(e) => setAssignMode(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                            >
                                <option value="single">Single Student</option>
                                <option value="batch">Entire Batch</option>
                                <option value="department">Entire Department</option>
                                <option value="batch-department">Batch + Department</option>
                                <option value="custom">Custom List</option>
                            </select>
                        </div>

                        {/* Single Student Mode */}
                        {assignMode === 'single' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                                <select
                                    value={assignData.student_id}
                                    onChange={(e) => setAssignData({ ...assignData, student_id: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id} title={`${s.name} (${s.email})`}>
                                            {s.name} ({s.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Batch Field */}
                        {(assignMode === 'batch' || assignMode === 'batch-department') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 2024"
                                    value={assignData.batch}
                                    onChange={(e) => setAssignData({ ...assignData, batch: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                                    required
                                />
                            </div>
                        )}

                        {/* Department Field */}
                        {(assignMode === 'department' || assignMode === 'batch-department') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    value={assignData.department_id}
                                    onChange={(e) => setAssignData({ ...assignData, department_id: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id} title={dept.name}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Custom Student List */}
                        {assignMode === 'custom' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Students</label>
                                <select
                                    multiple
                                    value={assignData.student_ids}
                                    onChange={(e) => setAssignData({
                                        ...assignData,
                                        student_ids: Array.from(e.target.selectedOptions, (opt) => opt.value)
                                    })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full h-40"
                                    required
                                >
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id} title={`${s.name} (${s.email})`}>
                                            {s.name} ({s.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-4 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50"
                            disabled={formLoading}
                        >
                            {formLoading ? "Assigning..." : "Assign Fee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
