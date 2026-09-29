import { useState, useRef, useCallback } from 'react';

const ALLOWED_EXTENSIONS = ['tif', 'tiff', 'jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageExtension(ext) {
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
}

function SatelliteUpload({ onUpload, onPredict, loading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((f) => {
    if (!f) {
      setError('Please select a file.');
      return false;
    }

    const ext = f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Unsupported file format. Please upload a GeoTIFF (.tif/.tiff) or image (.jpg/.jpeg/.png/.webp).');
      return false;
    }

    if (f.size > MAX_SIZE_BYTES) {
      setError(`File size exceeds the ${MAX_SIZE_MB} MB limit.`);
      return false;
    }

    setError('');
    return true;
  }, []);

  const processFile = useCallback((f) => {
    if (!validateFile(f)) return;
    setFile(f);
    setError('');

    const ext = f.name.split('.').pop().toLowerCase();
    if (isImageExtension(ext)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.onerror = () => {
        setPreview(null);
      };
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, [validateFile]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    setError('');
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    const submitFn = onUpload || onPredict;
    if (submitFn) {
      submitFn(file);
    }
  };

  const ext = file ? file.name.split('.').pop().toLowerCase() : '';
  const isImage = isImageExtension(ext);

  return (
    <div className="satellite-upload">
      <form onSubmit={handleSubmit}>
        <div
          className={`satellite-upload__dropzone ${dragActive ? 'satellite-upload__dropzone--active' : ''} ${file ? 'satellite-upload__dropzone--has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!file ? handleBrowseClick : undefined}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (!file && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          {file ? (
            <div className="satellite-upload__file-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
              {preview ? (
                <div className="satellite-upload__preview" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={preview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="satellite-upload__file-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
              )}
              <div className="satellite-upload__file-details" style={{ flexGrow: 1 }}>
                <span className="satellite-upload__filename" style={{ fontWeight: 600 }}>{file.name}</span>
                <span className="satellite-upload__filesize" style={{ display: 'block', fontSize: '0.875rem', opacity: 0.8 }}>
                  {formatFileSize(file.size)} • {isImage ? 'Standard Image (RGB / Aerial)' : 'Multispectral GeoTIFF'}
                </span>
                <span className="satellite-upload__status" style={{ color: '#10b981', fontSize: '0.8rem' }}>Ready for prediction</span>
              </div>
              <button
                type="button"
                className="satellite-upload__remove"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                disabled={loading}
                aria-label="Remove selected file"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="satellite-upload__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="satellite-upload__icon">
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
              <p className="satellite-upload__title">Upload Satellite or Aerial Image</p>
              <p className="satellite-upload__subtitle">Supported formats: GeoTIFF (.tif, .tiff), JPG, JPEG, PNG, WEBP</p>
              <p className="satellite-upload__subtitle">Drag & drop your file here</p>
              <span className="satellite-upload__or">or</span>
              <button
                type="button"
                className="btn btn-primary satellite-upload__browse"
                onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                disabled={loading}
              >
                Browse File
              </button>
              <span className="satellite-upload__hint">GeoTIFF / JPG / JPEG / PNG / WEBP • Up to 50 MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".tif,.tiff,.jpg,.jpeg,.png,.webp,image/*,application/octet-stream"
            onChange={handleFileChange}
            className="satellite-upload__input"
            aria-label="Select satellite or aerial image file"
          />
        </div>

        {error && (
          <div className="satellite-upload__error" role="alert" style={{ color: '#ef4444', marginTop: '0.75rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {file && !error && (
          <div className="form-actions" style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn--full"
              disabled={loading}
            >
              {loading && (
                <svg className="satellite-upload__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              )}
              {loading ? 'Predicting Biomass...' : 'Predict Satellite Biomass'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default SatelliteUpload;
