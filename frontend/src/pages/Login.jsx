import { useContext, useState } from "react";
import { AuthContext } from "../context/authContext.jsx";
import api from "../api.js";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/users/login", { email, password });

      login(res.data.user, res.data.token);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else if (res.data.user.role === "finance_manager") {
        navigate("/finance-dashboard");
      } else if (res.data.user.role === "faculty") {
        navigate("/faculty");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Login failed. Please check credentials."
      );
    }
  };



  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Image Section - Free stock image from Pexels */}
      <div className="lg:w-1/2 bg-gray-800 relative">
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="University finance concept"
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-xl shadow-lg">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="AcadmiVault UFM header.png"
                alt=""
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800">AcadmiVault UFM</span>
                <span className="text-xs font-medium text-gray-500">University Finance Management Webapp</span>
              </div>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mt-4">Secure Login</h1>
          <p className="text-center text-gray-600">Access your university finance dashboard</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@university.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-500">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-md transition-all duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-6">
            Need access?{" "}
            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
              Contact administrator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}