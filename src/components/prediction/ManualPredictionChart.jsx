import { useState, useId } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const AGB_COLOR = '#10B981';    // Emerald 600
const CARBON_COLOR = '#0D9488'; // Teal 600

function CustomTooltip({ active, payload, unit = 'kg', carbonUnit = 'kg C' }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="manual-chart-tooltip" role="tooltip">
        <div className="manual-chart-tooltip__title">{data.fullName}</div>
        <div className="manual-chart-tooltip__value" style={{ color: data.fill }}>
          {Number(data.value).toFixed(2)}{' '}
          <span className="manual-chart-tooltip__unit">{data.unit}</span>
        </div>
        <div className="manual-chart-tooltip__hint">{data.hint}</div>
      </div>
    );
  }
  return null;
}

function ManualPredictionChart({ agb, carbon, unit = 'kg', carbonUnit = 'kg' }) {
  const [chartMode, setChartMode] = useState('vertical'); // 'vertical' | 'horizontal'
  const chartId = useId();

  if (agb == null || carbon == null) return null;

  const numAgb = Number(agb);
  const numCarbon = Number(carbon);

  const chartData = [
    {
      name: 'AGB',
      fullName: 'Above-Ground Biomass (AGB)',
      value: Number(numAgb.toFixed(2)),
      unit,
      fill: AGB_COLOR,
      hint: 'CatBoost Regressor prediction',
    },
    {
      name: 'Carbon',
      fullName: 'Estimated Carbon Stock',
      value: Number(numCarbon.toFixed(2)),
      unit: carbonUnit,
      fill: CARBON_COLOR,
      hint: 'AGB × 0.47 (IPCC allometric ratio)',
    },
  ];

  const carbonPercent = numAgb > 0 ? ((numCarbon / numAgb) * 100).toFixed(1) : '47.0';

  return (
    <div className="manual-chart-card" role="region" aria-labelledby={`manual-chart-title-${chartId}`}>
      <div className="manual-chart-card__header">
        <div>
          <h4 id={`manual-chart-title-${chartId}`} className="manual-chart-card__title">
            Biomass &amp; Carbon Prediction Visualization
          </h4>
          <p className="manual-chart-card__subtitle">
            CatBoost ML output comparison: Above-Ground Biomass vs Estimated Carbon Stock
          </p>
        </div>

        <div className="manual-chart-mode-toggle" role="group" aria-label="Chart orientation">
          <button
            type="button"
            className={`manual-chart-toggle-btn ${chartMode === 'vertical' ? 'manual-chart-toggle-btn--active' : ''}`}
            onClick={() => setChartMode('vertical')}
            aria-pressed={chartMode === 'vertical'}
          >
            Vertical Bar
          </button>
          <button
            type="button"
            className={`manual-chart-toggle-btn ${chartMode === 'horizontal' ? 'manual-chart-toggle-btn--active' : ''}`}
            onClick={() => setChartMode('horizontal')}
            aria-pressed={chartMode === 'horizontal'}
          >
            Horizontal Comparison
          </button>
        </div>
      </div>

      <div className="manual-chart-container" style={{ width: '100%', height: 310 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'vertical' ? (
            <BarChart
              data={chartData}
              margin={{ top: 28, right: 30, left: 16, bottom: 20 }}
              barCategoryGap="32%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fill: 'var(--text-primary)', fontWeight: 600 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                label={{
                  value: `Amount (${unit})`,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 },
                }}
              />
              <Tooltip content={<CustomTooltip unit={unit} carbonUnit={carbonUnit} />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={85}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-mv-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(val) => `${val} ${unit}`}
                  style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 50, left: 24, bottom: 20 }}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                label={{
                  value: `Amount (${unit})`,
                  position: 'insideBottom',
                  offset: -10,
                  style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 },
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 13, fill: 'var(--text-primary)', fontWeight: 600 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip unit={unit} carbonUnit={carbonUnit} />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={44}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-mh-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(val) => `${val} ${unit}`}
                  style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="manual-chart-footer">
        <div className="manual-chart-legend">
          <div className="manual-chart-legend__item">
            <span className="manual-chart-legend__dot" style={{ backgroundColor: AGB_COLOR }} />
            <span className="manual-chart-legend__label">Biomass (AGB):</span>
            <span className="manual-chart-legend__val">{numAgb.toFixed(2)} {unit}</span>
          </div>
          <div className="manual-chart-legend__item">
            <span className="manual-chart-legend__dot" style={{ backgroundColor: CARBON_COLOR }} />
            <span className="manual-chart-legend__label">Carbon Stock:</span>
            <span className="manual-chart-legend__val">{numCarbon.toFixed(2)} {carbonUnit}</span>
          </div>
          <div className="manual-chart-legend__item manual-chart-legend__ratio">
            <span className="manual-chart-legend__badge">Carbon Ratio: {carbonPercent}%</span>
          </div>
        </div>

        {/* Screen Reader Table */}
        <div className="sr-only">
          <table>
            <caption>CatBoost Biomass and Carbon prediction results</caption>
            <thead>
              <tr>
                <th scope="col">Variable</th>
                <th scope="col">Amount</th>
                <th scope="col">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Above-Ground Biomass</td>
                <td>{numAgb.toFixed(2)}</td>
                <td>{unit}</td>
              </tr>
              <tr>
                <td>Carbon Stock</td>
                <td>{numCarbon.toFixed(2)}</td>
                <td>{carbonUnit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManualPredictionChart;
