import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import api from "../api";
import { format } from "date-fns";
import DashboardCard from "../components/DashboardCard";
import DashboardSection from "../components/DashboardSection";
import PayButton from "../components/PayButton";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function StudentDashboard() {
    const { user } = useContext(AuthContext);
    const [fees, setFees] = useState([]);
    const [applications, setApplications] = useState([]);
    const [disbursements, setDisbursements] = useState([]);
    const [stats, setStats] = useState({ totalFees: 0, pendingFees: 0, totalAid: 0, pendingApps: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feesRes, appsRes, disbursementsRes] = await Promise.all([
                api.get(`/student/allfeest/${user.student_id}`),
                api.get(`/student/aid-applications/${user.student_id}`),
                api.get(`/student/disbursements/${user.student_id}`)
            ]);
            setFees(feesRes.data);
            setApplications(appsRes.data);
            setDisbursements(disbursementsRes.data);

            // Calculate statistics
            const pendingFees = feesRes.data.filter(fee => fee.status !== 'paid').length;
            const pendingApps = appsRes.data.filter(app => app.status === 'pending').length;
            const totalAid = disbursementsRes.data.reduce((sum, d) => sum + parseFloat(d.amount), 0);
            const totalFees = feesRes.data.reduce((sum, fee) => sum + parseFloat(fee.total_amount), 0);
            setStats({ totalFees, pendingFees, totalAid, pendingApps });
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.student_id) {
            fetchData();
        }
    }, [user?.student_id]);

    const generateReceipt = (txn) => {
        const doc = new jsPDF();

        // Add Logo
        const logoUrl = "/AcadmiVault UFM header.png";
        const imgWidth = 25;
        const imgHeight = 25;

        const image = new Image();
        image.src = logoUrl;
        image.onload = () => {
            doc.addImage(image, "PNG", 20, 10, imgWidth, imgHeight);

            // Header Text beside Logo
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("AcadmiVault UFM", 50, 18);
            doc.setFontSize(10);
            doc.text("University Finance Management Webapp", 50, 24);

            // Title
            doc.setFontSize(14);
            doc.text("UNIVERSITY FEE RECEIPT", 105, 40, { align: "center" });

            doc.setLineWidth(0.5);
            doc.line(20, 45, 190, 45);

            // Receipt Info
            let y = 55;
            const lineGap = 8;
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, y - 20);

            const rows = [
                [`Student Name`, txn.student_name],
                [`Department`, txn.department || "N/A"],
                [`Student ID`, txn.student_id || "N/A"],
                [`Fee Title`, txn.fee_name],
                [`Amount Paid`, `₹${txn.amount_paid}`],
                [`Payment Status`, txn.status],
                [`Transaction ID`, txn.id],
                [`Reference Number`, txn.payment_reference],
                [`Payment Method`, txn.payment_method || "Online"],
                [`Approved By`, txn.approved_by || "Admin"]
            ];

            rows.forEach(([label, value]) => {
                doc.text(`${label}:`, 30, y);
                doc.text(`${value}`, 90, y);
                y += lineGap;
            });

            // Bottom Line
            doc.line(20, y + 5, 190, y + 5);

            // Footer
            doc.setFontSize(10);
            doc.text(
                "This is a system-generated receipt. No signature required.",
                105,
                y + 20,
                { align: "center" }
            );

            doc.save(`receipt-${txn.student_name}.pdf`);
        };
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-2">Loading your dashboard</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Student'}</h1>
                    <p className="text-gray-600 mt-1">Here's your financial overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="Total Fees Due"
                        value={`₹${stats.totalFees.toLocaleString()}`}
                        description={`${stats.pendingFees} pending payments`}
                        color="blue"
                    />

                    <DashboardCard
                        title="Total Aid Received"
                        value={`₹${stats.totalAid.toLocaleString()}`}
                        description={`From ${disbursements.length} disbursements`}
                        color="green"
                    />

                    <DashboardCard
                        title="Pending Applications"
                        value={stats.pendingApps}
                        description="Aid applications under review"
                        color="yellow"
                    />

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
                        <div className="mt-4 space-y-2">
                            <Link
                                to="/student/pay-fees"
                                className="inline-block w-full px-3 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg text-center hover:bg-blue-800 transition-colors"
                            >
                                Pay Fees
                            </Link>
                            <Link
                                to="/student/apply-aid"
                                className="inline-block w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg text-center hover:bg-gray-50 transition-colors"
                            >
                                Apply for Aid
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Data Sections */}
                <DashboardSection
                    title="Fee Payments"
                    data={fees}
                    viewAllLink="/student/fees"
                    columns={[
                        { header: "Description", accessor: "fee_name", className: "font-medium text-gray-900" },
                        { header: "Amount", accessor: "total_amount", format: value => `₹${parseFloat(value).toLocaleString()}` },
                        { header: "Due Date", accessor: "due_date", format: value => value ? format(new Date(value), "dd MMM yyyy") : "-" },
                        {
                            header: "Status", accessor: "status",
                            cell: (value) => (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {value}
                                </span>
                            )
                        },
                        {
                            header: "Action",
                            accessor: "id",
                            cell: (val, row) =>
                                row.status === "success" || row.status === "paid" ? (
                                    <button
                                        onClick={() => generateReceipt(row)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Generate Receipt
                                    </button>
                                ) : (
                                    <PayButton fee={row} />
                                )
                        }

                    ]}
                    emptyMessage="No fee records found"
                />

                <DashboardSection
                    title="Aid Applications"
                    data={applications}
                    viewAllLink="/student/aid-applications"
                    columns={[
                        { header: "Aid Type", accessor: "aid_type", className: "font-medium text-gray-900" },
                        { header: "Amount", accessor: "amount_requested", format: value => `₹${value.toLocaleString()}` },
                        {
                            header: "Status",
                            accessor: "status",
                            cell: (value) => (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'approved' ? 'bg-green-100 text-green-800' :
                                    value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {value}
                                </span>
                            )
                        },
                        { header: "Submitted", accessor: "submitted_at", format: value => format(new Date(value), "dd MMM yyyy") }
                    ]}
                    emptyMessage="No aid applications submitted yet"
                />

                <DashboardSection
                    title="Aid Disbursements"
                    data={disbursements}
                    viewAllLink="/student/disbursements"
                    columns={[
                        { header: "Aid Type", accessor: "aid_type", className: "font-medium text-gray-900", default: "N/A" },
                        { header: "Amount", accessor: "amount", format: value => `₹${value.toLocaleString()}` },
                        { header: "Disbursed On", accessor: "disbursed_at", format: value => format(new Date(value), "dd MMM yyyy") }
                    ]}
                    emptyMessage="No disbursements received yet"
                />
            </div>
        </div>
    );
}