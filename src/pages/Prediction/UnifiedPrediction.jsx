import { useState, useEffect } from 'react';
import { predictAGB, predictImageAGB, predictSatelliteAGB, getSatelliteModelInfo } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import ImageUpload from '../../components/prediction/ImageUpload';
import SatelliteUpload from '../../components/prediction/SatelliteUpload';
import PredictionResult from '../../components/prediction/PredictionResult';
import ModelInfo from '../../components/prediction/ModelInfo';
import TreeRecommendations from '../../components/prediction/TreeRecommendations';
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

const SATELLITE_SOURCES = [
  { value: 'sentinel2', label: 'Sentinel-2' },
  { value: 'landsat8', label: 'Landsat-8' },
  { value: 'aerial', label: 'Aerial / Drone' }
];

const BAND_OPTIONS = [
  { value: 'B2', label: 'B2 Blue' },
  { value: 'B3', label: 'B3 Green' },
  { value: 'B4', label: 'B4 Red' },
  { value: 'B8', label: 'B8 NIR' },
  { value: 'B11', label: 'B11 SWIR' },
  { value: 'B12', label: 'B12 SWIR' }
];

const PLOTS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const FIELD_MODEL_INFO = {
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

function UnifiedPrediction() {
  const [activeTab, setActiveTab] = useState('field');

  const [fieldForm, setFieldForm] = useState({
    diameter: '',
    height: '',
    year: '',
    group: '',
    site: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldPrediction, setFieldPrediction] = useState(null);
  const [fieldLoading, setFieldLoading] = useState(false);
  const [fieldApiError, setFieldApiError] = useState('');

  const [imagePrediction, setImagePrediction] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageApiError, setImageApiError] = useState('');

  const [satelliteForm, setSatelliteForm] = useState({
    source: 'sentinel2',
    bands: ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'],
    plot: ''
  });
  const [satellitePrediction, setSatellitePrediction] = useState(null);
  const [satelliteLoading, setSatelliteLoading] = useState(false);
  const [satelliteApiError, setSatelliteApiError] = useState('');
  const [satelliteModelInfo, setSatelliteModelInfo] = useState(null);
  const [satelliteModelReady, setSatelliteModelReady] = useState(false);
  const [satelliteModelInfoLoading, setSatelliteModelInfoLoading] = useState(true);

  const validateField = () => {
    const newErrors = {};
    if (!fieldForm.diameter || Number(fieldForm.diameter) <= 0) {
      newErrors.diameter = 'Diameter must be greater than 0.';
    }
    if (fieldForm.height === '' || Number(fieldForm.height) < 0) {
      newErrors.height = 'Height must be 0 or greater.';
    }
    if (!fieldForm.year || Number(fieldForm.year) < 1900 || Number(fieldForm.year) > 2100) {
      newErrors.year = 'Please enter a valid year.';
    }
    if (!fieldForm.group) {
      newErrors.group = 'Please select a tree group.';
    }
    if (!fieldForm.site) {
      newErrors.site = 'Please select a site.';
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFieldForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    setFieldApiError('');
    setFieldPrediction(null);
    if (!validateField()) return;

    try {
      setFieldLoading(true);
      const response = await predictAGB({
        diameter: Number(fieldForm.diameter),
        height: Number(fieldForm.height),
        year: Number(fieldForm.year),
        group: fieldForm.group,
        site: fieldForm.site
      });
      setFieldPrediction(response.data.data);
    } catch (err) {
      console.error('Field prediction error:', err);
      setFieldApiError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Field prediction failed. Please try again.'
      );
    } finally {
      setFieldLoading(false);
    }
  };

  const handleLoadSample = () => {
    setFieldForm(SAMPLE_DATA);
    setFieldErrors({});
    setFieldPrediction(null);
    setFieldApiError('');
  };

  const handleFieldClear = () => {
    setFieldForm({ diameter: '', height: '', year: '', group: '', site: '' });
    setFieldErrors({});
    setFieldPrediction(null);
    setFieldApiError('');
  };

  const handleImagePredict = async (file) => {
    setImageApiError('');
    setImagePrediction(null);
    if (!file) return;

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      const response = await predictImageAGB(formData);
      setImagePrediction(response.data.data);
    } catch (err) {
      console.error('Image prediction error:', err);
      setImageApiError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Image prediction failed. Please try again.'
      );
    } finally {
      setImageLoading(false);
    }
  };

  const handleSatelliteBandChange = (band) => {
    setSatelliteForm(prev => {
      const bands = prev.bands.includes(band)
        ? prev.bands.filter(b => b !== band)
        : [...prev.bands, band];
      return { ...prev, bands };
    });
  };

  const handleSatellitePredict = async (file) => {
    setSatelliteApiError('');
    setSatellitePrediction(null);
    if (!file) return;

    try {
      setSatelliteLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('source', satelliteForm.source);
      formData.append('bands', satelliteForm.bands.join(','));
      formData.append('plot', satelliteForm.plot);

      const response = await predictSatelliteAGB(formData);
      setSatellitePrediction(response.data?.data || response.data);
    } catch (err) {
      console.error('Satellite prediction error:', err);
      setSatelliteApiError(
        err.response?.data?.message ||
        err.response?.data?.detail?.message ||
        err.response?.data?.error ||
        'Satellite prediction failed. Please try again.'
      );
    } finally {
      setSatelliteLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadSatelliteModelInfo() {
      try {
        const response = await getSatelliteModelInfo();
        if (!cancelled && response.data) {
          setSatelliteModelInfo(response.data);
          setSatelliteModelReady(response.data.success && response.data.status === 'trained');
        }
      } catch (err) {
        console.warn('Could not load satellite model info:', err.message);
      } finally {
        if (!cancelled) setSatelliteModelInfoLoading(false);
      }
    }
    loadSatelliteModelInfo();
    return () => { cancelled = true; };
  }, []);

  const fieldAgb = fieldPrediction?.agb ?? fieldPrediction?.prediction;
  const fieldCarbon = fieldPrediction?.carbon ?? (fieldAgb != null ? fieldAgb * CARBON_FRACTION : null);

  const imageAgb = imagePrediction?.agb ?? imagePrediction?.prediction;
  const imageCarbon = imagePrediction?.carbon ?? (imageAgb != null ? imageAgb * CARBON_FRACTION : null);

  const satelliteAgb =
    satellitePrediction?.agbd ??
    satellitePrediction?.agb ??
    satellitePrediction?.prediction ??
    satellitePrediction?.data?.agbd ??
    satellitePrediction?.data?.agb;
  const satelliteCarbon =
    satellitePrediction?.carbon ??
    satellitePrediction?.data?.carbon ??
    (satelliteAgb != null ? satelliteAgb * CARBON_FRACTION : null);

  return (
    <div className="prediction-page">
      <PageHeader
        title="Biomass Prediction"
        subtitle="Estimate Above-Ground Biomass and carbon stock using field data, tree images, or satellite imagery."
      />

      <div className="prediction-tabs">
        <button
          className={`prediction-tab ${activeTab === 'field' ? 'prediction-tab--active' : ''}`}
          onClick={() => setActiveTab('field')}
        >
          Field Data
        </button>
        <button
          className={`prediction-tab ${activeTab === 'image' ? 'prediction-tab--active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          Tree Image
        </button>
        <button
          className={`prediction-tab ${activeTab === 'satellite' ? 'prediction-tab--active' : ''}`}
          onClick={() => setActiveTab('satellite')}
        >
          Satellite
        </button>
      </div>

      {activeTab === 'field' && (
        <div className="prediction-grid">
          <div className="prediction-card">
            <div className="card">
              <div className="card__header">
                <h3>Input Measurements</h3>
                <p>Enter the tree parameters for AGB estimation.</p>
              </div>

              <form onSubmit={handleFieldSubmit} className="manual-form">
                <div className="manual-form__grid">
                  <div className="form-group">
                    <label className="form-group-label">
                      Diameter / DBH <span className="required">*</span>
                    </label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        name="diameter"
                        className={`form-input ${fieldErrors.diameter ? 'form-input--error' : ''}`}
                        placeholder="Example: 6.08"
                        value={fieldForm.diameter}
                        onChange={handleFieldChange}
                        step="0.01"
                        min="0.01"
                      />
                      <span className="input-unit">cm</span>
                    </div>
                    {fieldErrors.diameter && <span className="form-error">{fieldErrors.diameter}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-group-label">
                      Tree Height
                    </label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        name="height"
                        className={`form-input ${fieldErrors.height ? 'form-input--error' : ''}`}
                        placeholder="Example: 2.1"
                        value={fieldForm.height}
                        onChange={handleFieldChange}
                        step="0.1"
                        min="0"
                      />
                      <span className="input-unit">m</span>
                    </div>
                    {fieldErrors.height && <span className="form-error">{fieldErrors.height}</span>}
                    {Number(fieldForm.height) === 0 && !fieldErrors.height && (
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
                      className={`form-input ${fieldErrors.year ? 'form-input--error' : ''}`}
                      placeholder="Example: 2016"
                      value={fieldForm.year}
                      onChange={handleFieldChange}
                      min="1900"
                      max="2100"
                    />
                    {fieldErrors.year && <span className="form-error">{fieldErrors.year}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-group-label">
                      Tree Group <span className="required">*</span>
                    </label>
                    <select
                      name="group"
                      className={`form-select ${fieldErrors.group ? 'form-input--error' : ''}`}
                      value={fieldForm.group}
                      onChange={handleFieldChange}
                    >
                      <option value="">Select group</option>
                      {GROUPS.map(g => (
                        <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                      ))}
                    </select>
                    {fieldErrors.group && <span className="form-error">{fieldErrors.group}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <label className="form-group-label">
                      Site <span className="required">*</span>
                    </label>
                    <select
                      name="site"
                      className={`form-select ${fieldErrors.site ? 'form-input--error' : ''}`}
                      value={fieldForm.site}
                      onChange={handleFieldChange}
                    >
                      <option value="">Select site</option>
                      {SITES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {fieldErrors.site && <span className="form-error">{fieldErrors.site}</span>}
                  </div>
                </div>

                <div className="manual-form__actions">
                  <button
                    type="submit"
                    className="btn btn-ai"
                    disabled={fieldLoading}
                  >
                    {fieldLoading ? 'Predicting...' : 'Predict AGB with CatBoost'}
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
                    onClick={handleFieldClear}
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>

            {fieldApiError && (
              <div className="card card--error">
                <div className="card__body">
                  <div className="error-state">
                    <svg className="error-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>{fieldApiError}</p>
                    <button className="btn btn-primary btn-sm" onClick={handleFieldSubmit}>Retry</button>
                  </div>
                </div>
              </div>
            )}

            {fieldPrediction && (
              <div className="card card--result">
                <div className="card__header">
                  <h3>AGB Prediction Result</h3>
                </div>
                <div className="card__body">
                  <div className="result-card">
                    <div className="result-card__main">
                      <div className="result-card__label">Predicted Above-Ground Biomass</div>
                      <div className="result-card__value">{fieldAgb != null ? `${Number(fieldAgb).toFixed(2)} kg` : '—'}</div>
                    </div>

                    <div className="result-card__secondary">
                      <div className="result-card__secondary-item">
                        <span className="result-card__secondary-label">Estimated Carbon Stock</span>
                        <span className="result-card__secondary-value">{fieldCarbon != null ? `${Number(fieldCarbon).toFixed(2)} kg` : '—'}</span>
                      </div>
                      <div className="result-card__formula">Carbon = AGB × 0.47</div>
                    </div>

                    <div className="result-card__model">
                      <div className="result-card__model-title">Model Information</div>
                      <div className="result-card__model-grid">
                        <div><span>Model:</span> CatBoostRegressor</div>
                        <div><span>Version:</span> catboost-v1</div>
                      </div>
                    </div>

                    <div className="result-card__inputs">
                      <div className="result-card__inputs-title">Input Summary</div>
                      <div className="result-card__inputs-grid">
                        <div className="result-card__input-item">
                          <span className="result-card__input-label">Diameter</span>
                          <span className="result-card__input-value">{fieldForm.diameter} cm</span>
                        </div>
                        <div className="result-card__input-item">
                          <span className="result-card__input-label">Height</span>
                          <span className="result-card__input-value">{fieldForm.height} m</span>
                        </div>
                        <div className="result-card__input-item">
                          <span className="result-card__input-label">Year</span>
                          <span className="result-card__input-value">{fieldForm.year}</span>
                        </div>
                        <div className="result-card__input-item">
                          <span className="result-card__input-label">Group</span>
                          <span className="result-card__input-value">{fieldForm.group}</span>
                        </div>
                        <div className="result-card__input-item">
                          <span className="result-card__input-label">Site</span>
                          <span className="result-card__input-value">{fieldForm.site}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <TreeRecommendations agb={fieldAgb} site={fieldForm.site} group={fieldForm.group} />
                </div>
              </div>
            )}
          </div>

          <div className="prediction-card">
            <ModelInfo
              algorithm={FIELD_MODEL_INFO.algorithm}
              purpose={FIELD_MODEL_INFO.purpose}
              dataset={FIELD_MODEL_INFO.dataset}
              features={`${FIELD_MODEL_INFO.features} features`}
              target={FIELD_MODEL_INFO.target}
              metrics={{
                r2: FIELD_MODEL_INFO.r2,
                mae: `${FIELD_MODEL_INFO.mae} kg`,
                rmse: `${FIELD_MODEL_INFO.rmse} kg`
              }}
            />

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
      )}

      {activeTab === 'image' && (
        <div className="prediction-grid">
          <div className="prediction-card">
            <h3 className="prediction-card__title">Upload Tree Image</h3>
            <p className="prediction-card__subtitle">
              Select a clear photo of the tree or canopy. Supported formats: JPG, PNG.
            </p>

            <ImageUpload onPredict={handleImagePredict} loading={imageLoading} />

            {imageApiError && (
              <div className="card card--error mt-3">
                <div className="card__body">
                  <div className="error-state">
                    <svg className="error-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>{imageApiError}</p>
                  </div>
                </div>
              </div>
            )}

            {imagePrediction && (
              <div className="mt-3">
                <PredictionResult
                  agb={imageAgb}
                  carbon={imageCarbon}
                  model="EfficientNet-B0 CNN"
                  modelVersion="efficientnet-b0-v1"
                />
                <div className="mt-3">
                  <TreeRecommendations agb={imageAgb} />
                </div>
              </div>
            )}
          </div>

          <div className="prediction-card">
            <ModelInfo
              algorithm="EfficientNet-B0 + Regression Head"
              purpose="Above-Ground Biomass Estimation from Images"
              dataset="Tree Canopy Images"
              features="Image pixels + metadata"
              target="AGB (kg)"
              metrics={{
                r2: 'Pending',
                mae: 'Pending',
                rmse: 'Pending'
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'satellite' && (
        <div className="prediction-grid">
          <div className="prediction-card">
            <h3 className="prediction-card__title">Upload Satellite or Aerial Image</h3>
            <p className="prediction-card__subtitle">
              Upload multispectral satellite imagery (GeoTIFF) or standard aerial/satellite photos (JPG, PNG, WEBP) for AGBD estimation.
            </p>

            {!satelliteModelReady && !satelliteModelInfoLoading && (
              <div className="card card--info mt-3">
                <div className="card__body">
                  <p className="disclaimer-text">
                    <strong>Satellite biomass prediction model is not trained yet.</strong>
                  </p>
                  <p className="disclaimer-text">
                    A labelled satellite dataset containing multispectral imagery and corresponding
                    ground-truth AGBD is required before satellite biomass predictions can be generated.
                  </p>
                </div>
              </div>
            )}

            {satelliteModelReady && (
              <>
                <div className="form-group">
                  <label className="form-group-label">
                    Satellite Source <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={satelliteForm.source}
                    onChange={(e) => setSatelliteForm(prev => ({ ...prev, source: e.target.value }))}
                  >
                    {SATELLITE_SOURCES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-group-label">
                    Bands <span className="required">*</span>
                  </label>
                  <div className="band-checkboxes">
                    {BAND_OPTIONS.map(b => (
                      <label key={b.value} className="band-checkbox">
                        <input
                          type="checkbox"
                          checked={satelliteForm.bands.includes(b.value)}
                          onChange={() => handleSatelliteBandChange(b.value)}
                        />
                        <span>{b.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-group-label">
                    Location / Plot <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={satelliteForm.plot}
                    onChange={(e) => setSatelliteForm(prev => ({ ...prev, plot: e.target.value }))}
                  >
                    <option value="">Select plot</option>
                    {PLOTS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <SatelliteUpload onUpload={handleSatellitePredict} onPredict={handleSatellitePredict} loading={satelliteLoading} />

                {satelliteApiError && (
                  <div className="card card--error mt-3">
                    <div className="card__body">
                      <div className="error-state">
                        <svg className="error-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{satelliteApiError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {satellitePrediction && (
                  <div className="mt-3">
                    <PredictionResult
                      agb={satelliteAgb}
                      carbon={satelliteCarbon}
                      model={satellitePrediction.model || satellitePrediction.data?.model || 'Satellite CNN'}
                      modelVersion={satellitePrediction.modelVersion || satellitePrediction.data?.modelVersion || 'satellite-cnn-prototype-v1'}
                      unit={satellitePrediction.agbd_unit || satellitePrediction.data?.agbd_unit || 'Mg/ha'}
                      carbonUnit={satellitePrediction.carbon_unit || satellitePrediction.data?.carbon_unit || 'Mg C/ha'}
                      status={satellitePrediction.status || satellitePrediction.data?.status || 'Prototype'}
                      metadata={satellitePrediction.metadata || satellitePrediction.data?.metadata}
                      selectedBands={satellitePrediction.selected_bands || satellitePrediction.data?.selected_bands}
                      inChannels={satellitePrediction.in_channels || satellitePrediction.data?.in_channels}
                    />
                    <div className="mt-3">
                      <TreeRecommendations
                        agb={satelliteAgb}
                        unit={satellitePrediction.agbd_unit || satellitePrediction.data?.agbd_unit || 'Mg/ha'}
                        isDensity={true}
                        predictionType="satellite"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="prediction-card">
            <ModelInfo
              algorithm={satelliteModelInfo?.architecture || 'Satellite CNN (multispectral regression)'}
              purpose="Above-Ground Biomass Density Estimation from Satellite Imagery"
              dataset={satelliteModelInfo?.bands ? `Multispectral (${satelliteModelInfo.bands.join(', ')})` : 'Sentinel-2 / Multispectral'}
              features="Spectral bands + vegetation indices (NDVI, EVI, SAVI, NDWI, MSI)"
              target="AGBD (Mg/ha)"
              metrics={{
                r2: satelliteModelInfo?.metrics?.r2 || 'Pending',
                mae: satelliteModelInfo?.metrics?.mae ? `${satelliteModelInfo.metrics.mae} Mg/ha` : 'Pending',
                rmse: satelliteModelInfo?.metrics?.rmse ? `${satelliteModelInfo.metrics.rmse} Mg/ha` : 'Pending',
              }}
              datasetInfo={satelliteModelInfo?.dataset ? {
                total: satelliteModelInfo.dataset.total,
                train: satelliteModelInfo.dataset.train,
                validation: satelliteModelInfo.dataset.validation,
                test: satelliteModelInfo.dataset.test,
              } : null}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedPrediction;
