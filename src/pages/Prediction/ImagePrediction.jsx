import { useState, useEffect } from 'react';
import { predictImageAGB, getImageModelInfo } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ImageUpload from '../../components/prediction/ImageUpload';
import ImagePredictionResult from '../../components/prediction/ImagePredictionResult';
import './Prediction.css';

const CARBON_FRACTION = 0.47;

function ImagePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [modelInfo, setModelInfo] = useState(null);
  const [modelInfoLoading, setModelInfoLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadModelInfo() {
      try {
        const response = await getImageModelInfo();
        if (!cancelled && response.data) {
          setModelInfo(response.data);
        }
      } catch (err) {
        console.warn('Could not load image model info:', err.message);
      } finally {
        if (!cancelled) setModelInfoLoading(false);
      }
    }
    loadModelInfo();
    return () => { cancelled = true; };
  }, []);

  const handlePredict = async (file) => {
    setApiError('');
    setPrediction(null);

    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await predictImageAGB(formData);
      setPrediction(response.data.data);
    } catch (err) {
      console.error('Prediction error:', err);
      const detail = err.response?.data?.detail;
      let message = 'Image prediction failed. Please try again.';

      if (detail && typeof detail === 'object') {
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

  const handleClear = () => {
    setPrediction(null);
    setApiError('');
  };

  const handleFileSelected = () => {
    setPrediction(null);
    setApiError('');
  };

  const agbValue = prediction?.agb ?? prediction?.prediction;
  const carbonValue = prediction?.carbon ?? (agbValue != null ? agbValue * CARBON_FRACTION : null);

  const getModelLabel = () => {
    if (!prediction) return 'EfficientNet-B0';
    return prediction.model || 'EfficientNet-B0';
  };

  const getModelVersion = () => {
    return prediction?.modelVersion || modelInfo?.modelVersion || 'efficientnet-b0-v1';
  };

  const displayMetrics = () => {
    if (modelInfoLoading) return null;
    if (modelInfo && modelInfo.success && modelInfo.metrics) {
      const m = modelInfo.metrics;
      return {
        r2: typeof m.r2 === 'number' ? m.r2.toFixed(4) : (m.r2 !== 'pending' && m.r2 !== 'Pending' ? m.r2 : null),
        mae: typeof m.mae === 'number' ? `${m.mae.toFixed(4)} kg` : (m.mae !== 'pending' && m.mae !== 'Pending' ? `${m.mae} kg` : null),
        rmse: typeof m.rmse === 'number' ? `${m.rmse.toFixed(4)} kg` : (m.rmse !== 'pending' && m.rmse !== 'Pending' ? `${m.rmse} kg` : null),
      };
    }
    return null;
  };

  const metrics = displayMetrics();

  return (
    <div className="prediction-page image-prediction-page">
      <PageHeader
        title="Image Prediction"
        subtitle="Estimate Above-Ground Biomass and carbon stock using uploaded tree or canopy images."
      />

      <div className="image-prediction-layout">
        {/* Step 1: Upload & Image Preview */}
        <div className="prediction-card image-prediction-card">
          <div className="prediction-card__header">
            <div>
              <h3 className="prediction-card__title">Upload Tree / Canopy Image</h3>
              <p className="prediction-card__subtitle">
                Upload a clear RGB tree image for EfficientNet-B0 biomass estimation.
              </p>
            </div>
            <span className="status-badge status-badge--success">
              <span className="status-badge__dot" />
              CNN Ready
            </span>
          </div>

          <ImageUpload
            onPredict={handlePredict}
            loading={loading}
            onClear={handleClear}
            onFileSelected={handleFileSelected}
          />
        </div>

        {/* Step 2: Loading State */}
        {loading && (
          <div className="prediction-card prediction-state-card mt-3">
            <LoadingState text="Analyzing image..." />
          </div>
        )}

        {/* Step 3: Error State */}
        {apiError && (
          <div className="card card--error mt-3" role="alert">
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

        {/* Step 4: Empty State (Before prediction) */}
        {!loading && !prediction && !apiError && (
          <div className="prediction-card prediction-empty-card mt-3">
            <EmptyState
              title="Upload an image to generate biomass prediction."
              description="Drop or browse a tree image above to estimate Above Ground Biomass (kg/tree) and Carbon Stock (kg C/tree) with live graph visualization."
            />
          </div>
        )}

        {/* Step 5: Prediction Result (Summary Cards + Primary Graph + Model Info) */}
        {!loading && prediction && (
          <div className="mt-3">
            <ImagePredictionResult
              agb={agbValue}
              carbon={carbonValue}
              model={getModelLabel()}
              modelVersion={getModelVersion()}
              confidence={prediction?.confidence}
              uncertainty={prediction?.uncertainty}
              metrics={metrics}
            />
          </div>
        )}

        {/* Scientific Disclaimer */}
        <div className="card card--info mt-3">
          <div className="card__body">
            <p className="disclaimer-text">
              Image-based biomass estimation is an estimate derived from visual features
              (canopy density, trunk structure, foliage coverage) processed by EfficientNet-B0 CNN.
              Results are reported in <strong>kg/tree</strong> for Above Ground Biomass and{' '}
              <strong>kg C/tree</strong> for Carbon Stock (using the IPCC scientific carbon fraction of 0.47).
              Field measurements are recommended for permanent carbon accounting and validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImagePrediction;
