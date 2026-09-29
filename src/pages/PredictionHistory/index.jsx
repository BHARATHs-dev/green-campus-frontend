import { useState, useEffect, useCallback } from 'react';
import { getPredictionHistory } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './PredictionHistory.css';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'field', label: 'Field Data' },
  { value: 'image', label: 'Tree Image' },
  { value: 'satellite', label: 'Satellite' }
];

function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 15;

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: PAGE_SIZE };
      if (typeFilter !== 'all') params.predictionType = typeFilter;
      const res = await getPredictionHistory(params);
      setHistory(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(Math.ceil((res.data.total || 0) / PAGE_SIZE));
    } catch (err) {
      console.error('Failed to load prediction history:', err);
      setError('Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const columns = [
    {
      key: 'createdAt',
      label: 'Date & Time',
      render: (val) => new Date(val).toLocaleString()
    },
    {
      key: 'predictionType',
      label: 'Type',
      render: (val) => {
        const map = {
          field: 'success',
          image: 'info',
          satellite: 'warning'
        };
        return (
          <span className={`badge badge--${map[val] || 'default'}`}>
            {val}
          </span>
        );
      }
    },
    {
      key: 'prediction',
      label: 'Prediction Result',
      render: (val) => {
        if (typeof val === 'number') {
          return <span className="prediction-value">{Number(val).toFixed(4)} kg</span>;
        }
        return String(val);
      }
    },
    {
      key: 'source',
      label: 'Source',
      render: (val) => {
        const label = val === 'manual' ? 'Manual' :
                       val === 'image_upload' ? 'Image Upload' :
                       val === 'satellite_upload' ? 'Satellite Upload' :
                       val === 'database' ? 'Database' : val;
        return <span className="source-tag">{label}</span>;
      }
    },
    {
      key: 'modelVersion',
      label: 'Model Version',
      render: (val) => <span className="model-version">{val || 'catboost-v1'}</span>
    }
  ];

  const handleRetry = () => {
    setError('');
    loadHistory();
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="prediction-history-page">
      <PageHeader
        title="Prediction History"
        subtitle="View all AI predictions performed across the platform."
      />

      <div className="prediction-history-card">
        <div className="prediction-history-header">
          <div className="prediction-history-filters">
            <div className="filter-group">
              <label className="filter-label">Filter by Type</label>
              <select
                className="form-select form-select--sm"
                value={typeFilter}
                onChange={handleTypeChange}
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="prediction-history-stats">
              <span className="stat-item">
                <span className="stat-value">{total.toLocaleString()}</span>
                <span className="stat-label">Total Predictions</span>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="prediction-history-loading">
            <LoadingState text="Loading prediction history..." />
          </div>
        ) : error ? (
          <div className="prediction-history-error">
            <ErrorState title="Error" message={error} onRetry={handleRetry} />
          </div>
        ) : history.length === 0 ? (
          <div className="prediction-history-empty">
            <EmptyState
              title="No predictions yet"
              description="Run a prediction from the AI Prediction or Manual AGB Prediction page."
            />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={history}
              loading={false}
              emptyTitle="No predictions found"
              emptyDescription="Try adjusting your filters."
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default PredictionHistory;
