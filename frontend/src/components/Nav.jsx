import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { FaUserCircle } from "react-icons/fa";

export default function Nav() {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    return (
        <nav className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo with glow effect on hover */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
                            {/* Logo Image */}
                            <img
                                src="AcadmiVault UFM header.png"
                                alt="AcadmiVault Logo"
                                className="h-14 w-14 object-contain"
                            />

                            {/* Text Group */}
                            <div className="flex flex-col leading-tight ml-2">
                                <span className="text-xl font-bold text-blue-900">AcadmiVault UFM</span>
                                <span className="text-xs font-medium text-gray-600">University Finance Management Webapp</span>
                            </div>
                        </Link>
                    </div>


                    {/* Account Dropdown */}
                    <div className="hidden md:block relative ml-4">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            <FaUserCircle className="mr-1 text-xl" />
                            <span className="font-medium">Account</span>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                if (user.role === "admin") {
                                                    navigate("/admin");
                                                } else if (user.role === "finance_manager") {
                                                    navigate("/finance-dashboard");
                                                } else if (user.role === "faculty") {
                                                    navigate("/faculty");
                                                } else {
                                                    navigate("/dashboard");
                                                }
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setDropdownOpen(false);
                                                navigate("/");
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/contact"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                                        >
                                            Contact Admin
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-blue-600 hover:text-blue-800 focus:outline-none p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
                        >
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden px-2 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">

                    {/* Mobile Account Links */}
                    <div className=" border-gray-200 pt-2 mt-2">
                        {isAuthenticated ? (
                            <>
                                <MobileNavLink to="/profile" label="Profile" onClose={() => setIsOpen(false)} />
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        if (user.role === "admin") {
                                            navigate("/admin");
                                        } else if (user.role === "finance_manager") {
                                            navigate("/finance-dashboard");
                                        } else if (user.role === "faculty") {
                                            navigate("/faculty");
                                        } else {
                                            navigate("/dashboard");
                                        }
                                    }}
                                    className="block w-full text-left px-6 py-3 rounded-lg font-medium text-lg text-gray-700  hover:text-blue-600 hover:bg-gray-100 transition-all"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                        navigate("/");
                                    }}
                                    className="block w-full text-left px-6 py-3 rounded-lg font-medium text-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileNavLink to="/login" label="Login" onClose={() => setIsOpen(false)} />
                                <MobileNavLink to="/contect" label="Contact Admin" onClose={() => setIsOpen(false)} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

/* Desktop NavLink with sleek animation */
function NavLink({ to, label }) {
    return (
        <Link
            to={to}
            className="relative text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md font-medium text-lg transition-all duration-300 group"
        >
            {label}
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-4/5 group-hover:left-[10%] transition-all duration-300"></span>
        </Link>
    );
}

/* Mobile NavLink */
function MobileNavLink({ to, label, onClose }) {
    return (
        <Link
            to={to}
            onClick={onClose}
            className="block text-gray-700 hover:text-blue-600 px-6 py-3 rounded-lg font-medium text-lg transition-all duration-300 hover:bg-gray-100"
        >
            {label}
        </Link>
    );
}