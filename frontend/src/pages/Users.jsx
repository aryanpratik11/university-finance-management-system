import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import api from "../api";
import { useNavigate } from "react-router-dom";
import UserFormModal from "../components/UserFormModal.jsx";

export default function Users() {
    const { authState } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchUsers();
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">
                            Select a category to view users
                        </p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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