import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import api from "../api";
import { useNavigate } from "react-router-dom";
import UserFormModal from "../components/UserFormModal.jsx";

export default function Users() {
    const { authState } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [batchToDeactivate, setBatchToDeactivate] = useState("");
    const [deactivatingBatch, setDeactivatingBatch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const navigate = useNavigate();

    const departments = [
        { id: 1, name: "Computer Science & Engineering (CSE)" },
        { id: 2, name: "Electrical Engineering (EE)" },
        { id: 3, name: "Mechanical Engineering (ME)" },
        { id: 4, name: "Artificial Intelligence and Data Science (AIDS)" },
        { id: 5, name: "Electronics & Communication Engineering (ECE)" },
        { id: 6, name: "Mathematics & Computing (MAC)" },
        { id: 7, name: "Civil Engineering (CE)" },
        { id: 8, name: "Chemical Engineering (ChemE)" }
    ];

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/allusers");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await api.get("/admin/batches");
            setBatches(res.data); // Array of batch years
        } catch (err) {
            console.error("Failed to fetch batches:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBatches();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/deluser/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Delete failed.");
        }
    };

    const navigateToFilteredUsers = (filterType, id = null) => {
        if (filterType === 'department') {
            navigate(`/department-users/${id}`);
        } else {
            navigate(`/${filterType}-users`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading User Management Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">Select a category to view users</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setShowAdd(true);
                        }}
                        className="px-4 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-300 shadow-sm whitespace-nowrap"
                    >
                        + Add New User
                    </button>
                </div>

                {/* Department Buttons Grid */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Departments</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {departments.map((dept) => (
                            <button
                                key={dept.id}
                                onClick={() => navigateToFilteredUsers('department', dept.id)}
                                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors duration-200 text-left"
                            >
                                <h3 className="font-medium text-gray-900">{dept.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">View all users</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Administration and Others Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 mb-8 gap-4">
                    <button
                        onClick={() => navigateToFilteredUsers('administration')}
                        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-green-500 transition-colors duration-200 text-left"
                    >
                        <h3 className="font-medium text-gray-900">Administration</h3>
                        <p className="text-sm text-gray-500 mt-1">Staff, Finance, and Admin</p>
                    </button>
                    <button
                        onClick={() => navigateToFilteredUsers('others')}
                        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-500 transition-colors duration-200 text-left"
                    >
                        <h3 className="font-medium text-gray-900">Others</h3>
                        <p className="text-sm text-gray-500 mt-1">Unassigned users</p>
                    </button>
                </div>

                {/* Deactivate Batch Section */}
                <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-md font-semibold text-red-800 mb-2">Mark Batch as Passed Out</h2>
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="text-sm text-gray-700 block mb-1">Select Batch</label>
                            <select
                                className="border rounded px-3 py-2 text-sm"
                                value={batchToDeactivate}
                                onChange={(e) => setBatchToDeactivate(e.target.value)}
                            >
                                <option value="">Select</option>
                                {batches.map((batch) => (
                                    <option key={batch} value={batch}>{batch}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            disabled={!batchToDeactivate || deactivatingBatch}
                            onClick={async () => {
                                if (!window.confirm(`Are you sure you want to mark batch ${batchToDeactivate} as passed out?`)) return;

                                try {
                                    setDeactivatingBatch(true);
                                    await api.patch(`/admin/activebatch/${batchToDeactivate}`);
                                    alert("Students marked as inactive.");
                                    setBatchToDeactivate("");
                                    fetchUsers();
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to deactivate batch.");
                                } finally {
                                    setDeactivatingBatch(false);
                                }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                        >
                            {deactivatingBatch ? "Processing..." : "Deactivate Batch"}
                        </button>
                    </div>
                </div>

                {/* Modal */}
                {showAdd && (
                    <UserFormModal
                        user={selectedUser}
                        onClose={() => {
                            setShowAdd(false);
                            setSelectedUser(null);
                        }}
                        onSuccess={fetchUsers}
                    />
                )}
            </div>
        </div>
    );
}
