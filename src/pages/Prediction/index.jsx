import { useState, useEffect, useCallback } from 'react';
import {
  getFieldData,
  predictAGBFromTree,
  getPredictionHistory
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import PredictionResult from '../../components/common/PredictionResult';
import './Prediction.css';

const CARBON_FRACTION = 0.47;

function Prediction() {
  const [treeSearch, setTreeSearch] = useState('');
  const [treeGroup, setTreeGroup] = useState('');
  const [trees, setTrees] = useState([]);
  const [treePage, setTreePage] = useState(1);
  const [treeTotal, setTreeTotal] = useState(0);
  const [treeTotalPages, setTreeTotalPages] = useState(1);
  const [selectedTree, setSelectedTree] = useState(null);
  const [treePrediction, setTreePrediction] = useState(null);
  const [loadingTree, setLoadingTree] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [error, setError] = useState('');

  const PAGE_SIZE = 10;

  const loadTrees = useCallback(async (page = 1, search = '') => {
    try {
      const res = await getFieldData({
        page,
        limit: PAGE_SIZE,
        search,
        group: treeGroup || undefined
      });
      setTrees(res.data.data || []);
      setTreeTotal(res.data.total || 0);
      setTreeTotalPages(res.data.totalPages || 1);
      setTreePage(page);
    } catch (err) {
      console.error(err);
      setError('Unable to load tree data.');
    }
  }, [treeGroup]);

  const loadHistory = useCallback(async () => {
    try {
      const params = { page: 1, limit: 10, type: 'AGB' };
      const res = await getPredictionHistory(params);
      setHistory(res.data.data || []);
      setHistoryTotal(res.data.total || 0);
      setHistoryTotalPages(res.data.totalPages || 1);
      setHistoryPage(res.data.page || 1);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadTrees(1, '');
    loadHistory();
  }, [loadTrees, loadHistory]);

  const handleAGBPrediction = async () => {
    if (!selectedTree) return;
    try {
      setLoadingTree(true);
      setError('');
      setTreePrediction(null);
      const result = await predictAGBFromTree(selectedTree._id);
      setTreePrediction(result.data.data);
      loadHistory();
    } catch (err) {
      console.error(err);
      setError('AGB prediction failed.');
    } finally {
      setLoadingTree(false);
    }
  };

  const agbValue = treePrediction?.prediction?.prediction;
  const carbonValue = agbValue != null ? (agbValue * CARBON_FRACTION) : null;

  const treeColumns = [
    { key: 'name', label: 'Tree', render: (val, row) => (
      <button className="btn btn-ghost btn-sm prediction-tree-link" onClick={() => { setSelectedTree(row); setTreePrediction(null); }}>
        {val || row._id}
      </button>
    )},
    { key: 'group', label: 'Group', render: (val) => val || '—' },
    { key: 'site', label: 'Site', render: (val) => val || '—' },
    { key: 'diameter', label: 'DBH', render: (val) => val ? `${Number(val).toFixed(2)} cm` : '—' }
  ];

  const historyColumns = [
    { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'type', label: 'Type' },
    { key: 'recordId', label: 'Record', render: (val) => val ? String(val).slice(-6) : 'manual' },
    { key: 'prediction', label: 'AGB (kg)', render: (val) => typeof val === 'number' ? Number(val).toFixed(4) : String(val) },
    { key: 'source', label: 'Source', render: (val) => val || '—' }
  ];

  return (
    <div className="prediction-page">
      <PageHeader
        title="AI Prediction Center"
        subtitle="Predict Above-Ground Biomass (AGB) using CatBoost machine learning model."
      />

      {error && <div className="prediction-error">{error}</div>}

      <div className="prediction-grid">
        <div className="prediction-card">
          <h3 className="prediction-card__title">Search Trees</h3>
          <p className="prediction-card__subtitle">Search and select a tree from the field dataset.</p>

          <div className="workflow-indicator">
            <span className="workflow-step">SELECT</span>
            <span className="workflow-arrow">→</span>
            <span className="workflow-step">REVIEW</span>
            <span className="workflow-arrow">→</span>
            <span className="workflow-step">PREDICT</span>
            <span className="workflow-arrow">→</span>
            <span className="workflow-step">RESULT</span>
          </div>

          <div className="search-toolbar search-toolbar--mb">
            <input
              type="text"
              className="search-toolbar__input"
              placeholder="Search tree (name / group / site)..."
              value={treeSearch}
              onChange={(e) => { setTreeSearch(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && loadTrees(1, treeSearch)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => loadTrees(1, treeSearch)}>Search</button>
            <select
              className="search-toolbar__select"
              value={treeGroup}
              onChange={(e) => { setTreeGroup(e.target.value); loadTrees(1, treeSearch); }}
            >
              <option value="">All Groups</option>
              <option value="banana">Banana</option>
              <option value="cacao">Cacao</option>
              <option value="citrus">Citrus</option>
              <option value="fruit">Fruit</option>
              <option value="other">Other</option>
              <option value="timber">Timber</option>
            </select>
          </div>

          <DataTable
            columns={treeColumns}
            data={trees}
            loading={false}
            emptyTitle="No trees found"
            emptyDescription="Try adjusting your search."
          />

          <Pagination
            page={treePage}
            totalPages={treeTotalPages}
            total={treeTotal}
            limit={PAGE_SIZE}
            onPageChange={(p) => loadTrees(p, treeSearch)}
          />

          {selectedTree && (
            <div className="selected-details mt-3">
              <h4>Selected Tree</h4>
              <div className="detail-grid">
                <div className="detail-row"><span className="detail-row__label">Diameter</span><span className="detail-row__value">{Number(selectedTree.diameter || 0).toFixed(2)} cm</span></div>
                <div className="detail-row"><span className="detail-row__label">Height</span><span className="detail-row__value">{selectedTree.height > 0 ? Number(selectedTree.height).toFixed(2) + ' m' : 'Not Available'}</span></div>
                <div className="detail-row"><span className="detail-row__label">Year</span><span className="detail-row__value">{selectedTree.year || '—'}</span></div>
                <div className="detail-row"><span className="detail-row__label">Group</span><span className="detail-row__value">{selectedTree.group || 'N/A'}</span></div>
                <div className="detail-row"><span className="detail-row__label">Site</span><span className="detail-row__value">{selectedTree.site || 'N/A'}</span></div>
              </div>

              {selectedTree.height <= 0 && (
                <div className="warning-banner mt-3">
                  <svg className="warning-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Height data is unavailable for this tree. The AGB prediction may be less reliable.</span>
                </div>
              )}

              <div className="mt-3">
                <button className="btn btn-ai w-full" onClick={handleAGBPrediction} disabled={loadingTree}>
                  {loadingTree ? 'Running CatBoost prediction...' : 'Predict AGB with CatBoost'}
                </button>
              </div>

              {treePrediction && (
                <div className="ai-result-card">
                  <div className="ai-result-card__title">CatBoost AGB Prediction</div>
                  <div className="ai-result-card__value">{Number(agbValue).toFixed(4)} kg</div>
                  {carbonValue != null && (
                    <div className="ai-result-card__carbon">
                      <div className="ai-result-card__carbon-row">
                        <span>Estimated Carbon</span>
                        <span className="ai-result-card__carbon-value">{carbonValue.toFixed(4)} kg</span>
                      </div>
                      <div className="ai-result-card__carbon-note">Estimated Carbon = AGB × 0.47</div>
                    </div>
                  )}
                  <div className="ai-result-card__model">
                    <div className="ai-result-card__model-label">Model</div>
                    <div>Model: CatBoostRegressor</div>
                      <div><span>Version:</span> catboost-v1</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="prediction-card">
          <h3 className="prediction-card__title">Prediction History</h3>
          <p className="prediction-card__subtitle">Recent AGB predictions</p>

          <DataTable
            columns={historyColumns}
            data={history}
            loading={false}
            emptyTitle="No predictions yet"
            emptyDescription="Run a prediction from the tree search."
          />

          <Pagination
            page={historyPage}
            totalPages={historyTotalPages}
            total={historyTotal}
            limit={10}
            onPageChange={(p) => loadHistory()}
          />
        </div>
      </div>
    </div>
  );
}

export default Prediction;
