import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import Invoices from "./pages/Invoices";
import FacultyDashboard from "./pages/FacultyDashboard";
import FinManDashboard from "./pages/FinManDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import DepartmentUsers from "./pages/DepartmentUsers";
import CategoryUsers from "./pages/CategoryUser";
import FeeManagement from "./pages/FeeManagement";
import PayrollManagement from "./pages/PayrollManagement";
import BudgetManagement from "./pages/BudgetManagement";
import IncomeManagement from "./pages/IncomeManagement";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e); // Save the event so you can trigger it later
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    }
  };
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <Nav />
          <Routes>
            <Route path="/" element={<Home deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/fees" element={<FeeManagement />} />
            <Route path="/admin/invoices" element={<Invoices />} />
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/finance-manager" element={<FinManDashboard />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/hod" element={<DepartmentDashboard />} />
            <Route path="/department-users/:id" element={<DepartmentUsers />} />
            <Route path="/administration-users" element={<CategoryUsers />} />
            <Route path="/others-users" element={<CategoryUsers />} />
            <Route path="/admin/staff" element={<PayrollManagement />} />
            <Route path="/admin/budgets" element={<BudgetManagement />} />
            <Route path="/admin/income" element={<IncomeManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;