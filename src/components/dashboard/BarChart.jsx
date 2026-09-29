import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  'var(--blue-600)',
  'var(--emerald-600)',
  'var(--amber-600)',
  'var(--red-600)',
  'var(--purple-600)',
  'var(--navy-900)',
  'var(--emerald-500)',
  'var(--blue-700)',
  'var(--amber-500)',
  'var(--red-500)'
];

function BarChart({ data, xKey, yKey }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xKey} angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(15,23,42,0.08)'
          }}
        />
        <Bar dataKey={yKey} fill="var(--blue-600)">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export default BarChart;
