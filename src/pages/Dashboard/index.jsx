import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getDashboardSummary } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import BarChart from '../../components/dashboard/BarChart';
import PieChart from '../../components/dashboard/PieChart';
import ModelPerformanceCard from '../../components/common/ModelPerformanceCard';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, summaryRes] = await Promise.all([
        getDashboardStats(),
        getDashboardSummary()
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setSummary(summaryRes.data.data || summaryRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      const message = err.response?.status === 502
        ? 'Backend server is unreachable (502 Bad Gateway). Please make sure the backend server is running on port 5000.'
        : err.response?.data?.message || 'Failed to load dashboard data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRetry = () => {
    fetchData();
  };

  if (loading) return <LoadingState text="Loading dashboard..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={handleRetry} />;
  if (!stats) return <EmptyState title="No dashboard data" description="Dashboard statistics are not available yet." />;

  const fd = stats.fieldData || {};
  const veg = stats.vegetation || {};

  const conditionPie = (stats.conditionDistribution || []).map((d) => ({
    name: d.level,
    value: d.count
  }));

  const heightPct = fd.totalRecords ? ((fd.validHeightRecords || 0) / fd.totalRecords) * 100 : 0;
  const diameterPct = fd.totalRecords ? 100 : 0;
  const coordPct = fd.totalRecords ? (((fd.totalRecords || 0) - (fd.validHeightRecords || 0)) / fd.totalRecords) * 100 : 0;

  return (
    <div className="dashboard">
      <PageHeader
        title="Green Campus Intelligence"
        subtitle="Monitor campus vegetation, biomass and carbon using AI-powered analytics."
         actions={
          <span className="dashboard__live-badge">
            <span className="dashboard__live-dot" />
            Live
          </span>
        }
      />

      <div className="stats-grid">
        <StatCard label="Total Trees" value={fd.totalRecords?.toLocaleString() || 0} />
        <StatCard label="Vegetation Samples" value={veg.totalSamples?.toLocaleString() || 0} />
        <StatCard label="Total AGB" value={`${(fd.totalAGB || 0).toLocaleString()} kg`} />
        <StatCard label="Estimated Carbon" value={`${(fd.estimatedCarbon || 0).toLocaleString()} kg`} />
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__section">
          <div className="dashboard__section-title">Campus Data Quality</div>
          <div className="dashboard__section-subtitle">Field measurement completeness</div>
          <div className="data-quality-progress">
            <div className="data-quality-progress__item">
              <div className="data-quality-progress__header">
                <span className="data-quality-progress__label">Height Availability</span>
                <span className="data-quality-progress__value">
                  {(fd.validHeightRecords || 0).toLocaleString()} / {(fd.totalRecords || 0).toLocaleString()}
                </span>
              </div>
              <div className="data-quality-progress__bar">
                <div className="data-quality-progress__fill data-quality-progress__fill--partial" style={{ width: `${heightPct}%` }} />
              </div>
            </div>
            <div className="data-quality-progress__item">
              <div className="data-quality-progress__header">
                <span className="data-quality-progress__label">Diameter Availability</span>
                <span className="data-quality-progress__value">
                  {(fd.totalRecords || 0).toLocaleString()} / {(fd.totalRecords || 0).toLocaleString()}
                </span>
              </div>
              <div className="data-quality-progress__bar">
                <div className="data-quality-progress__fill data-quality-progress__fill--complete" style={{ width: `${diameterPct}%` }} />
              </div>
            </div>
            <div className="data-quality-progress__item">
              <div className="data-quality-progress__header">
                <span className="data-quality-progress__label">Coordinates</span>
                <span className="data-quality-progress__value">
                  {((fd.totalRecords || 0) - (fd.validHeightRecords || 0)).toLocaleString()} missing
                </span>
              </div>
              <div className="data-quality-progress__bar">
                <div className="data-quality-progress__fill data-quality-progress__fill--complete" style={{ width: `${100 - coordPct}%` }} />
              </div>
            </div>
            <div className="data-quality-progress__note">
              Height available for {(fd.validHeightRecords || 0).toLocaleString()} of {(fd.totalRecords || 0).toLocaleString()} records ({(heightPct).toFixed(1)}%). AGB predictions using missing height may be less reliable.
            </div>
          </div>
        </div>

        <div className="dashboard__section">
          <div className="dashboard__section-title">AI Model Status</div>
          <div className="dashboard__section-subtitle">Trained model evaluation metrics</div>
          <div className="model-grid">
            <ModelPerformanceCard
              title="AGB CatBoost"
              metrics={[
                { label: 'Test R²', value: '0.9959' },
                { label: 'MAE', value: '0.0764' },
                { label: 'RMSE', value: '0.1358' }
              ]}
            />
            <ModelPerformanceCard
              title="Vegetation CatBoost"
              metrics={[
                { label: 'Accuracy', value: '93.83%' },
                { label: 'Macro F1', value: '0.9282' }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-container__title">Vegetation Condition Distribution</div>
          <div className="chart-container__subtitle">Health status across all samples</div>
          {conditionPie.length > 0 ? (
            <PieChart data={conditionPie} nameKey="name" valueKey="value" />
          ) : (
            <EmptyState title="No data" description="Condition distribution is not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Average Vegetation Indices</div>
          <div className="chart-container__subtitle">Mean spectral indices by type</div>
          {(stats.vegetationIndices || []).length > 0 ? (
            <BarChart data={stats.vegetationIndices} xKey="index" yKey="value" />
          ) : (
            <EmptyState title="No data" description="Vegetation indices are not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Biomass Distribution</div>
          <div className="chart-container__subtitle">AGB range breakdown</div>
          {(stats.biomassDistribution || []).length > 0 ? (
            <BarChart data={stats.biomassDistribution} xKey="range" yKey="count" />
          ) : (
            <EmptyState title="No data" description="Biomass distribution is not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Site-wise Biomass</div>
          <div className="chart-container__subtitle">Total AGB by sampling site</div>
          {(stats.biomassBySite || []).length > 0 ? (
            <BarChart data={stats.biomassBySite.map(s => ({ name: s.site, totalAGB: s.totalAGB }))} xKey="name" yKey="totalAGB" />
          ) : (
            <EmptyState title="No data" description="Site-wise biomass is not available." />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
