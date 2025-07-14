import { useState, useEffect } from "react";
import api from "../api";

export default function UserFormModal({ user, onClose, onSuccess }) {
    const isEdit = !!user;
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        department_id: "",
        enrollment_no: "",
        program: "",
        admission_date: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const roles = [
        { value: "admin", label: "Admin" },
        { value: "finance_manager", label: "Finance Manager" },
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
                program: user.program || "",
                admission_date: user.admission_date || "",
            });
        }
    }, [user]);

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
                await api.put(`/admin/users/${user.id}`, {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    department_id: form.department_id || null,
                    ...(form.role === "student" && {
                        enrollment_no: form.enrollment_no,
                        program: form.program,
                        admission_date: form.admission_date,
                    }),
                });
            } else {
                await api.post("/users/register", {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    department_id: form.department_id || null,
                    ...(form.role === "student" && {
                        enrollment_no: form.enrollment_no,
                        program: form.program,
                        admission_date: form.admission_date,
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEdit ? "Edit User" : "Add New User"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEdit ? "Update user details" : "Fill in the user information"}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 mx-6 mt-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department ID (optional)</label>
                        <input
                            name="department_id"
                            value={form.department_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {form.role === "student" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number</label>
                                <input
                                    name="enrollment_no"
                                    value={form.enrollment_no}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                <input
                                    name="program"
                                    value={form.program}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                                <input
                                    name="admission_date"
                                    type="date"
                                    value={form.admission_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Form Footer */}
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
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEdit ? "Updating..." : "Creating..."}
                                </span>
                            ) : (
                                <span>{isEdit ? "Update User" : "Create User"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}