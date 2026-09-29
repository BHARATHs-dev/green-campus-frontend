function ModelPerformanceCard({ title, metrics }) {
  return (
    <div className="model-card">
      <div className="model-card__title">{title}</div>
      <div className="model-card__metrics">
        {metrics.map((m) => (
          <div key={m.label} className="model-card__metric">
            <span className="model-card__metric-label">{m.label}</span>
            <span className="model-card__metric-value">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModelPerformanceCard;
