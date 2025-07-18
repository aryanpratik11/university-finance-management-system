import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import FeeStructureFormModal from "../components/FeeStructureFormModal.jsx";
import AssignFeeFormModal from "../components/AssignFeeFormModal.jsx";
import RecordTransactionFormModal from "../components/RecordTransactionFormModal.jsx";

const StatsDashboard = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div>
        <p className="text-sm text-gray-500">Total Revenue Collected</p>
        <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div>
        <p className="text-sm text-gray-500">Total Students</p>
        <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div>
        <p className="text-sm text-gray-500">Active Fee Structures</p>
        <p className="text-2xl font-bold text-gray-900">{stats.totalFeeStructures}</p>
      </div>
    </div>
  </div>
);

// --- Main Parent Component ---
export default function FeeManagementPage() {
  // Data State
  const [feeStructures, setFeeStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignedFees, setAssignedFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI State
  const [stats, setStats] = useState({ totalRevenue: 0, totalStudents: 0, totalFeeStructures: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("structures");

  // Modal and Editing State
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showAssignFeeModal, setShowAssignFeeModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  // --- Data Fetching & Calculations ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [feeRes, studentRes, assignRes, txnRes] = await Promise.all([
        api.get("/admin/allfee"),
        api.get("/admin/allusers?role=student"),
        api.get("/admin/assignedfees"),
        api.get("/admin/alltrans")
      ]);
      setFeeStructures(feeRes.data);
      setStudents(studentRes.data);
      setAssignedFees(assignRes.data);
      setTransactions(txnRes.data);
    } catch (err) {
      setError("Failed to fetch critical data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, []);

  useEffect(() => {
    const totalRevenue = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
    setStats({ totalRevenue, totalStudents: students.length, totalFeeStructures: feeStructures.length });
  }, [transactions, students, feeStructures]);

  useEffect(() => {
    console.log("useEffect running");
    const fetchDepartments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/alldepartments");
        const data = await res.json();
        console.log(data);
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };

    fetchDepartments();
  }, []);

  // --- API Handlers ---
  const handleFeeStructureSave = async (formData, feeId) => {
    setError(""); setSuccess("");
    try {
      const payload = { name: (formData.name || "").trim(), amount: parseFloat(formData.amount), due_date: new Date(formData.due_date).toISOString(), description: (formData.description || "").trim() };
      if (feeId) {
        await api.put(`/admin/upfee/${feeId}`, payload);
        setSuccess("Fee structure updated successfully!");
      } else {
        await api.post("/admin/addfee", payload);
        setSuccess("Fee structure created successfully!");
      }
      await fetchAllData();
      return true;
    } catch (err) {
      console.error("Update error:", err);  // <-- ADD THIS
      setError(err.response?.data?.message || "Operation failed.");
      return false;
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    setError(""); setSuccess("");
    try {
      await api.delete(`/admin/delfee/${feeId}`);
      setSuccess("Fee structure deleted successfully.");
      await fetchAllData();
    } catch (err) { setError(err.response?.data?.message || "Failed to delete fee."); }
  };

  const handleAssignFee = async (assignData, assignMode) => {
    setError(""); setSuccess("");
    try {
      let endpoint;
      const payload = {
        fee_structure_id: assignData.fee_structure_id,
        status: assignData.status || "unpaid",
        paid_amount: assignData.paid_amount || 0,
      };
      console.log("Assign Mode:", assignMode);
      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);

      switch (assignMode) {
        case "single": endpoint = "/admin/assignfee"; payload.student_id = assignData.student_id; break;
        case "batch": endpoint = "/admin/assignfee/bulk"; payload.batch = assignData.batch; break;
        case "department": endpoint = "/admin/assignfee/bulk"; payload.department_id = assignData.department_id; break;
        case "batch-department": endpoint = "/admin/assignfee/bulk"; payload.batch = assignData.batch; payload.department_id = assignData.department_id; break;
        case "custom": endpoint = "/admin/assignfee/list"; payload.student_ids = assignData.student_ids; break;
        default: throw new Error("Invalid assignment mode");
      }
      console.log("Assign Mode:", assignMode);
      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);
      await api.post(endpoint, payload);
      setSuccess("Fee assigned successfully!");
      await fetchAllData();
      return true;
    } catch (err) { setError(err.response?.data?.message || "Failed to assign fee."); return false; }
  };

  const handleRevokeFee = async (assignedFeeId) => {
    if (!window.confirm("Are you sure you want to revoke this fee assignment?")) return;
    setError(""); setSuccess("");
    try {
      await api.delete(`/admin/revoke-fee/${assignedFeeId}`);
      setSuccess("Fee assignment revoked successfully.");
      await fetchAllData();
    } catch (err) { setError(err.response?.data?.message || "Failed to revoke fee assignment."); }
  };

  const handleRecordTransaction = async (transactionData) => {
    setError(""); setSuccess("");
    try {
      await api.post("/admin/addtransaction", transactionData);
      setSuccess("Transaction recorded successfully!");
      await fetchAllData();
      return true;
    } catch (err) { setError(err.response?.data?.message || "Failed to record transaction."); return false; }
  };

  // --- Modal Triggers ---
  const openNewFeeStructureModal = () => { setEditingFee(null); setShowFeeStructureModal(true); };
  const openEditFeeStructureModal = (fee) => { setEditingFee(fee); setShowFeeStructureModal(true); };

  if (loading) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div><p className="text-gray-600 mt-2">Loading Fee Portal...</p></div></div>); }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">University Fee Management</h1>
          <p className="text-gray-600 mb-6">Dashboard to view fee structures, assignments, and transactions.</p>

          <StatsDashboard stats={stats} />

          {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 text-sm">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6 text-sm">{success}</div>}

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab("structures")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "structures" ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Fee Structures</button>
              <button onClick={() => setActiveTab("assigned")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "assigned" ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Assigned Fees</button>
              <button onClick={() => setActiveTab("transactions")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "transactions" ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Transactions</button>
            </nav>
          </div>

          {/* --- Tab Content --- */}
          {activeTab === "structures" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Existing Fee Structures</h2>
                <button onClick={openNewFeeStructureModal} className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800">Add New</button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{feeStructures.map((fee) => (<tr key={fee.id}><td className="px-6 py-4">{fee.name}</td><td className="px-6 py-4">₹{fee.amount}</td><td className="px-6 py-4">{new Date(fee.due_date).toLocaleDateString()}</td><td className="px-6 py-4 space-x-4"><button onClick={() => openEditFeeStructureModal(fee)} className="text-blue-600 hover:text-blue-800">Edit</button><button onClick={() => handleDeleteFee(fee.id)} className="text-red-600 hover:text-red-800">Delete</button></td></tr>))}</tbody>
              </table>
            </div>
          )}

          {activeTab === "assigned" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Fees</h2>
                <button onClick={() => setShowAssignFeeModal(true)} className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800">Assign Fee</button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{assignedFees.map((a) => (<tr key={a.id}><td className="px-6 py-4">{a.student_name}</td><td className="px-6 py-4">{a.fee_title}</td><td className="px-6 py-4"><span className={`px-2 inline-flex text-xs font-semibold rounded-full ${a.status === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{a.status}</span></td><td className="px-6 py-4"><button onClick={() => handleRevokeFee(a.id)} className="text-red-600 hover:text-red-800 disabled:text-gray-400" disabled={a.status === 'PAID'}>Revoke</button></td></tr>))}</tbody>
              </table>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
                <button onClick={() => setShowTransactionModal(true)} className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800">Record Transaction</button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{transactions.map((txn) => (<tr key={txn.id}><td className="px-6 py-4">{txn.student?.name}</td><td className="px-6 py-4">{txn.fee?.name}</td><td className="px-6 py-4">₹{txn.amount}</td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}
      <FeeStructureFormModal isOpen={showFeeStructureModal} onClose={() => setShowFeeStructureModal(false)} onSave={handleFeeStructureSave} editingFee={editingFee} />
      <AssignFeeFormModal isOpen={showAssignFeeModal} onClose={() => setShowAssignFeeModal(false)} onAssign={handleAssignFee} feeStructures={feeStructures} students={students} departments={departments} />
      <RecordTransactionFormModal isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} onSave={handleRecordTransaction} students={students} feeStructures={feeStructures} />
    </>
  );
}
