import React from "react";
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

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/invoices" element={<Invoices />} />
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/finance-manager" element={<FinManDashboard />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/hod" element={<DepartmentDashboard />} />
            <Route path="/department-users/:id" element={<DepartmentUsers />} />
            <Route path="/administration-users" element={<CategoryUsers />} />
            <Route path="/others-users" element={<CategoryUsers />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;