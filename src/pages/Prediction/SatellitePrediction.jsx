import { useState, useEffect } from 'react';
import { predictSatelliteAGB, getSatelliteModelInfo } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import SatelliteUpload from '../../components/prediction/SatelliteUpload';
import PredictionResult from '../../components/prediction/PredictionResult';
import ModelInfo from '../../components/prediction/ModelInfo';
import TreeRecommendations from '../../components/prediction/TreeRecommendations';
import './Prediction.css';

function SatellitePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [modelInfo, setModelInfo] = useState(null);
  const [modelInfoLoading, setModelInfoLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadModelInfo() {
      try {
        const response = await getSatelliteModelInfo();
        if (!cancelled && response.data) {
          setModelInfo(response.data);
          setModelReady(response.data.success && response.data.status === 'ready');
        }
      } catch (err) {
        console.warn('Could not load satellite model info:', err.message);
      } finally {
        if (!cancelled) setModelInfoLoading(false);
      }
    }
    loadModelInfo();
    return () => { cancelled = true; };
  }, []);

  const handleUpload = async (file) => {
    setApiError('');
    setPrediction(null);
    setUploadSuccess('');

    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await predictSatelliteAGB(formData);
      const resultData = response.data?.data || response.data;
      setPrediction(resultData);
    } catch (err) {
      console.error('Upload error:', err);
      const detail = err.response?.data?.detail;

      if (err.response?.status === 503 && detail?.code === 'SATELLITE_MODEL_NOT_TRAINED') {
        setUploadSuccess(
          'Image uploaded successfully. Satellite biomass prediction requires multispectral Sentinel-2 input and a trained Satellite CNN model.'
        );
        return;
      }

      let message = 'Satellite image validation failed. Please try again.';

      if (!err.response) {
        message = 'Unable to connect to the backend server. Please ensure the server is running on port 5000.';
      } else if (detail && typeof detail === 'object') {
        message = detail.message || message;
      } else if (typeof detail === 'string') {
        message = detail;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      }

      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const agbValue =
    prediction?.agbd ??
    prediction?.agb ??
    prediction?.prediction ??
    prediction?.data?.agbd ??
    prediction?.data?.agb;
  const carbonValue =
    prediction?.carbon ??
    prediction?.data?.carbon ??
    (agbValue != null ? agbValue * 0.47 : null);

  const displayMetrics = () => {
    if (modelInfoLoading) return null;
    if (modelInfo && modelInfo.metrics) {
      const m = modelInfo.metrics;
      return {
        r2: typeof m.r2 === 'number' ? m.r2.toFixed(4) : m.r2,
        mae: typeof m.mae === 'number' ? `${m.mae.toFixed(4)} Mg/ha` : `${m.mae} Mg/ha`,
        rmse: typeof m.rmse === 'number' ? `${m.rmse.toFixed(4)} Mg/ha` : `${m.rmse} Mg/ha`,
      };
    }
    return { r2: 'Pending', mae: 'Pending', rmse: 'Pending' };
  };

  const metrics = displayMetrics();

  return (
    <div className="prediction-page">
      <PageHeader
        title="Satellite Biomass Prediction"
        subtitle="Upload multispectral satellite imagery to estimate above-ground biomass density (AGBD)."
      />

      <div className="prediction-grid">
        <div className="prediction-card">
          <div className="prediction-card__header">
            <h3 className="prediction-card__title">Upload Satellite Image</h3>
            {!modelInfoLoading && !modelReady && (
              <span className="status-badge status-badge--warning">
                <span className="status-badge__dot" />
                <span className="status-badge__label">MODEL TRAINING PENDING</span>
              </span>
            )}
            {!modelInfoLoading && modelReady && (
              <span className="status-badge status-badge--prototype">
                <span className="status-badge__dot" />
                <span className="status-badge__label">PROTOTYPE</span>
              </span>
            )}
          </div>
          <p className="prediction-card__subtitle">
            Supported formats: GeoTIFF (.tif, .tiff) or standard satellite / aerial images (.jpg, .jpeg, .png, .webp).
          </p>

          <SatelliteUpload onUpload={handleUpload} loading={loading} />

          {modelReady && modelInfo?.note && (
            <div className="card card--warning mt-3">
              <div className="card__body">
                <p className="disclaimer-text">
                  <strong>Prototype model:</strong> {modelInfo.note}
                </p>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="card card--info mt-3">
              <div className="card__body">
                <p className="disclaimer-text">{uploadSuccess}</p>
              </div>
            </div>
          )}

          {apiError && (
            <div className="card card--error mt-3">
              <div className="card__body">
                <div className="error-state">
                  <svg className="error-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {prediction && (
            <div className="mt-3">
              <PredictionResult
                agb={agbValue}
                carbon={carbonValue}
                model={prediction.model || prediction.data?.model || 'Satellite CNN'}
                modelVersion={prediction.modelVersion || prediction.data?.modelVersion || 'satellite-cnn-prototype-v1'}
                unit={prediction.agbd_unit || prediction.unit || prediction.data?.agbd_unit || 'Mg/ha'}
                carbonUnit={prediction.carbon_unit || prediction.data?.carbon_unit || 'Mg C/ha'}
                status={prediction.status || prediction.data?.status || 'Prototype'}
                metadata={prediction.metadata || prediction.data?.metadata}
                selectedBands={prediction.selected_bands || prediction.data?.selected_bands}
                inChannels={prediction.in_channels || prediction.data?.in_channels}
              />
              <div className="mt-3">
                <TreeRecommendations
                  agb={agbValue}
                  unit={prediction.agbd_unit || prediction.unit || 'Mg/ha'}
                  isDensity={true}
                  predictionType="satellite"
                />
              </div>
            </div>
          )}
        </div>

        <div className="prediction-card">
          <ModelInfo
            algorithm={modelInfo?.architecture || 'Satellite CNN (multispectral regression)'}
            purpose="Above-Ground Biomass Density Estimation from Satellite Imagery"
            dataset={modelInfo?.bands ? `Multispectral (${modelInfo.bands.join(', ')})` : 'Sentinel-2 / Multispectral'}
            features="Spectral bands + vegetation indices (NDVI, EVI, SAVI, NDWI, MSI)"
            target="AGBD (Mg/ha)"
            metrics={metrics}
            datasetInfo={modelInfo?.dataset ? {
              total: modelInfo.dataset.total,
              train: modelInfo.dataset.train,
              validation: modelInfo.dataset.validation,
              test: modelInfo.dataset.test,
            } : null}
          />
        </div>
      </div>
    </div>
  );
}

export default SatellitePrediction;
