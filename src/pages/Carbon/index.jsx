import { useState, useEffect } from 'react';
import {
  getCarbonStats,
  getCarbonChart
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import BarChart from '../../components/dashboard/BarChart';
import './Carbon.css';

const CARBON_FRACTION = 0.47;

function Carbon() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCarbonStats();
        setStats(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to fetch carbon stats:', err);
        setError('Failed to load carbon data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingState text="Loading carbon analysis..." />;
  if (error) return <ErrorState title="Carbon Error" message={error} />;
  if (!stats) return <EmptyState title="No carbon data" description="Carbon statistics are not available yet." />;

  const assumption = stats.assumption || {};

  return (
    <div className="carbon">
      <PageHeader
        title="Carbon Stock Analysis"
        subtitle="Estimated carbon stock derived from above-ground biomass."
      />

      <div className="stats-grid">
        <StatCard label="Total AGB" value={`${(stats.totalAGB || 0).toLocaleString()} kg`} />
        <StatCard label="Estimated Carbon Stock" value={`${(stats.estimatedCarbon || 0).toLocaleString()} kg`} />
        <StatCard label="Average Carbon" value={`${(stats.averageCarbon || 0).toFixed(2)} kg`} />
        <StatCard label="Trees" value={`${(stats.totalRecords || 0).toLocaleString()}`} />
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-container__title">Carbon Distribution</div>
          <div className="chart-container__subtitle">Visualization categories (AGB × 0.47)</div>
          {(stats.carbonDistribution || []).length > 0 ? (
            <BarChart data={stats.carbonDistribution} xKey="range" yKey="count" />
          ) : (
            <EmptyState title="No data" description="Carbon distribution is not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Site-wise Carbon</div>
          <div className="chart-container__subtitle">Estimated carbon by sampling site</div>
          {(stats.siteDistribution || []).length > 0 ? (
            <BarChart data={(stats.siteDistribution || []).map((s) => ({ name: s.site, estimatedCarbon: s.estimatedCarbon }))} xKey="name" yKey="estimatedCarbon" />
          ) : (
            <EmptyState title="No data" description="Site-wise carbon is not available." />
          )}
        </div>

        <div className="chart-container">
          <div className="chart-container__title">Group-wise Carbon</div>
          <div className="chart-container__subtitle">Estimated carbon by tree group</div>
          {(stats.groupDistribution || []).length > 0 ? (
            <BarChart data={(stats.groupDistribution || []).map((g) => ({ name: g.group, estimatedCarbon: g.estimatedCarbon }))} xKey="name" yKey="estimatedCarbon" />
          ) : (
            <EmptyState title="No data" description="Group-wise carbon is not available." />
          )}
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-card">
          <h3 className="table-card__title">Site-wise Carbon</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Site</th><th>Trees</th><th>AGB (kg)</th><th>Carbon (kg)</th></tr>
              </thead>
              <tbody>
                {(stats.siteDistribution || []).map((row) => (
                  <tr key={row.site}>
                    <td>{row.site}</td>
                    <td>{row.count}</td>
                    <td>{row.totalAGB?.toLocaleString()}</td>
                    <td>{row.estimatedCarbon?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <h3 className="table-card__title">Group-wise Carbon</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Group</th><th>Trees</th><th>AGB (kg)</th><th>Carbon (kg)</th></tr>
              </thead>
              <tbody>
                {(stats.groupDistribution || []).map((row) => (
                  <tr key={row.group}>
                    <td>{row.group}</td>
                    <td>{row.count}</td>
                    <td>{row.totalAGB?.toLocaleString()}</td>
                    <td>{row.estimatedCarbon?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="method-card">
        <h3 className="method-card__title">Carbon Estimation Method</h3>
        <div className="method-formula">
          Estimated Carbon = AGB × {assumption.carbonFraction || CARBON_FRACTION}
        </div>
        <p className="method-note">
          Estimated Carbon Stock is computed as Total AGB × {(assumption.carbonFraction || CARBON_FRACTION)} (assumed carbon fraction). This is an <strong>estimate</strong>, not a direct measurement.
        </p>
        <p className="method-note text-muted">
          Campus-level totals use the observed dataset AGB from FieldData. For an individual AI prediction, Predicted Carbon = Predicted AGB × {(assumption.carbonFraction || CARBON_FRACTION)}; do not add dataset AGB and predicted AGB together.
        </p>
      </div>
    </div>
  );
}

export default Carbon;
