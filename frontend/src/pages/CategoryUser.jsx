// src/pages/CategoryUsers.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import UserFormModal from "../components/UserFormModal.jsx";

export default function CategoryUsers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Determine category from path
  const path = location.pathname;
  const isAdminCategory = path.includes("/administration-users");
  const categoryName = isAdminCategory ? "Administration" : "Other Users";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/users/filter?category=${isAdminCategory ? "administration" : "others"}`
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [location.pathname]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/deluser/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const groupedUsers = users.reduce((acc, user) => {
    const role = user.role.toLowerCase();
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  const roleTitles = {
    admin: "Administrators",
    finance_manager: "Finance Managers",
    staff: "Staff",
    faculty: "Faculty Members",
    student: "Students"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Loading users...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryName}
            </h1>
            <p className="text-gray-600 mt-1">Manage users in this category</p>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add User
          </button>
        </div>

        {/* User Groups */}
        {Object.keys(groupedUsers).map((role) => (
          <div
            key={role}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {roleTitles[role] || role}
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {groupedUsers[role].length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedUsers[role].map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Modal */}
        {showModal && (
          <UserFormModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
            onSuccess={fetchUsers}
          />
        )}
      </div>
    </div>
  );
}
