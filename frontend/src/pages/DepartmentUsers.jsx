import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import UserFormModal from "../components/UserFormModal";

export default function DepartmentUsers() {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes] = await Promise.all([
        api.get(`/admin/users/filter?departmentId=${id}`),
        api.get(`/admin/departments/${id}`)
      ]);
      setUsers(usersRes.data);
      setDepartmentName(deptRes.data.name);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch department data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [id]);

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

  const toggleUserActive = async (userId, newStatus) => {
    try {
      await api.patch(`/users/active/${userId}`, { is_active: newStatus });
      alert(`User has been ${newStatus ? "activated" : "deactivated"}`);
      fetchUsers(); // Refresh table after update
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      alert("Error updating status");
    }
  };

  const groupedUsers = users.reduce(
    (acc, user) => {
      const role = user.role.toLowerCase();
      if (["hod", "faculty", "student"].includes(role)) {
        if (!acc[role]) acc[role] = [];
        acc[role].push(user);
      }
      return acc;
    },
    { hod: [], faculty: [], student: [] }
  );

  // Extract unique batch years from students
  const batchYears = Array.from(
    new Set(groupedUsers.student.map((s) => s.batch).filter(Boolean))
  ).sort((a, b) => b - a); // Newest first

  // Apply batch filter
  const filteredStudents =
    selectedBatch === "All"
      ? groupedUsers.student
      : groupedUsers.student.filter((s) => s.batch === parseInt(selectedBatch));

  const roleTitles = {
    hod: "Head of Department",
    faculty: "Faculty Members",
    student: "Students"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Loading department users</p>
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
              {departmentName || "Department"} Users
            </h1>
            <p className="text-gray-600 mt-1">Manage users in this department</p>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add User
          </button>
        </div>

        {/* User Groups */}
        {["hod", "faculty", "student"].map((role) => (
          <div
            key={role}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {roleTitles[role]}
              </h2>

              {role === "student" && (
                <div className="flex items-center gap-2">
                  <label htmlFor="batchFilter" className="text-sm text-gray-700">
                    Filter by Batch:
                  </label>
                  <select
                    id="batchFilter"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="All">All</option>
                    {batchYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {role === "student"
                  ? filteredStudents.length
                  : groupedUsers[role].length}{" "}
                {role === "hod"
                  ? ""
                  : role + (groupedUsers[role].length !== 1 ? "s" : "")}
              </span>
            </div>

            {(role !== "student"
              ? groupedUsers[role]
              : filteredStudents
            ).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {roleTitles[role].toLowerCase()} found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      {role === "student" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(role !== "student"
                      ? groupedUsers[role]
                      : filteredStudents
                    ).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        {role === "student" && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.batch || "—"}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Delete
                            </button>
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
                              onClick={() => toggleUserActive(user.id, !user.is_active)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* User Form Modal */}
        {showModal && (
          <UserFormModal
            user={selectedUser}
            prefillDepartmentId={parseInt(id)}
            prefillDepartmentName={departmentName}
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
