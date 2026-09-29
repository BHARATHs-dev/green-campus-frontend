function PredictionResult({ title, value, unit, carbonValue, carbonNote, modelInfo, inputFeatures, warning }) {
  return (
    <div className="prediction-result">
      <div className="prediction-result__title">{title}</div>
      <div className="prediction-result__value">{value}</div>
      {unit && <div className="prediction-result__unit">{unit}</div>}

      {warning && (
        <div className="warning-banner mt-3">
          <svg className="warning-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{warning}</span>
        </div>
      )}

      {carbonValue != null && (
        <div className="prediction-result__carbon">
          <div className="prediction-result__carbon-row">
            <span>Estimated Carbon</span>
            <span className="prediction-result__carbon-value">{carbonValue.toFixed(4)} kg</span>
          </div>
          {carbonNote && <div className="prediction-result__carbon-note">{carbonNote}</div>}
        </div>
      )}

      {modelInfo && (
        <div className="prediction-result__model">
          <div className="prediction-result__model-label">Model</div>
          <div className="prediction-result__model-grid">{modelInfo}</div>
        </div>
      )}

      {inputFeatures && (
        <div className="prediction-result__features">
          <div className="prediction-result__model-label">Input Features</div>
          <div className="prediction-result__features-grid">
            {inputFeatures.map((f) => (
              <div key={f.label} className="prediction-result__feature-row">
                <span>{f.label}</span>
                <span className="font-mono-lite">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionResult;
