import { useState, useEffect } from 'react';
import {
  getBiomassStats,
  getBiomassChart
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import BarChart from '../../components/dashboard/BarChart';
import ModelPerformanceCard from '../../components/common/ModelPerformanceCard';
import './Biomass.css';

function Biomass() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBiomassStats();
        setStats(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to fetch biomass stats:', err);
        setError('Failed to load biomass data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingState text="Loading biomass analysis..." />;
  if (error) return <ErrorState title="Biomass Error" message={error} />;
  if (!stats) return <EmptyState title="No biomass data" description="Biomass statistics are not available yet." />;

  const dq = stats.dataQuality || {};
  const mp = stats.modelPerformance || {};

  return (
    <div className="biomass">
      <PageHeader
        title="Biomass Analysis"
        subtitle="Above-ground biomass distribution, site breakdown, and AI model performance."
      />

      <div className="stats-grid">
        <StatCard label="Total AGB" value={`${(stats.totalAGB || 0).toLocaleString()} kg`} />
        <StatCard label="Average AGB" value={`${(stats.averageAGB || 0).toFixed(2)} kg`} />
        <StatCard label="Trees" value={(stats.totalRecords || 0).toLocaleString()} />
        <StatCard label="High Biomass (≥20 kg)" value={(stats.highBiomass || 0).toLocaleString()} />
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-container__title">AGB Distribution</div>
          <div className="chart-container__subtitle">Visualization categories (not scientific classes)</div>
          {(stats.agbDistribution || []).length > 0 ? (
            <BarChart data={stats.agbDistribution} xKey="range" yKey="count" />
          ) : (
            <EmptyState title="No data" description="AGB distribution is not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Site-wise AGB</div>
          <div className="chart-container__subtitle">Total AGB by sampling site</div>
          {(stats.siteDistribution || []).length > 0 ? (
            <BarChart data={(stats.siteDistribution || []).map((s) => ({ name: s.site, totalAGB: s.totalAGB }))} xKey="name" yKey="totalAGB" />
          ) : (
            <EmptyState title="No data" description="Site-wise data is not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Group-wise AGB</div>
          <div className="chart-container__subtitle">Total AGB by tree group</div>
          {(stats.groupDistribution || []).length > 0 ? (
            <BarChart data={(stats.groupDistribution || []).map((g) => ({ name: g.group, totalAGB: g.totalAGB }))} xKey="name" yKey="totalAGB" />
          ) : (
            <EmptyState title="No data" description="Group-wise data is not available." />
          )}
        </div>

          <div className="chart-container">
            <div className="chart-container__title">Estimated Carbon Stock</div>
            <div className="chart-container__subtitle">Computed as AGB × carbon fraction</div>
            <div className="carbon-estimate">
              <div className="carbon-estimate__value">
                {(stats.estimatedCarbon || 0).toLocaleString()} <span className="carbon-estimate__unit">kg</span>
              </div>
              <p className="carbon-estimate__note">
                This is an <strong>estimate</strong> derived from the assumed carbon fraction ({stats.carbonFraction || 0.47}), not a direct measurement.
              </p>
            </div>
          </div>
      </div>

      <div className="tables-grid">
        <div className="table-card">
          <h3 className="table-card__title">Site-wise Biomass</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Site</th><th>Trees</th><th>Total AGB (kg)</th><th>Avg AGB (kg)</th></tr>
              </thead>
              <tbody>
                {(stats.siteDistribution || []).map((row) => (
                  <tr key={row.site}>
                    <td>{row.site}</td>
                    <td>{row.count}</td>
                    <td>{row.totalAGB?.toLocaleString()}</td>
                    <td>{row.averageAGB?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <h3 className="table-card__title">Group-wise Biomass</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Group</th><th>Count</th><th>Total AGB (kg)</th></tr>
              </thead>
              <tbody>
                {(stats.groupDistribution || []).map((row) => (
                  <tr key={row.group}>
                    <td>{row.group}</td>
                    <td>{row.count}</td>
                    <td>{row.totalAGB?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card data-quality">
          <h3 className="info-card__title">Data Quality</h3>
          <div className="data-quality-grid">
            <div className="data-quality-item">
              <span className="data-quality-item__label">Total records</span>
              <span className="data-quality-item__value">{dq.totalRecords || '—'}</span>
            </div>
            <div className="data-quality-item">
              <span className="data-quality-item__label">Diameter available</span>
              <span className="data-quality-item__value">{dq.diameterAvailable || '—'}</span>
            </div>
            <div className="data-quality-item">
              <span className="data-quality-item__label">Height available</span>
              <span className="data-quality-item__value">{dq.heightAvailable || '—'}</span>
            </div>
            <div className="data-quality-item__note">
              Height is available for only {dq.heightAvailable || 0} / {dq.totalRecords || 0} records; zeros are excluded from averages.
            </div>
          </div>
        </div>

        <div className="info-card model-performance">
          <h3 className="info-card__title">AI Model Performance</h3>
          <div className="model-grid">
            <ModelPerformanceCard
              title="AGB CatBoost"
              metrics={[
                { label: 'Algorithm', value: mp.algorithm || 'CatBoost' },
                { label: 'Test R²', value: mp.testR2 || '—' },
                { label: 'MAE', value: mp.testMAE || '—' },
                { label: 'RMSE', value: mp.testRMSE || '—' },
                { label: 'CV R²', value: mp.cvR2 || '—' }
              ]}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            Dataset AGB is the observed value in FieldData; AI Predicted AGB comes from the CatBoost model (Prediction page).
          </p>
        </div>
      </div>
    </div>
  );
}

export default Biomass;
