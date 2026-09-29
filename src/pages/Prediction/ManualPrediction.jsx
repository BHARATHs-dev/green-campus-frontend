import { useState } from 'react';
import { predictAGB } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ManualPredictionResult from '../../components/prediction/ManualPredictionResult';
import './Prediction.css';

const CARBON_FRACTION = 0.47;

const SAMPLE_DATA = {
  diameter: 6.08,
  height: 2.1,
  year: 2016,
  group: 'cacao',
  site: 'Nestor Macias RGB'
};

const GROUPS = ['banana', 'cacao', 'citrus', 'fruit', 'other', 'timber'];

const SITES = [
  'Carlos Vera Arteaga RGB',
  'Carlos Vera Guevara RGB',
  'Flora Pluas RGB',
  'Leonor Aspiazu RGB',
  'Manuel Macias RGB',
  'Nestor Macias RGB'
];

const MODEL_INFO = {
  algorithm: 'CatBoost Regression',
  purpose: 'Above-Ground Biomass Estimation',
  dataset: 'Field Data',
  totalRecords: 4663,
  trainingRecords: 229,
  features: 5,
  target: 'AGB (kg)',
  r2: 0.9959,
  mae: 0.0764,
  rmse: 0.1358,
  cvR2Mean: 0.9886,
  cvR2Std: 0.0127
};

