function PredictionResult({
  agb,
  carbon,
  model = 'Satellite CNN',
  modelVersion = 'satellite-cnn-prototype-v1',
  unit = 'Mg/ha',
  carbonUnit,
  status,
  metadata,
  selectedBands,
  inChannels,
}) {
  if (agb == null || isNaN(Number(agb))) return null;

  const numAgb = Number(agb);
  const numCarbon = Number(carbon != null ? carbon : numAgb * 0.47);
  const displayCarbonUnit = carbonUnit || (unit === 'kg' ? 'kg C' : 'Mg C/ha');
  const displayUnit = unit || 'Mg/ha';

  return (
    <div className="card card--result mt-3">
      <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Satellite Biomass Prediction Result</h3>
        {status && (
          <span className="status-badge status-badge--prototype">
            <span className="status-badge__dot" />
            <span className="status-badge__label">{status.toUpperCase()}</span>
          </span>
        )}
      </div>
      <div className="card__body">
        <div className="result-card">
          <div className="result-card__main">
            <div className="result-card__label">Predicted Above-Ground Biomass Density (AGBD)</div>
            <div className="result-card__value">{numAgb.toFixed(2)} {displayUnit}</div>
          </div>

          <div className="result-card__secondary">
            <div className="result-card__secondary-item">
              <span className="result-card__secondary-label">Estimated Carbon Stock Density</span>
              <span className="result-card__secondary-value">{numCarbon.toFixed(2)} {displayCarbonUnit}</span>
            </div>
            <div className="result-card__formula">Carbon Stock Density = AGBD × 0.47 (IPCC standard factor)</div>
          </div>

          <div className="result-card__model">
            <div className="result-card__model-title">Model & Inference Details</div>
            <div className="result-card__model-grid">
              <div><span>Model Architecture:</span> <strong>{model}</strong></div>
              <div><span>Checkpoint Version:</span> <strong>{modelVersion}</strong></div>
              {inChannels && <div><span>Tensor Stack:</span> <strong>{inChannels} Channels (Multispectral + Indices)</strong></div>}
              {selectedBands && selectedBands.length > 0 && (
                <div><span>Input Bands:</span> <strong>{selectedBands.join(', ')}</strong></div>
              )}
            </div>
          </div>

          {metadata && (
            <div className="result-card__inputs" style={{ marginTop: '12px' }}>
              <div className="result-card__model-title">Imagery Metadata</div>
              <div className="result-card__model-grid">
                {metadata.file && <div><span>Input File:</span> <strong>{metadata.file}</strong></div>}
                {metadata.format && <div><span>Format:</span> <strong>{metadata.format}</strong></div>}
                {metadata.dimensions && <div><span>Dimensions:</span> <strong>{metadata.dimensions[0]} × {metadata.dimensions[1]} px</strong></div>}
                {metadata.channel_names && (
                  <div><span>Feature Channels:</span> <strong>{metadata.channel_names.join(', ')}</strong></div>
                )}
                {metadata.note && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    ℹ️ {metadata.note}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionResult;
