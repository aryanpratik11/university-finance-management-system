import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/authContext";

export default function AdminIncomeManagement() {
  const [loading, setLoading] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [source_name, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const { user } = useContext(AuthContext);

  const fetchIncomeSources = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/allincomes");
      setIncomes(res.data);
    } catch (err) {
      console.error("Error fetching incomes", err);
      setMessage({
        text: "Failed to load income sources",
        type: "error"
      });
    }
    finally{
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!source_name || !amount || !dateReceived || !description) {
      setMessage({
        text: "Please fill all fields",
        type: "error"
      });
      return;
    }

    try {
      await api.post("/admin/income", {
        source_name,
        description,
        amount,
        received_date: dateReceived,
        recorded_by: user?.id,
      });

      setSource("");
      setDescription("");
      setAmount("");
      setDateReceived("");
      fetchIncomeSources();
      setMessage({
        text: "Income source added successfully!",
        type: "success"
      });
    } catch (err) {
      console.error("Error adding income", err);
      setMessage({
        text: err.response?.data?.message || "Failed to add income",
        type: "error"
      });
    }
  };

  useEffect(() => {
    fetchIncomeSources();
  }, []);
  if (loading) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div><p className="text-gray-600 mt-2">Manage Funds, Donantions & other sources of income...</p></div></div>); }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage all income sources
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-3 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-700 border-l-4 border-red-500" :
              message.type === "success" ? "bg-green-100 text-green-700 border-l-4 border-green-500" :
                "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
            }`}>
            {message.text}
          </div>
        )}

        {/* Add Income Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Income</h2>
          <form onSubmit={handleAddIncome} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input
                type="text"
                placeholder="e.g. Donation, Grant"
                value={source_name}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-300 shadow-sm"
              >
                Add Income
              </button>
            </div>
          </form>
        </div>

        {/* Income List Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Income Sources</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No income sources found
                    </td>
                  </tr>
                ) : (
                  incomes.map((income) => (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{income.source_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(income.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(income.received_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.recorded_by_name || "Unknown"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}