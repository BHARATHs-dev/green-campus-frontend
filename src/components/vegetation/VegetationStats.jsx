import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#16A34A', '#F59E0B', '#EF4444'];

function VegetationStats({ stats }) {
  if (!stats) return null;

  const total = stats.totalSamples || 0;
  const conditionData = (stats.conditionDistribution || []).map((item) => ({
    name: item.level,
    value: item.count,
    percentage: item.percentage || 0,
  }));

  const regionData = (stats.regionDegradation || []).map((region) => {
    const levels = {};
    (region.levels || []).forEach((l) => {
      levels[l.level] = l.count;
    });
    return {
      region: region.region,
      Healthy: levels['Healthy'] || 0,
      Moderate: levels['Moderately Degraded'] || 0,
      Severe: levels['Severely Degraded'] || 0,
      total: region.total || 0,
    };
  });

  const indicesData = (stats.vegetationIndices || []).map((item) => ({
    name: item.index,
    value: item.value,
  }));

  return (
    <div className="analysis-container">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Samples</span>
          <span className="stat-value">{total.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Healthy</span>
          <span className="stat-value">{(stats.healthy || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Moderately Degraded</span>
          <span className="stat-value">{(stats.moderatelyDegraded || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Severely Degraded</span>
          <span className="stat-value">{(stats.severelyDegraded || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average NDVI</span>
          <span className="stat-value">{stats.averageNDVI}</span>
        </div>
      </div>

      <div className="analysis-section">
        <h3>Vegetation Condition</h3>
        <div className="condition-layout">
          <div className="condition-chart">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="condition-table-wrap">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Condition</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {conditionData.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.value.toLocaleString()}</td>
                    <td>{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <h3>Average Vegetation Indices</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={indicesData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563EB">
              {indicesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="analysis-section">
        <h3>Region-wise Degradation</h3>
        <div className="region-table-wrap">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Healthy</th>
                <th>Moderate</th>
                <th>Severe</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {regionData.map((row) => (
                <tr key={row.region}>
                  <td>{row.region}</td>
                  <td>{row.Healthy.toLocaleString()}</td>
                  <td>{row.Moderate.toLocaleString()}</td>
                  <td>{row.Severe.toLocaleString()}</td>
                  <td>{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stacked-chart-wrap">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={regionData} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Healthy" stackId="1" fill="#16A34A" />
              <Bar dataKey="Moderate" stackId="1" fill="#F59E0B" />
              <Bar dataKey="Severe" stackId="1" fill="#EF4444" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analysis-section">
        <h3>AI Model Performance</h3>
        {stats.modelPerformance && (
          <div className="model-performance">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Macro F1</th>
                </tr>
              </thead>
              <tbody>
                {(stats.modelPerformance.models || []).map((model) => (
                  <tr key={model.name} className={model.selected ? 'selected-model' : ''}>
                    <td>
                      {model.name}
                      {model.selected ? ' ✓' : ''}
                    </td>
                    <td>{model.accuracy}</td>
                    <td>{model.macroF1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="model-note">
              {stats.modelPerformance.selectionReason}
            </p>
            <p className="model-note">
              Confidence values shown per-prediction are model probabilities, not overall accuracy.
            </p>
          </div>
        )}
      </div>

      <div className="analysis-section">
        <h3>GIS Availability</h3>
        {stats.gisAvailability && (
          <div className="gis-info">
            <p>
              Vegetation coordinates: {stats.gisAvailability.totalCoordinates} / {stats.gisAvailability.totalSamples}
            </p>
            <p className="gis-note">
              {stats.gisAvailability.mapAvailable
                ? 'Map visualization is available for this dataset.'
                : 'Map visualization unavailable for this dataset.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VegetationStats;
