import ManualPredictionChart from './ManualPredictionChart';
import TreeRecommendations from './TreeRecommendations';

function ManualPredictionResult({ agb, carbon, formData, model = 'CatBoostRegressor', modelVersion = 'catboost-v1' }) {
  if (agb == null) return null;

  const numAgb = Number(agb);
  const numCarbon = Number(carbon != null ? carbon : numAgb * 0.47);

  return (
    <div className="manual-pred-result-section">
      {/* 1. Two Executive Statistic Cards */}
      <div className="manual-pred-stats-grid">
        <div className="manual-pred-stat-card manual-pred-stat-card--agb">
          <div className="manual-pred-stat-card__top">
            <div className="manual-pred-stat-card__icon-wrapper">
              <svg className="manual-pred-stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="manual-pred-stat-card__badge">CatBoost Output</span>
          </div>

          <div className="manual-pred-stat-card__content">
            <span className="manual-pred-stat-card__label">Predicted Above-Ground Biomass</span>
            <div className="manual-pred-stat-card__value-group">
              <span className="manual-pred-stat-card__num">{numAgb.toFixed(2)}</span>
              <span className="manual-pred-stat-card__unit">kg</span>
            </div>
            <div className="manual-pred-stat-card__footer">
              <span>Target: Total dry tree biomass</span>
            </div>
          </div>
        </div>

        <div className="manual-pred-stat-card manual-pred-stat-card--carbon">
          <div className="manual-pred-stat-card__top">
            <div className="manual-pred-stat-card__icon-wrapper">
              <svg className="manual-pred-stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="manual-pred-stat-card__badge manual-pred-stat-card__badge--carbon">Carbon Stock</span>
          </div>

          <div className="manual-pred-stat-card__content">
            <span className="manual-pred-stat-card__label">Estimated Carbon Stock</span>
            <div className="manual-pred-stat-card__value-group">
              <span className="manual-pred-stat-card__num">{numCarbon.toFixed(2)}</span>
              <span className="manual-pred-stat-card__unit">kg</span>
            </div>
            <div className="manual-pred-stat-card__footer">
              <span>Formula: Carbon = AGB × 0.47</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Graph: AGB vs Carbon */}
      <div className="manual-pred-chart-wrapper">
        <ManualPredictionChart agb={numAgb} carbon={numCarbon} unit="kg" carbonUnit="kg" />
      </div>

      {/* 3. Input Summary & Model Meta */}
      <div className="manual-pred-meta-card">
        <div className="manual-pred-meta-card__header">
          <div className="manual-pred-meta-card__title-group">
            <svg className="manual-pred-meta-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <h4 className="manual-pred-meta-card__title">Prediction Parameters &amp; Model Details</h4>
          </div>
          <span className="manual-pred-meta-card__version">{model} ({modelVersion})</span>
        </div>

        {formData && (
          <div className="manual-pred-inputs-grid">
            <div className="manual-pred-input-chip">
              <span className="manual-pred-input-chip__label">Diameter (DBH)</span>
              <span className="manual-pred-input-chip__value">{formData.diameter} cm</span>
            </div>
            <div className="manual-pred-input-chip">
              <span className="manual-pred-input-chip__label">Tree Height</span>
              <span className="manual-pred-input-chip__value">{formData.height} m</span>
            </div>
            <div className="manual-pred-input-chip">
              <span className="manual-pred-input-chip__label">Year</span>
              <span className="manual-pred-input-chip__value">{formData.year}</span>
            </div>
            <div className="manual-pred-input-chip">
              <span className="manual-pred-input-chip__label">Tree Group</span>
              <span className="manual-pred-input-chip__value">{formData.group}</span>
            </div>
            <div className="manual-pred-input-chip manual-pred-input-chip--site">
              <span className="manual-pred-input-chip__label">Site</span>
              <span className="manual-pred-input-chip__value">{formData.site}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Intelligent Tree Species Recommendations for AGB Optimization */}
      <TreeRecommendations agb={numAgb} site={formData?.site} group={formData?.group} />
    </div>
  );
}

export default ManualPredictionResult;
