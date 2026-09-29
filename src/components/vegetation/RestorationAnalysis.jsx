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
  'var(--blue-600)', 'var(--emerald-600)', 'var(--amber-600)', 'var(--red-600)', 'var(--purple-600)',
  'var(--navy-900)', 'var(--emerald-500)', 'var(--blue-700)', 'var(--amber-500)', 'var(--red-500)'
];

function RestorationAnalysis({ data }) {
  if (!data) return null;

  return (
    <div className="analysis-container">
      <div className="analysis-section">
        <h3>Overall Restoration</h3>
        {data.overall && (
          <div className="analysis-metrics">
            <div className="metric">
              <span className="metric-label">Avg Restoration Effect Score</span>
              <span className="metric-value">{data.overall.avgRestorationEffect}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Cover Change (%)</span>
              <span className="metric-value">{data.overall.avgCoverChange}</span>
            </div>
          </div>
        )}
      </div>

      <div className="analysis-section">
        <h3>By Region</h3>
        <div className="table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Avg Restoration Effect</th>
                <th>Avg Cover Change (%)</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.byRegion?.map((row) => (
                <tr key={row.region}>
                  <td>{row.region}</td>
                  <td>{row.avgRestorationEffect}</td>
                  <td>{row.avgCoverChange}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="analysis-section">
        <h3>By Degradation Level</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data.byDegradation} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgRestorationEffect" fill="var(--purple-600)">
              {data.byDegradation?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="analysis-section">
        <h3>By Land Cover Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data.byLandCover} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="landCoverType" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgRestorationEffect" fill="var(--amber-600)">
              {data.byLandCover?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RestorationAnalysis;