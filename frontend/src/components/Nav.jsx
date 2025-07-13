import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex h-20 items-center">
                    {/* Logo with glow effect on hover */}
                    <div className="flex-shrink-0 flex items-center ">
                        <Link
                            to="/"
                            className="flex items-center hover:scale-105 transition-transform duration-200"
                        >
                            {/* Logo Image */}
                            <img
                                src="AcadmiVault UFM header.png"
                                alt=""
                                className="h-14 w-14 object-contain"  // Square container
                            />

                            {/* Text Group */}
                            <div className="flex flex-col leading-tight">
                                <span className="text-xl font-bold text-blue-900">AcadmiVault UFM</span>
                                <span className="text-xs font-medium text-gray-600">University Finance Management Webapp</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu with elegant hover effects */}
                    <div className="hidden md:flex space-x-1 items-center">
                        <NavLink to="/dashboard" label="Dashboard" />
                        <NavLink to="/students" label="Students" />
                        <NavLink to="/fees" label="Fees" />
                        <NavLink to="/departments" label="Departments" />
                        <NavLink to="/expenses" label="Expenses" />
                        <NavLink to="/payroll" label="Payroll" />
                    </div>

                    {/* Mobile Menu Button with amber accent */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-amber-400 hover:text-amber-300 focus:outline-none p-2 rounded-full hover:bg-gray-800 transition-all duration-300"
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

            {/* Mobile Menu with dark gradient */}
            {isOpen && (
                <div className="md:hidden px-2 pt-2 pb-4 space-y-2 bg-gradient-to-b from-gray-900 to-gray-800">
                    <MobileNavLink to="/dashboard" label="Dashboard" onClose={() => setIsOpen(false)} />
                    <MobileNavLink to="/students" label="Students" onClose={() => setIsOpen(false)} />
                    <MobileNavLink to="/fees" label="Fees" onClose={() => setIsOpen(false)} />
                    <MobileNavLink to="/departments" label="Departments" onClose={() => setIsOpen(false)} />
                    <MobileNavLink to="/expenses" label="Expenses" onClose={() => setIsOpen(false)} />
                    <MobileNavLink to="/payroll" label="Payroll" onClose={() => setIsOpen(false)} />
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
            className="relative text-gray-300 hover:text-white px-4 py-2 rounded-md font-medium text-lg transition-all duration-300 group"
        >
            {label}
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-amber-400 group-hover:w-4/5 group-hover:left-[10%] transition-all duration-300"></span>
        </Link>
    );
}

/* Mobile NavLink with subtle glow */
function MobileNavLink({ to, label, onClose }) {
    return (
        <Link
            to={to}
            onClick={onClose}
            className="block text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium text-lg transition-all duration-300 hover:bg-gray-800 hover:pl-8 hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]"
        >
            {label}
        </Link>
    );
}