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

function NDVIAnalysis({ data }) {
  if (!data) return null;

  return (
    <div className="analysis-container">
      <div className="analysis-section">
        <h3>Overall NDVI</h3>
        {data.overall && (
          <div className="analysis-metrics">
            <div className="metric">
              <span className="metric-label">Average NDVI</span>
              <span className="metric-value">{data.overall.avgNDVI}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Min NDVI</span>
              <span className="metric-value">{data.overall.minNDVI}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Max NDVI</span>
              <span className="metric-value">{data.overall.maxNDVI}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Std Deviation</span>
              <span className="metric-value">{data.overall.stdDevNDVI}</span>
            </div>
          </div>
        )}
      </div>

      <div className="analysis-section">
        <h3>NDVI by Region</h3>
        <div className="table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Avg NDVI</th>
                <th>Min NDVI</th>
                <th>Max NDVI</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.byRegion?.map((row, i) => (
                <tr key={row.region}>
                  <td>{row.region}</td>
                  <td>{row.avgNDVI}</td>
                  <td>{row.minNDVI}</td>
                  <td>{row.maxNDVI}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="analysis-section">
        <h3>NDVI Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data.ndviDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="var(--blue-600)">
              {data.ndviDistribution?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default NDVIAnalysis;