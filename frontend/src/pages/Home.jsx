import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  // Floating animation variants
  const floatVariants = {
    float: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('Rupee.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/20"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 text-center">

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl">
            <span className="block">AcadmiVault UFM</span>
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-xl lg:text-3xl">
            <span className="block text-blue-200 mt-3">University Finance Management WebApp</span>
          </h2>

          <p className="mt-6 text-l leading-8 text-blue-100 max-w-xl mx-auto">
            Empowering universities to manage tuition, donations, grants, and expenses seamlessly.
            For finance teams, faculty, and students.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="px-2.5 py-3.5 bg-white text-blue-900 font-medium rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-300 text-m"
            >
              Get Started
            </Link>
            <Link
              to="/demo"
              className="px-2.5 py-3.5 bg-transparent text-white font-medium rounded-lg border-2 border-white hover:bg-white/10 transition-all duration-300 text-md"
            >
              Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How AcadmiVault Helps Everyone</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Designed to empower students, staff, and administrators with modern financial workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎓",
                title: "For Students",
                description:
                  "View tuition bills, track payments, and download receipts anytime. Apply for scholarships or financial aid seamlessly."
              },
              {
                icon: "👩‍💼",
                title: "For Staff & Faculty",
                description:
                  "Manage department budgets, approve expenses, and track procurement in real time from any device."
              },
              {
                icon: "🧑‍💼",
                title: "For Finance Managers",
                description:
                  "Oversee revenue, donations, grants, and payroll. Generate detailed financial reports with a single click."
              },
              {
                icon: "🛡️",
                title: "For Administrators",
                description:
                  "Control user access, monitor transactions across departments, and ensure compliance with institutional policies."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mb-6 flex items-center justify-center bg-blue-100 text-blue-900 rounded-lg text-2xl font-bold">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to simplify finance for everyone?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              From tuition to grants, AcadmiVault empowers your entire institution with modern financial management.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3.5 bg-white text-blue-900 font-medium rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-300 text-lg"
            >
              Request Demo
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
