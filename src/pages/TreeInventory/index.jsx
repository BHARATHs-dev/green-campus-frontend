import { useState, useEffect, useCallback } from 'react';
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
import TreeForm from '../../components/trees/TreeForm';
import './TreeInventory.css';

function TreeInventory() {
  const [trees, setTrees] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [plotFilter, setPlotFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrees, setTotalTrees] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [sites, setSites] = useState([]);
  const [plots, setPlots] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTree, setEditingTree] = useState(null);

  const fetchTrees = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (siteFilter) params.site = siteFilter;
      if (plotFilter) params.plot = plotFilter;
      const res = await api.get('/trees', { params });
      setTrees(res.data.data || []);
      setTotalTrees(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch trees:', error);
    } finally {
      setLoading(false);
    }
  }, [search, siteFilter, plotFilter, page, limit]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/trees/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch tree stats:', error);
    }
  };

  const fetchSitesAndPlots = async () => {
    try {
      const res = await api.get('/trees', { params: { limit: 1000 } });
      const data = res.data.data || [];
      const uniqueSites = [...new Set(data.map((t) => t.site))].sort();
      const uniquePlots = [...new Set(data.map((t) => t.plot_id))].sort();
      setSites(uniqueSites);
      setPlots(uniquePlots);
    } catch (error) {
      console.error('Failed to fetch sites/plots:', error);
    }
  };

  useEffect(() => {
    fetchTrees();
    fetchStats();
    fetchSitesAndPlots();
  }, [fetchTrees]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setSiteFilter('');
    setPlotFilter('');
    setPage(1);
  };

  const handleViewTree = (tree) => {
    setSelectedTree(tree);
    setPrediction(null);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedTree(null);
    setPrediction(null);
  };

  const handlePredictAGB = async () => {
    if (!selectedTree) return;
    try {
      setPredicting(true);
      setPrediction(null);
      const result = await api.post(`/prediction/agb/tree/${selectedTree._id}`);
      setPrediction(result.data.data);
    } catch (err) {
      console.error('AGB prediction failed:', err);
      setPrediction({ error: 'Prediction failed. Please try again.' });
    } finally {
      setPredicting(false);
    }
  };

  const handleAdd = () => {
    setEditingTree(null);
    setShowForm(true);
  };

  const handleEdit = (tree) => {
    setEditingTree(tree);
    setShowForm(true);
  };

  const handleDeleteClick = (tree) => {
    setDeleteConfirm(tree);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/trees/${deleteConfirm._id}`);
      fetchTrees();
      fetchStats();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete tree:', error);
    }
  };

  const handleFormSave = async (data) => {
    try {
      if (editingTree) {
        await api.put(`/trees/${editingTree._id}`, data);
      } else {
        await api.post('/trees', data);
      }
      setShowForm(false);
      setEditingTree(null);
      fetchTrees();
      fetchStats();
    } catch (error) {
      console.error('Failed to save tree:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (siteFilter) params.site = siteFilter;
      if (plotFilter) params.plot = plotFilter;
      const res = await api.get('/trees/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trees_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'Tree', render: (val, row) => (
      <button className="btn btn-ghost btn-sm btn-link" onClick={() => handleViewTree(row)}>
        {val || '—'}
      </button>
    )},
    { key: 'group', label: 'Group' },
    { key: 'site', label: 'Site' },
    { key: 'plot_id', label: 'Plot' },
    { key: 'diameter', label: 'DBH (cm)', render: (val) => val ? Number(val).toFixed(2) : '—' },
    { key: 'height', label: 'Height', render: (val) => val > 0 ? `${Number(val).toFixed(2)} m` : 'Not Available' },
    { key: 'AGB', label: 'Dataset AGB', render: (val) => val != null ? `${Number(val).toFixed(2)} kg` : '—' },
    { key: 'carbon', label: 'Carbon', render: (val) => val != null ? `${Number(val).toFixed(2)} kg` : '—' },
    { key: 'actions', label: 'Actions', width: 180, render: (_, row) => (
      <div className="actions-flex">
        <button className="btn btn-ghost btn-sm" onClick={() => handleViewTree(row)}>View</button>
        <button className="btn btn-ghost btn-sm btn-edit" onClick={() => handleEdit(row)}>Edit</button>
        <button className="btn btn-ghost btn-sm btn-delete" onClick={() => handleDeleteClick(row)}>Delete</button>
        <button className="btn btn-ghost btn-sm btn-ai-link" onClick={() => handleViewTree(row)}>AI Predict</button>
      </div>
    )}
  ];

  return (
    <div className="tree-inventory">
      <PageHeader
        title="Tree Inventory"
        subtitle="Search campus trees and estimate biomass using the trained AI model."
        actions={
          <div className="actions-flex">
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Add Tree</button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>Export CSV</button>
          </div>
        }
      />

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Trees" value={(stats.totalTrees || 0).toLocaleString()} />
          <StatCard label="Average DBH" value={`${stats.averageDbh || 0} cm`} />
          <StatCard label="Average Height" value={`${stats.averageHeight || 0} m`} />
          <StatCard label="Total AGB" value={`${(stats.totalBiomass || 0).toLocaleString()} kg`} />
          <StatCard label="Estimated Carbon" value={`${(stats.totalCarbon || 0).toLocaleString()} kg`} />
        </div>
      )}

      <SearchToolbar
        search={{ value: search, placeholder: 'Search tree name, species, group, site, plot ID...' }}
        onSearchChange={handleSearchChange}
        onSearch={() => setPage(1)}
        filters={[
          { name: 'site', label: 'Site', placeholder: 'All Sites', options: sites, value: siteFilter },
          { name: 'plot', label: 'Plot', placeholder: 'All Plots', options: plots, value: plotFilter }
        ]}
        onFilterChange={(name, value) => {
          if (name === 'site') setSiteFilter(value);
          if (name === 'plot') setPlotFilter(value);
          setPage(1);
        }}
        onClear={handleClear}
      />

      <div className="info-text">
        Showing {trees.length} of {totalTrees.toLocaleString()} trees
      </div>

      <DataTable
        columns={columns}
        data={trees}
        loading={loading}
        emptyTitle="No trees found"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={totalTrees}
        limit={limit}
        onPageChange={setPage}
      />

      {drawerOpen && (
        <div className="drawer-overlay" onClick={handleCloseDrawer}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer__header">
              <h3 className="drawer__title">Tree Details</h3>
              <button className="drawer__close" onClick={handleCloseDrawer} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="drawer__body">
              {selectedTree && (
                <>
                  <div className="detail-grid">
                    <div className="detail-row">
                      <span className="detail-row__label">Tree Name</span>
                      <span className="detail-row__value">{selectedTree.name || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Tree ID</span>
                      <span className="detail-row__value font-mono-lite">{selectedTree._id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Species / Group</span>
                      <span className="detail-row__value">{selectedTree.group || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Site</span>
                      <span className="detail-row__value">{selectedTree.site || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Plot</span>
                      <span className="detail-row__value">{selectedTree.plot_id || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Diameter / DBH</span>
                      <span className="detail-row__value">{selectedTree.diameter ? `${Number(selectedTree.diameter).toFixed(2)} cm` : '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Height</span>
                      <span className="detail-row__value">
                        {selectedTree.height > 0 ? `${Number(selectedTree.height).toFixed(2)} m` : 'Not Available'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Year</span>
                      <span className="detail-row__value">{selectedTree.year || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Dataset AGB</span>
                      <span className="detail-row__value">{selectedTree.AGB != null ? `${Number(selectedTree.AGB).toFixed(2)} kg` : '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Dataset Carbon</span>
                      <span className="detail-row__value">{selectedTree.carbon != null ? `${Number(selectedTree.carbon).toFixed(2)} kg` : '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Latitude</span>
                      <span className="detail-row__value">{selectedTree.lat || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-row__label">Longitude</span>
                      <span className="detail-row__value">{selectedTree.lon || '—'}</span>
                    </div>
                  </div>

                  {selectedTree.height <= 0 && (
                    <div className="warning-banner mt-3">
                      <svg className="warning-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Height data is unavailable for this tree. The AGB prediction may be less reliable.</span>
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      className="btn btn-ai w-full"
                      onClick={handlePredictAGB}
                      disabled={predicting}
                    >
                      {predicting ? 'Running CatBoost prediction...' : 'Predict AGB with AI'}
                    </button>
                  </div>

                  {prediction && !prediction.error && (
                    <PredictionResult
                      title="AI Biomass Estimation"
                      value={`${Number(prediction.prediction?.prediction).toFixed(4)} kg`}
                      carbonValue={prediction.prediction?.prediction * 0.47}
                      carbonNote="Estimated Carbon = AGB × 0.47"
                      modelInfo={
                        <div>
                          <div>Model: CatBoost Regression</div>
                          <div>Test R²: 0.9959</div>
                          <div>MAE: 0.0764</div>
                          <div>RMSE: 0.1358</div>
                        </div>
                      }
                      inputFeatures={[
                        { label: 'Diameter', value: `${Number(selectedTree.diameter || 0).toFixed(2)} cm` },
                        { label: 'Height', value: selectedTree.height > 0 ? `${Number(selectedTree.height).toFixed(2)} m` : 'Not Available' },
                        { label: 'Year', value: selectedTree.year || '—' },
                        { label: 'Group', value: selectedTree.group || 'N/A' },
                        { label: 'Site', value: selectedTree.site || 'N/A' }
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

      {deleteConfirm && (
        <ConfirmModal
          title="Delete Tree"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {showForm && (
        <TreeForm
          tree={editingTree}
          onSave={handleFormSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTree(null);
          }}
        />
      )}
    </div>
  );
}

export default TreeInventory;