function ManualPrediction() {
  const [formData, setFormData] = useState({
    diameter: '',
    height: '',
    year: '',
    group: '',
    site: ''
  });

  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};

    if (!formData.diameter || Number(formData.diameter) <= 0) {
      newErrors.diameter = 'Diameter must be greater than 0.';
    }

    if (formData.height === '' || Number(formData.height) < 0) {
      newErrors.height = 'Height must be 0 or greater.';
    }

    if (!formData.year || Number(formData.year) < 1900 || Number(formData.year) > 2100) {
      newErrors.year = 'Please enter a valid year.';
    }

    if (!formData.group) {
      newErrors.group = 'Please select a tree group.';
    }

    if (!formData.site) {
      newErrors.site = 'Please select a site.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setPrediction(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const response = await predictAGB({
        diameter: Number(formData.diameter),
        height: Number(formData.height),
        year: Number(formData.year),
        group: formData.group,
        site: formData.site
      });
      setPrediction(response.data.data);
    } catch (err) {
      console.error('Prediction error:', err);
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'AI prediction service is currently unavailable. Please make sure the FastAPI server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_DATA);
    setErrors({});
    setPrediction(null);
    setApiError('');
  };

  const handleClear = () => {
    setFormData({
      diameter: '',
      height: '',
      year: '',
      group: '',
      site: ''
    });
    setErrors({});
    setPrediction(null);
    setApiError('');
  };

  const agbValue = prediction?.agb ?? prediction?.prediction;
  const carbonValue = prediction?.carbon ?? (agbValue != null ? (Number(agbValue) * CARBON_FRACTION) : null);

  return (
    <div className="prediction-page">
      <PageHeader
        title="Manual AGB Prediction"
        subtitle="Enter tree measurements to estimate Above-Ground Biomass and carbon stock using the CatBoost regression model."
      />

      <div className="prediction-grid">
        <div className="prediction-card">
          <div className="card">
            <div className="card__header">
              <h3>Input Measurements</h3>
              <p>Enter the tree parameters for AGB estimation.</p>
            </div>

            <form onSubmit={handleSubmit} className="manual-form">
              <div className="manual-form__grid">
                <div className="form-group">
                  <label className="form-group-label">
                    Diameter / DBH <span className="required">*</span>
                  </label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="diameter"
                      className={`form-input ${errors.diameter ? 'form-input--error' : ''}`}
                      placeholder="Example: 6.08"
                      value={formData.diameter}
                      onChange={handleChange}
                      step="0.01"
                      min="0.01"
                    />
                    <span className="input-unit">cm</span>
                  </div>
                  {errors.diameter && <span className="form-error">{errors.diameter}</span>}
                </div>

                <div className="form-group">
                  <label className="form-group-label">
                    Tree Height
                  </label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="height"
                      className={`form-input ${errors.height ? 'form-input--error' : ''}`}
                      placeholder="Example: 2.1"
                      value={formData.height}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                    />
                    <span className="input-unit">m</span>
                  </div>
                  {errors.height && <span className="form-error">{errors.height}</span>}
                  {Number(formData.height) === 0 && !errors.height && (
                    <span className="form-warning">Height is unavailable. Prediction may be less reliable.</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-group-label">
                    Year <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    className={`form-input ${errors.year ? 'form-input--error' : ''}`}
                    placeholder="Example: 2016"
                    value={formData.year}
                    onChange={handleChange}
                    min="1900"
                    max="2100"
                  />
                  {errors.year && <span className="form-error">{errors.year}</span>}
                </div>

                <div className="form-group">
                  <label className="form-group-label">
                    Tree Group <span className="required">*</span>
                  </label>
                  <select
                    name="group"
                    className={`form-select ${errors.group ? 'form-input--error' : ''}`}
                    value={formData.group}
                    onChange={handleChange}
                  >
                    <option value="">Select group</option>
                    {GROUPS.map(g => (
                      <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                  {errors.group && <span className="form-error">{errors.group}</span>}
                </div>

                <div className="form-group form-group--full">
                  <label className="form-group-label">
                    Site <span className="required">*</span>
                  </label>
                  <select
                    name="site"
                    className={`form-select ${errors.site ? 'form-input--error' : ''}`}
                    value={formData.site}
                    onChange={handleChange}
                  >
                    <option value="">Select site</option>
                    {SITES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.site && <span className="form-error">{errors.site}</span>}
                </div>
              </div>

              <div className="manual-form__actions">
                <button
                  type="submit"
                  className="btn btn-ai"
                  disabled={loading}
                >
                  {loading ? 'Predicting...' : 'Predict AGB with CatBoost'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleLoadSample}
                >
                  Use Sample Data
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClear}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>

          {apiError && (
            <div className="card card--error">
              <div className="card__body">
                <div className="error-state">
                  <svg className="error-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{apiError}</p>
                  <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Retry</button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="card manual-pred-state-card">
              <div className="card__body">
                <LoadingState text="Calculating Above-Ground Biomass with CatBoost model..." />
              </div>
            </div>
          )}

          {!loading && !prediction && !apiError && (
            <div className="card manual-pred-empty-card">
              <div className="card__body">
                <EmptyState
                  title="Ready for Manual Biomass Prediction"
                  description="Enter tree measurements above and click 'Predict AGB with CatBoost' or 'Use Sample Data' to generate biomass predictions and comparative graphs."
                />
              </div>
            </div>
          )}

          {!loading && prediction && (
            <ManualPredictionResult
              agb={agbValue}
              carbon={carbonValue}
              formData={formData}
              model={prediction?.model || 'CatBoostRegressor'}
              modelVersion={prediction?.model_version || prediction?.modelVersion || 'catboost-v1'}
            />
          )}
        </div>

        <div className="prediction-card">
          <div className="card">
            <div className="card__header">
              <h3>Model Information</h3>
            </div>
            <div className="card__body">
              <div className="model-info">
                <div className="model-info__item">
                  <span className="model-info__label">Algorithm</span>
                  <span className="model-info__value">{MODEL_INFO.algorithm}</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Purpose</span>
                  <span className="model-info__value">{MODEL_INFO.purpose}</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Dataset</span>
                  <span className="model-info__value">{MODEL_INFO.dataset}</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Total Records</span>
                  <span className="model-info__value">{MODEL_INFO.totalRecords.toLocaleString()}</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Training Records</span>
                  <span className="model-info__value">{MODEL_INFO.trainingRecords}</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Features</span>
                  <span className="model-info__value">{MODEL_INFO.features}</span>
                </div>
                <div className="model-info__item">
                  <span className="model-info__label">Target</span>
                  <span className="model-info__value">{MODEL_INFO.target}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card__header">
              <h3>Model Performance</h3>
            </div>
            <div className="card__body">
              <div className="model-metrics">
                <div className="model-metrics__item">
                  <span className="model-metrics__label">R²</span>
                  <span className="model-metrics__value">{MODEL_INFO.r2}</span>
                </div>
                <div className="model-metrics__item">
                  <span className="model-metrics__label">MAE</span>
                  <span className="model-metrics__value">{MODEL_INFO.mae} kg</span>
                </div>
                <div className="model-metrics__item">
                  <span className="model-metrics__label">RMSE</span>
                  <span className="model-metrics__value">{MODEL_INFO.rmse} kg</span>
                </div>
                <div className="model-metrics__item">
                  <span className="model-metrics__label">5-Fold CV R²</span>
                  <span className="model-metrics__value">{MODEL_INFO.cvR2Mean} ± {MODEL_INFO.cvR2Std}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card card--warning mt-3">
            <div className="card__header">
              <h3>Model Interpretation</h3>
            </div>
            <div className="card__body">
              <p className="model-warning__text">
                The current AGB target is strongly derived from diameter. Therefore, the high model performance should be interpreted in the context of the target-generation methodology and does not represent independent real-world biomass validation.
              </p>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card__header">
              <h3>Quick Test</h3>
              <p>Use the sample below to verify the complete React → Node.js → FastAPI → CatBoost prediction pipeline.</p>
            </div>
            <div className="card__body">
              <div className="sample-data">
                <div className="sample-data__item">
                  <span className="sample-data__label">Diameter:</span>
                  <span className="sample-data__value">6.08 cm</span>
                </div>
                <div className="sample-data__item">
                  <span className="sample-data__label">Height:</span>
                  <span className="sample-data__value">2.1 m</span>
                </div>
                <div className="sample-data__item">
                  <span className="sample-data__label">Year:</span>
                  <span className="sample-data__value">2016</span>
                </div>
                <div className="sample-data__item">
                  <span className="sample-data__label">Group:</span>
                  <span className="sample-data__value">cacao</span>
                </div>
                <div className="sample-data__item">
                  <span className="sample-data__label">Site:</span>
                  <span className="sample-data__value">Nestor Macias RGB</span>
                </div>
              </div>
              <button className="btn btn-primary w-full" onClick={handleLoadSample}>
                Load Sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualPrediction;
