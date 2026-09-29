import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SearchToolbar from '../../components/common/SearchToolbar';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmModal from '../../components/common/ConfirmModal';
import PredictionResult from '../../components/common/PredictionResult';
import VegetationStats from '../../components/vegetation/VegetationStats';
import NDVIAnalysis from '../../components/vegetation/NDVIAnalysis';
import SoilMoistureAnalysis from '../../components/vegetation/SoilMoistureAnalysis';
import RestorationAnalysis from '../../components/vegetation/RestorationAnalysis';
import Tabs from '../../components/common/Tabs';
import './Vegetation.css';

function Vegetation() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [ndviAnalysis, setNdviAnalysis] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(null);
  const [restoration, setRestoration] = useState(null);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [degradationLevel, setDegradationLevel] = useState('');
  const [landCoverType, setLandCoverType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit };
      if (search) params.search = search;
      if (region) params.region = region;
      if (degradationLevel) params.degradationLevel = degradationLevel;
      if (landCoverType) params.landCoverType = landCoverType;
      const [dataRes, statsRes, ndviRes, soilRes, restorationRes] = await Promise.all([
        api.get('/vegetation-data', { params }),
        api.get('/vegetation-data/stats'),
        api.get('/vegetation-data/analysis/ndvi'),
        api.get('/vegetation-data/analysis/soil-moisture'),
        api.get('/vegetation-data/analysis/restoration'),
      ]);
      setData(dataRes.data.data);
      setTotal(dataRes.data.total);
      setTotalPages(dataRes.data.totalPages);
      setStats(statsRes.data.data || statsRes.data);
      setNdviAnalysis(ndviRes.data);
      setSoilMoisture(soilRes.data);
      setRestoration(restorationRes.data);
    } catch (error) {
      console.error('Failed to fetch vegetation data:', error);
      setError('Failed to load vegetation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, region, degradationLevel, landCoverType, page, limit]);

  const handleClear = () => {
    setSearch('');
    setRegion('');
    setDegradationLevel('');
    setLandCoverType('');
    setPage(1);
    setSelected(null);
    setPrediction(null);
  };

  const handleViewSample = (sample) => {
    setSelected(sample);
    setPrediction(null);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!selected) return;
    try {
      setPredicting(true);
      setPrediction(null);
      const res = await api.post(`/prediction/degradation/sample/${selected._id}`);
      setPrediction(res.data.data);
    } catch (err) {
      console.error('Prediction error:', err);
      setPrediction({ error: 'Prediction failed.' });
    } finally {
      setPredicting(false);
    }
  };

  const conditionClass = (level) => {
    if (level === 'Healthy') return 'condition-badge condition-badge--healthy';
    if (level === 'Moderately Degraded') return 'condition-badge condition-badge--moderate';
    if (level === 'Severely Degraded') return 'condition-badge condition-badge--severe';
    return 'condition-badge';
  };

  const columns = [
    { key: 'sampleId', label: 'Sample ID' },
    { key: 'region', label: 'Region' },
    { key: 'ndvi', label: 'NDVI', render: (val) => val?.toFixed(4) || '—' },
    { key: 'savi', label: 'SAVI', render: (val) => val?.toFixed(4) || '—' },
    { key: 'canopyCoverPercent', label: 'Canopy %', render: (val) => `${val}%` },
    { key: 'degradationLevel', label: 'Condition', render: (val) => (
      <span className={conditionClass(val)}>{val}</span>
    )},
    { key: 'actions', label: 'Action', width: 100, render: (_, row) => (
      <button className="btn btn-ghost btn-sm" onClick={() => handleViewSample(row)}>Details</button>
    )}
  ];

  if (error && !loading && !data.length) {
    return <ErrorState title="Vegetation Error" message={error} onRetry={fetchData} />;
  }

  return (
    <div className="vegetation">
      <PageHeader
        title="Vegetation Monitoring"
        subtitle="Track vegetation health, indices, and degradation across campus sites."
      />

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Samples" value={(stats.totalSamples || 0).toLocaleString()} />
          <StatCard label="Healthy" value={(stats.healthy || 0).toLocaleString()} />
          <StatCard label="Moderately Degraded" value={(stats.moderatelyDegraded || 0).toLocaleString()} />
          <StatCard label="Severely Degraded" value={(stats.severelyDegraded || 0).toLocaleString()} />
          <StatCard label="Average NDVI" value={(stats.averageNDVI || 0).toFixed(4)} />
        </div>
      )}

      <SearchToolbar
        search={{ value: search, placeholder: 'Search sample ID, region...' }}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onSearch={() => setPage(1)}
        filters={[
          { name: 'region', label: 'Region', placeholder: 'All Regions', options: [
            { value: 'Central_Forest', label: 'Central Forest' },
            { value: 'East_Hills', label: 'East Hills' },
            { value: 'North_Valley', label: 'North Valley' },
            { value: 'River_Buffer', label: 'River Buffer' },
            { value: 'South_Wetland', label: 'South Wetland' },
            { value: 'West_Dryland', label: 'West Dryland' }
          ], value: region },
          { name: 'condition', label: 'Condition', placeholder: 'All Conditions', options: [
            { value: 'Healthy', label: 'Healthy' },
            { value: 'Moderately Degraded', label: 'Moderately Degraded' },
            { value: 'Severely Degraded', label: 'Severely Degraded' }
          ], value: degradationLevel },
          { name: 'landCover', label: 'Land Cover', placeholder: 'All Land Cover', options: [
            { value: 'Forest', label: 'Forest' },
            { value: 'Shrubland', label: 'Shrubland' },
            { value: 'Grassland', label: 'Grassland' },
            { value: 'Wetland', label: 'Wetland' },
            { value: 'Riparian Vegetation', label: 'Riparian Vegetation' }
          ], value: landCoverType }
        ]}
        onFilterChange={(name, value) => {
          if (name === 'region') setRegion(value);
          if (name === 'condition') setDegradationLevel(value);
          if (name === 'landCover') setLandCoverType(value);
          setPage(1);
        }}
        onClear={handleClear}
      />

      <Tabs
        items={[
          { key: 'stats', label: 'Statistics' },
          { key: 'ndvi', label: 'NDVI Analysis' },
          { key: 'soil', label: 'Soil Moisture' },
          { key: 'restoration', label: 'Restoration' }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="tab-content">
        {activeTab === 'stats' && <VegetationStats stats={stats} />}
        {activeTab === 'ndvi' && <NDVIAnalysis data={ndviAnalysis} />}
        {activeTab === 'soil' && <SoilMoistureAnalysis data={soilMoisture} />}
        {activeTab === 'restoration' && <RestorationAnalysis data={restoration} />}
      </div>

      <div className="info-text">
        Showing {data.length} of {total.toLocaleString()} samples
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyTitle="No samples found"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {drawerOpen && (
        <div className="drawer-overlay" onClick={handleCloseDrawer}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer__header">
              <h3 className="drawer__title">Vegetation Sample</h3>
              <button className="drawer__close" onClick={handleCloseDrawer} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="drawer__body">
              {selected && (
                <>
                  <div className="detail-grid">
                    <div className="detail-row"><span className="detail-row__label">Sample ID</span><span className="detail-row__value">{selected.sampleId || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">Region</span><span className="detail-row__value">{selected.region || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">Land Cover</span><span className="detail-row__value">{selected.landCoverType || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">NDVI</span><span className="detail-row__value">{selected.ndvi?.toFixed(4) || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">SAVI</span><span className="detail-row__value">{selected.savi?.toFixed(4) || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">RVI</span><span className="detail-row__value">{selected.rvi?.toFixed(4) || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">ARI</span><span className="detail-row__value">{selected.ari?.toFixed(4) || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">MSI</span><span className="detail-row__value">{selected.msi?.toFixed(4) || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">PRI</span><span className="detail-row__value">{selected.pri?.toFixed(4) || '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">Canopy Cover</span><span className="detail-row__value">{selected.canopyCoverPercent}%</span></div>
                    <div className="detail-row"><span className="detail-row__label">Vegetation Cover</span><span className="detail-row__value">{selected.vegetationCoverPercent}%</span></div>
                    <div className="detail-row"><span className="detail-row__label">Soil Moisture</span><span className="detail-row__value">{selected.soilMoisturePercent}%</span></div>
                    <div className="detail-row"><span className="detail-row__label">Species Richness</span><span className="detail-row__value">{selected.speciesRichness ?? '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">SOC</span><span className="detail-row__value">{selected.soc ?? '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">Erosion Risk</span><span className="detail-row__value">{selected.erosionRisk ?? '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">Human Disturbance</span><span className="detail-row__value">{selected.humanDisturbance ?? '—'}</span></div>
                    <div className="detail-row"><span className="detail-row__label">Ecosystem Stability</span><span className="detail-row__value">{selected.ecosystemStability ?? '—'}</span></div>
                    <div className="detail-row">
                      <span className="detail-row__label">Dataset Condition</span>
                      <span className={conditionClass(selected.degradationLevel)}>{selected.degradationLevel || '—'}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      className="btn btn-ai w-full"
                      onClick={handlePredict}
                      disabled={predicting}
                    >
                      {predicting ? 'Analyzing...' : 'AI Assess Vegetation'}
                    </button>
                  </div>

                  {prediction && !prediction.error && (
                    <PredictionResult
                      title="AI Vegetation Assessment"
                      value={prediction.prediction?.prediction}
                      unit=""
                      modelInfo={
                        <div>
                          <div>Model: CatBoost Classifier</div>
                          <div>Accuracy: 93.83%</div>
                          <div>Macro F1: 0.9282</div>
                        </div>
                      }
                      inputFeatures={[
                        { label: 'NDVI', value: selected.ndvi?.toFixed(4) || '—' },
                        { label: 'SAVI', value: selected.savi?.toFixed(4) || '—' },
                        { label: 'Region', value: selected.region || '—' },
                        { label: 'Land Cover', value: selected.landCoverType || '—' },
                        { label: 'Canopy Cover', value: `${selected.canopyCoverPercent}%` }
                      ]}
                    />
                  )}

                   {prediction?.error && (
                     <div className="warning-banner mt-3">
                       <svg className="warning-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                       <span>{prediction.error}</span>
                     </div>
                   )}
                </>
              )}
            </div>
            <div className="drawer__footer">
              <button className="btn btn-secondary" onClick={handleCloseDrawer}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vegetation;
