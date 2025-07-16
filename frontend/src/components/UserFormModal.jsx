import { useState, useEffect } from "react";
import api from "../api";
import Papa from "papaparse";

export default function UserFormModal({
    user,
    prefillDepartmentId,
    prefillDepartmentName,
    onClose,
    onSuccess
}) {
    const isEdit = !!user;
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        department_id: "",
        enrollment_no: "",
        batch: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [bulkStudents, setBulkStudents] = useState([]);
    const [bulkError, setBulkError] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);

    const roles = [
        { value: "admin", label: "Admin" },
        { value: "finance_manager", label: "Finance Manager" },
        { value: "hod", label: "Department Head" },
        { value: "student", label: "Student" },
        { value: "staff", label: "Staff" },
        { value: "faculty", label: "Faculty" }
    ];

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                role: user.role || "",
                department_id: user.department_id || "",
                enrollment_no: user.enrollment_no || "",
                batch: user.batch || "",
            });
        } else {
            setForm((prev) => ({
                ...prev,
                department_id: prefillDepartmentId ? String(prefillDepartmentId) : "",
            }));
        }
    }, [user, prefillDepartmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleSelect = (role) => {
        setForm((prev) => ({ ...prev, role }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/admin/upuser/${user.id}`, {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    department_id: form.department_id || null,
                    ...(form.role === "student" && {
                        studentData: {
                            enrollment_no: form.enrollment_no,
                            batch: parseInt(form.batch),
                        }
                    }),
                });
            } else {
                await api.post("/admin/adduser", {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    department_id: form.department_id || null,
                    ...(form.role === "student" && {
                        studentData: {
                            enrollment_no: form.enrollment_no,
                            batch: parseInt(form.batch),
                        }
                    }),
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const getRoleButtonClass = (roleValue) => {
        const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 ";
        if (form.role === roleValue) {
            return baseClass + "bg-blue-900 text-white shadow-md";
        }
        return baseClass + "bg-gray-100 text-gray-700 hover:bg-gray-200";
    };

    const handleBulkFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBulkError("");

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map((row) => ({
                    name: row.name,
                    email: row.email,
                    password: row.password,
                    role: "student",
                    department_id: prefillDepartmentId
                        ? parseInt(prefillDepartmentId)
                        : (row.department_id ? parseInt(row.department_id) : null),
                    studentData: {
                        enrollment_no: row.enrollment_no,
                        batch: parseInt(row.batch),
                    },
                }));
                setBulkStudents(data);
            },
        });
    };

    const handleBulkSubmit = async () => {
        setBulkLoading(true);
        setBulkError("");
        try {
            await api.post("/admin/addusers-bulk", {
                users: bulkStudents,
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setBulkError(err.response?.data?.error || "Bulk upload failed.");
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEdit ? "Edit User" : showBulkUpload ? "Bulk Upload Students" : "Add New User"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-500">
                            {isEdit 
                                ? "Update user details" 
                                : showBulkUpload 
                                    ? "Upload CSV file with student details" 
                                    : "Fill in the user information"}
                        </p>
                        {!isEdit && (
                            <button
                                onClick={() => setShowBulkUpload(!showBulkUpload)}
                                className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200"
                                style={{
                                    backgroundColor: showBulkUpload ? "#E5E7EB" : "#EFF6FF",
                                    color: showBulkUpload ? "#374151" : "#1E40AF"
                                }}
                            >
                                {showBulkUpload ? "Back to Single User" : "Bulk Upload Students"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Messages */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 mx-6 mt-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {bulkError && (
                    <div className="bg-red-50 text-red-700 p-4 mx-6 mt-4 rounded-lg text-sm">
                        {bulkError}
                    </div>
                )}

                {/* Content */}
                {showBulkUpload ? (
                    <div className="p-6 space-y-4">
                        {/* Bulk Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CSV File
                            </label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleBulkFileUpload}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2.5 file:px-4 
                                    file:rounded-lg file:border-0 
                                    file:text-sm file:font-medium 
                                    file:bg-blue-50 file:text-blue-900 
                                    hover:file:bg-blue-100"
                            />
                        </div>

                        {bulkStudents.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preview ({bulkStudents.length} students)
                                </label>
                                <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Enrollment
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Batch
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Dept ID
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bulkStudents.map((s, i) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {s.name}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {s.email}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {s.studentData.enrollment_no}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {s.studentData.batch}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {s.department_id ?? "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Bulk Upload Footer */}
                        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                disabled={bulkLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkSubmit}
                                className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={bulkLoading || bulkStudents.length === 0}
                            >
                                {bulkLoading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    <span>Upload Students</span>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Single User Form */}
                        {prefillDepartmentId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={`${prefillDepartmentName} (ID: ${prefillDepartmentId})`}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                                />
                            </div>
                        )}

                        {!prefillDepartmentId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department ID (optional)
                                </label>
                                <input
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => handleRoleSelect(role.value)}
                                        className={getRoleButtonClass(role.value)}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.role === "student" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Enrollment Number
                                    </label>
                                    <input
                                        name="enrollment_no"
                                        value={form.enrollment_no}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Batch Year
                                    </label>
                                    <input
                                        name="batch"
                                        type="number"
                                        min="2015"
                                        max={new Date().getFullYear()}
                                        value={form.batch}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={loading || !form.role}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </span>
                                ) : (
                                    <span>{isEdit ? "Update User" : "Create User"}</span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}