import ImagePredictionChart from './ImagePredictionChart';
import TreeRecommendations from './TreeRecommendations';

function ImagePredictionResult({
  agb,
  carbon,
  model = 'EfficientNet-B0',
  modelVersion = 'efficientnet-b0-v1',
  confidence = null,
  uncertainty = null,
  metrics = null,
}) {
  if (agb == null) return null;

  const numAgb = Number(agb);
  const numCarbon = Number(carbon != null ? carbon : numAgb * 0.47);

  return (
    <div className="image-pred-result-section">
      {/* 1. Result Summary: Two Professional Statistic Cards */}
      <div className="image-pred-stats-grid">
        <div className="image-pred-stat-card image-pred-stat-card--agb">
          <div className="image-pred-stat-card__top">
            <div className="image-pred-stat-card__icon-wrapper">
              <svg className="image-pred-stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="image-pred-stat-card__badge">Live Prediction</span>
          </div>

          <div className="image-pred-stat-card__content">
            <span className="image-pred-stat-card__label">Above Ground Biomass</span>
            <div className="image-pred-stat-card__value-group">
              <span className="image-pred-stat-card__num">{numAgb.toFixed(2)}</span>
              <span className="image-pred-stat-card__unit">kg/tree</span>
            </div>
            <div className="image-pred-stat-card__footer">
              <span>Target: AGB per individual tree</span>
            </div>
          </div>
        </div>

        <div className="image-pred-stat-card image-pred-stat-card--carbon">
          <div className="image-pred-stat-card__top">
            <div className="image-pred-stat-card__icon-wrapper">
              <svg className="image-pred-stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="image-pred-stat-card__badge image-pred-stat-card__badge--carbon">Carbon Stock</span>
          </div>

          <div className="image-pred-stat-card__content">
            <span className="image-pred-stat-card__label">Carbon Stock</span>
            <div className="image-pred-stat-card__value-group">
              <span className="image-pred-stat-card__num">{numCarbon.toFixed(2)}</span>
              <span className="image-pred-stat-card__unit">kg C/tree</span>
            </div>
            <div className="image-pred-stat-card__footer">
              <span>Formula: Carbon = AGB × 0.47</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Graph: AGB vs Carbon */}
      <div className="image-pred-chart-wrapper">
        <ImagePredictionChart agb={numAgb} carbon={numCarbon} />
      </div>

      {/* 3. Prediction Confidence / Model Information */}
      <div className="image-pred-model-card">
        <div className="image-pred-model-card__header">
          <div className="image-pred-model-card__title-group">
            <svg className="image-pred-model-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h4 className="image-pred-model-card__title">Model Information</h4>
          </div>
          <span className="image-pred-model-card__version">{modelVersion}</span>
        </div>

        <div className="image-pred-model-grid">
          <div className="image-pred-model-item">
            <span className="image-pred-model-item__label">Model</span>
            <span className="image-pred-model-item__value">{model}</span>
          </div>

          <div className="image-pred-model-item">
            <span className="image-pred-model-item__label">Prediction Type</span>
            <span className="image-pred-model-item__value">Image-based AGB</span>
          </div>

          <div className="image-pred-model-item">
            <span className="image-pred-model-item__label">Target</span>
            <span className="image-pred-model-item__value">AGB (kg/tree)</span>
          </div>

          {/* Only display confidence/uncertainty if provided by API */}
          {confidence != null && (
            <div className="image-pred-model-item">
              <span className="image-pred-model-item__label">Confidence</span>
              <span className="image-pred-model-item__value">{confidence}%</span>
            </div>
          )}

          {uncertainty != null && (
            <div className="image-pred-model-item">
              <span className="image-pred-model-item__label">Uncertainty</span>
              <span className="image-pred-model-item__value">&plusmn;{uncertainty}</span>
            </div>
          )}

          <div className="image-pred-model-item">
            <span className="image-pred-model-item__label">Input Specification</span>
            <span className="image-pred-model-item__value">224×224 RGB Image Pixels</span>
          </div>

          <div className="image-pred-model-item">
            <span className="image-pred-model-item__label">Carbon Conversion</span>
            <span className="image-pred-model-item__value">Carbon = AGB × 0.47 (kg C/tree)</span>
          </div>
        </div>

        {/* Real Training Metrics if available from backend model info */}
        {metrics && (metrics.r2 || metrics.mae || metrics.rmse) && (
          <div className="image-pred-metrics-strip">
            <span className="image-pred-metrics-strip__title">Validation Benchmark:</span>
            {metrics.r2 && (
              <span className="image-pred-metrics-tag">
                R&sup2;: <strong>{metrics.r2}</strong>
              </span>
            )}
            {metrics.mae && (
              <span className="image-pred-metrics-tag">
                MAE: <strong>{metrics.mae}</strong>
              </span>
            )}
            {metrics.rmse && (
              <span className="image-pred-metrics-tag">
                RMSE: <strong>{metrics.rmse}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Intelligent Tree Species Recommendations for AGB Enhancement */}
      <TreeRecommendations agb={numAgb} />
    </div>
  );
}

export default ImagePredictionResult;
