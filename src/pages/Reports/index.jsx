import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ModelPerformanceCard from '../../components/common/ModelPerformanceCard';
import './Reports.css';

function Reports() {
  const [reportType, setReportType] = useState('green-campus');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/summary');
        setSummary(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to fetch report summary:', err);
      }
    };
    fetchSummary();
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');

      if (reportType === 'green-campus') {
        if (format === 'pdf') {
          const res = await api.get('/reports/generate/pdf', { responseType: 'blob' });
          const blob = new Blob([res.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `green_campus_report_${Date.now()}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else if (format === 'excel') {
          const res = await api.get('/reports/generate/excel', { responseType: 'blob' });
          const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `green_campus_report_${Date.now()}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          setError('JSON preview is not available for the Green Campus Report. Please select PDF or Excel.');
        }
        return;
      }

      const url = `/reports/${reportType}?format=${format}`;
      const response = await api.get(url, {
        responseType: format === 'json' ? 'json' : 'blob',
      });

      if (format === 'json') {
        setSummary(response.data);
      } else {
        const blob = new Blob([response.data], {
          type: format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : format === 'pdf'
              ? 'application/pdf'
              : 'text/csv',
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `report_${Date.now()}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Report generation failed:', err);
      setError('Error generating report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'green-campus', title: 'Green Campus Report', description: 'Comprehensive project report with all modules, AI performance, and data quality', formats: ['PDF', 'Excel'] },
    { id: 'dashboard', title: 'Dashboard Summary', description: 'Project overview with total trees, biomass, carbon, NDVI, and regions', formats: ['JSON', 'CSV', 'Excel', 'PDF'] },
    { id: 'biomass', title: 'Biomass Report', description: 'Biomass breakdown by site and year', formats: ['JSON', 'CSV', 'Excel', 'PDF'] },
    { id: 'carbon', title: 'Carbon Report', description: 'Carbon stock by site and region with CO₂ equivalent', formats: ['JSON', 'CSV', 'Excel', 'PDF'] },
    { id: 'vegetation', title: 'Vegetation Report', description: 'Vegetation samples by region, degradation level, and land cover', formats: ['JSON', 'CSV', 'Excel', 'PDF'] }
  ];

  return (
    <div className="reports">
      <PageHeader
        title="Green Campus Reports"
        subtitle="Generate and download project reports."
      />

      <div className="report-config-card">
          <div className="report-config-row">
            <div className="form-group form-group--flex">
              <label className="form-group-label">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="form-select">
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group form-group--fixed">
              <label className="form-group-label">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="form-select">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="json">JSON Preview</option>
              </select>
            </div>
            <div className="report-config__actions">
              <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        {error && <div className="auth-error mt-3">{error}</div>}
      </div>

      {reportType === 'green-campus' && summary && (
        <div className="report-preview-card">
          <h3 className="report-preview-title">Green Campus Report Preview</h3>
          <div className="report-preview-section">
            <h4 className="report-preview-heading">Includes</h4>
            <ul className="report-preview-list">
              <li>Tree Inventory</li>
              <li>Biomass Analysis</li>
              <li>Carbon Estimation</li>
              <li>Vegetation Analysis</li>
              <li>GIS Summary</li>
              <li>AI Model Performance</li>
              <li>Prediction History</li>
              <li>Data Quality & Limitations</li>
            </ul>
          </div>
          <div className="report-preview-section">
            <h4 className="report-preview-heading">Executive Summary</h4>
            <div className="summary-grid">
              {[
                { label: 'Field Records', value: summary.fieldData?.totalRecords?.toLocaleString() || 0 },
                { label: 'Vegetation Samples', value: summary.vegetation?.totalSamples?.toLocaleString() || 0 },
                { label: 'Total AGB', value: `${summary.fieldData?.totalAGB?.toLocaleString() || 0} kg` },
                { label: 'Estimated Carbon', value: `${summary.fieldData?.estimatedCarbon?.toLocaleString() || 0} kg` },
                { label: 'Healthy', value: summary.vegetation?.healthy?.toLocaleString() || 0 },
                { label: 'Moderately Degraded', value: summary.vegetation?.moderatelyDegraded?.toLocaleString() || 0 },
                { label: 'Severely Degraded', value: summary.vegetation?.severelyDegraded?.toLocaleString() || 0 },
                { label: 'Average NDVI', value: summary.vegetation?.averageNDVI || 0 }
              ].map((item) => (
                <div key={item.label} className="summary-item">
                  <span className="summary-item__label">{item.label}</span>
                  <span className="summary-item__value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="report-preview-section">
            <h4 className="report-preview-heading">AI Model Performance</h4>
            <div className="model-grid">
              <ModelPerformanceCard
                title="AGB CatBoost"
                metrics={[
                  { label: 'Test R²', value: summary.ai?.agb?.testR2 || 0 },
                  { label: 'MAE', value: summary.ai?.agb?.testMAE || 0 },
                  { label: 'RMSE', value: summary.ai?.agb?.testRMSE || 0 }
                ]}
              />
              <ModelPerformanceCard
                title="Degradation CatBoost"
                metrics={[
                  { label: 'Accuracy', value: summary.ai?.degradation?.accuracy || '0%' },
                  { label: 'Macro F1', value: summary.ai?.degradation?.macroF1 || 0 }
                ]}
              />
            </div>
          </div>
          <div className="report-preview-section">
            <h4 className="report-preview-heading">Data Quality</h4>
            <div className="data-quality-grid">
              <div className="data-quality-item">
                <span className="data-quality-item__label">Diameter available</span>
                <span className="data-quality-item__value">{summary.fieldData?.diameterAvailable || 0} / {summary.fieldData?.totalRecords || 0}</span>
              </div>
              <div className="data-quality-item">
                <span className="data-quality-item__label">Height available</span>
                <span className="data-quality-item__value">{summary.fieldData?.heightAvailable || 0} / {summary.fieldData?.totalRecords || 0}</span>
              </div>
              <div className="data-quality-item">
                <span className="data-quality-item__label">Vegetation coordinates</span>
                <span className="data-quality-item__value">{summary.gis?.vegetationCoordinates || 0} / {summary.gis?.vegetationTotal || 0}</span>
              </div>
              <div className="data-quality-item">
                <span className="data-quality-item__label">Tree coordinates</span>
                <span className="data-quality-item__value">{summary.gis?.treeCoordinates || 0} / {summary.gis?.treeTotal || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="report-catalog">
        <h3 className="report-catalog__title">Available Reports</h3>
        <div className="report-grid">
          {reports.map((r) => (
            <div
              key={r.id}
              className={`report-card ${reportType === r.id ? 'report-card--selected' : ''}`}
              onClick={() => setReportType(r.id)}
            >
              <div className="report-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="report-card__title">{r.title}</div>
              <div className="report-card__description">{r.description}</div>
              <div className="report-card__formats">
                {r.formats.map((f) => (
                  <span key={f} className="format-badge">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;
