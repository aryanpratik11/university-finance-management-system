export default function DashboardCard({ title, value, description, color }) {
    const colorClasses = {
        blue: { text: 'text-blue-900', bg: 'bg-blue-50' },
        green: { text: 'text-green-600', bg: 'bg-green-50' },
        yellow: { text: 'text-yellow-600', bg: 'bg-yellow-50' }
    };

    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${colorClasses[color].bg}`}>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className={`mt-2 text-3xl font-bold ${colorClasses[color].text}`}>
                {value}
            </p>
            <p className="text-sm text-gray-500 mt-1">
                {description}
            </p>
        </div>
    );
}