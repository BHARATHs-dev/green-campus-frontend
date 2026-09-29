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

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="image-chart-tooltip" role="tooltip">
        <div className="image-chart-tooltip__title">{data.fullName}</div>
        <div className="image-chart-tooltip__value" style={{ color: data.fill }}>
          {Number(data.value).toFixed(2)}{' '}
          <span className="image-chart-tooltip__unit">{data.unit}</span>
        </div>
        <div className="image-chart-tooltip__hint">{data.hint}</div>
      </div>
    );
  }
  return null;
}

function ImagePredictionChart({ agb, carbon }) {
  const [chartMode, setChartMode] = useState('vertical'); // 'vertical' | 'horizontal'
  const chartId = useId();

  if (agb == null || carbon == null) return null;

  const numAgb = Number(agb);
  const numCarbon = Number(carbon);

  const chartData = [
    {
      name: 'AGB',
      fullName: 'Above Ground Biomass (AGB)',
      value: Number(numAgb.toFixed(2)),
      unit: 'kg/tree',
      fill: AGB_COLOR,
      hint: 'API Predicted Biomass',
    },
    {
      name: 'Carbon',
      fullName: 'Carbon Stock',
      value: Number(numCarbon.toFixed(2)),
      unit: 'kg C/tree',
      fill: CARBON_COLOR,
      hint: 'AGB × 0.47 (IPCC standard)',
    },
  ];

  const carbonPercent = numAgb > 0 ? ((numCarbon / numAgb) * 100).toFixed(1) : '47.0';

  return (
    <div className="image-chart-card" role="region" aria-labelledby={`chart-title-${chartId}`}>
      <div className="image-chart-card__header">
        <div>
          <h4 id={`chart-title-${chartId}`} className="image-chart-card__title">
            Biomass &amp; Carbon Prediction
          </h4>
          <p className="image-chart-card__subtitle">
            Comparative analysis of predicted biomass and estimated carbon stock per tree
          </p>
        </div>

        <div className="image-chart-mode-toggle" role="group" aria-label="Chart orientation">
          <button
            type="button"
            className={`image-chart-toggle-btn ${chartMode === 'vertical' ? 'image-chart-toggle-btn--active' : ''}`}
            onClick={() => setChartMode('vertical')}
            aria-pressed={chartMode === 'vertical'}
          >
            Vertical Bar
          </button>
          <button
            type="button"
            className={`image-chart-toggle-btn ${chartMode === 'horizontal' ? 'image-chart-toggle-btn--active' : ''}`}
            onClick={() => setChartMode('horizontal')}
            aria-pressed={chartMode === 'horizontal'}
          >
            Biomass vs Carbon
          </button>
        </div>
      </div>

      <div className="image-chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'vertical' ? (
            <BarChart
              data={chartData}
              margin={{ top: 28, right: 30, left: 16, bottom: 20 }}
              barCategoryGap="30%"
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
                  value: 'Amount (kg/tree)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: { fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={90}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-v-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(val) => `${val}`}
                  style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 40, left: 24, bottom: 20 }}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                label={{
                  value: 'Amount (kg/tree)',
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={45}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-h-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(val) => `${val}`}
                  style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Ratio Comparison Footnote & Accessibility Table */}
      <div className="image-chart-footer">
        <div className="image-chart-legend">
          <div className="image-chart-legend__item">
            <span className="image-chart-legend__dot" style={{ backgroundColor: AGB_COLOR }} />
            <span className="image-chart-legend__label">AGB:</span>
            <span className="image-chart-legend__val">{numAgb.toFixed(2)} kg/tree</span>
          </div>
          <div className="image-chart-legend__item">
            <span className="image-chart-legend__dot" style={{ backgroundColor: CARBON_COLOR }} />
            <span className="image-chart-legend__label">Carbon Stock:</span>
            <span className="image-chart-legend__val">{numCarbon.toFixed(2)} kg C/tree</span>
          </div>
          <div className="image-chart-legend__item image-chart-legend__ratio">
            <span className="image-chart-legend__badge">Ratio: {carbonPercent}%</span>
          </div>
        </div>

        {/* Screen Reader Accessible Table Summary */}
        <div className="sr-only">
          <table>
            <caption>Biomass &amp; Carbon prediction summary</caption>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Value</th>
                <th scope="col">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Above Ground Biomass (AGB)</td>
                <td>{numAgb.toFixed(2)}</td>
                <td>kg/tree</td>
              </tr>
              <tr>
                <td>Carbon Stock</td>
                <td>{numCarbon.toFixed(2)}</td>
                <td>kg C/tree</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ImagePredictionChart;
