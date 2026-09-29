function ModelInfo({ algorithm, purpose, dataset, features, target, metrics, datasetInfo }) {
  return (
    <div className="model-info-container">
      <div className="card">
        <div className="card__header">
          <h3>Model Information</h3>
        </div>
        <div className="card__body">
          <div className="model-info">
            <div className="model-info__item">
              <span className="model-info__label">Algorithm</span>
              <span className="model-info__value">{algorithm}</span>
            </div>
            <div className="model-info__item">
              <span className="model-info__label">Purpose</span>
              <span className="model-info__value">{purpose}</span>
            </div>
            <div className="model-info__item">
              <span className="model-info__label">Dataset</span>
              <span className="model-info__value">{dataset}</span>
            </div>
            <div className="model-info__item">
              <span className="model-info__label">Features</span>
              <span className="model-info__value">{features}</span>
            </div>
            <div className="model-info__item">
              <span className="model-info__label">Target</span>
              <span className="model-info__value">{target}</span>
            </div>
            {datasetInfo && (
              <>
                <div className="model-info__item">
                  <span className="model-info__label">Dataset Total</span>
                  <span className="model-info__value">{datasetInfo.total} images</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Train / Val / Test</span>
                  <span className="model-info__value">
                    {datasetInfo.train} / {datasetInfo.validation} / {datasetInfo.test} images
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {metrics && (
        <div className="card mt-3">
          <div className="card__header">
            <h3>Model Performance (Test Set)</h3>
          </div>
          <div className="card__body">
            <div className="model-metrics">
              {metrics.r2 && (
                <div className="model-metrics__item">
                  <span className="model-metrics__label">R²</span>
                  <span className="model-metrics__value">{metrics.r2}</span>
                </div>
              )}
              {metrics.mae && (
                <div className="model-metrics__item">
                  <span className="model-metrics__label">MAE</span>
                  <span className="model-metrics__value">{metrics.mae}</span>
                </div>
              )}
              {metrics.rmse && (
                <div className="model-metrics__item">
                  <span className="model-metrics__label">RMSE</span>
                  <span className="model-metrics__value">{metrics.rmse}</span>
                </div>
              )}
              {(!metrics.r2 && !metrics.mae && !metrics.rmse) && (
                <div className="model-metrics__item">
                  <span className="model-metrics__label">Status</span>
                  <span className="model-metrics__value">Pending training</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card mt-3 card--warning">
        <div className="card__body">
          <p className="model-warning__text">
            Image-based biomass prediction estimates AGB from visual features
            (canopy density, trunk size, leaf coverage). Accuracy depends on image
            quality, camera angle, and species diversity in the training dataset.
            Field measurements are recommended for scientific validation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModelInfo;
