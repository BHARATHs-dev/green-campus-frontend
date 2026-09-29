import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  'var(--emerald-600)',
  'var(--blue-600)',
  'var(--amber-600)',
  'var(--red-600)',
  'var(--purple-600)',
  'var(--navy-900)',
  'var(--emerald-500)',
  'var(--blue-700)',
  'var(--amber-500)',
  'var(--red-500)'
];

function PieChart({ data, nameKey, valueKey }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(15,23,42,0.08)'
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export default PieChart;
