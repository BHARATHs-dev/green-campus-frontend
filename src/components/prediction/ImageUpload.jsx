import { useState, useRef, useCallback } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function ImageUpload({ onPredict, loading, onClear, onFileSelected }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) {
      setError('Please select an image file.');
      return false;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.');
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a valid image file.');
      return false;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`Image size exceeds the allowed limit of ${MAX_SIZE_MB}MB.`);
      return false;
    }

    setError('');
    return true;
  };

  const processFile = useCallback((file) => {
    if (!validateFile(file)) {
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      setPreview(null);
      setFileName('');
    };
    reader.readAsDataURL(file);
    onFileSelected?.(file);
  }, [onFileSelected]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!preview) {
      setError('Please upload an image before predicting.');
      return;
    }

    const file = fileInputRef.current?.files[0];
    if (file && validateFile(file)) {
      onPredict(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const handleBrowseClick = () => {
    setError('');
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload">
      <form onSubmit={handleSubmit}>
        <div
          className={`image-upload__dropzone ${dragActive ? 'image-upload__dropzone--active' : ''} ${preview ? 'image-upload__dropzone--has-preview' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!preview ? handleBrowseClick : undefined}
        >
          {preview ? (
            <div className="image-upload__preview">
              <img src={preview} alt="Preview" className="image-upload__img" />
              <div className="image-upload__preview-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                  disabled={loading}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="image-upload__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="image-upload__icon">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p>Drag & Drop an image here</p>
              <span>or</span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                disabled={loading}
              >
                Browse Image
              </button>
              <span className="image-upload__hint">Supported: JPG, JPEG, PNG, WEBP (max {MAX_SIZE_MB}MB)</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="image-upload__input"
          />
        </div>

        {fileName && !preview && (
          <div className="image-upload__filename">
            Selected: {fileName}
          </div>
        )}

        {error && (
          <div className="image-upload__error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-ai"
            disabled={loading || !preview}
          >
            {loading ? 'Predicting...' : 'Predict Biomass'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={loading || !preview}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default ImageUpload;
