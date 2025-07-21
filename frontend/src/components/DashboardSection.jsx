import { Link } from "react-router-dom";

export default function DashboardSection({
    title,
    data = [],
    viewAllLink = null,
    columns = [],
    emptyMessage = "No records available.",
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {data.length} total {data.length === 1 ? "record" : "records"}
                    </p>
                </div>
                {viewAllLink && (
                    <Link
                        to={viewAllLink}
                        className="text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
                    >
                        View All →
                    </Link>
                )}
            </div>

            {/* Empty State */}
            {data.length === 0 ? (
                <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {data.slice(0, 3).map((item, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                        >
                                            {
                                                col.cell
                                                    ? col.cell(item[col.accessor], item) // Custom JSX
                                                    : col.format
                                                    ? col.format(item[col.accessor]) // Formatted text
                                                    : item[col.accessor] ?? col.default ?? "" // Raw fallback
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
