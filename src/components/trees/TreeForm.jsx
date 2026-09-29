import { useState } from 'react';

function TreeForm({ tree, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: tree?.name || '',
    group: tree?.group || '',
    site: tree?.site || '',
    plot_id: tree?.plot_id || '',
    diameter: tree?.diameter || '',
    height: tree?.height || '',
    year: tree?.year || '',
    lat: tree?.lat || '',
    lon: tree?.lon || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3>{tree ? 'Edit Tree' : 'Add Tree'}</h3>
          <button className="modal__close" onClick={onCancel} aria-label="Close modal">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-group-label">Tree Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter tree name"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Group/Species</label>
              <input
                type="text"
                name="group"
                className="form-input"
                value={formData.group}
                onChange={handleChange}
                placeholder="Enter group or species"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Site</label>
              <input
                type="text"
                name="site"
                className="form-input"
                value={formData.site}
                onChange={handleChange}
                placeholder="Enter site"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Plot ID</label>
              <input
                type="text"
                name="plot_id"
                className="form-input"
                value={formData.plot_id}
                onChange={handleChange}
                placeholder="Enter plot ID"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Diameter (cm)</label>
              <input
                type="number"
                name="diameter"
                className="form-input"
                value={formData.diameter}
                onChange={handleChange}
                placeholder="Enter diameter"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Height (m)</label>
              <input
                type="number"
                name="height"
                className="form-input"
                value={formData.height}
                onChange={handleChange}
                placeholder="Enter height"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Year</label>
              <input
                type="number"
                name="year"
                className="form-input"
                value={formData.year}
                onChange={handleChange}
                placeholder="Enter year"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Latitude</label>
              <input
                type="number"
                name="lat"
                className="form-input"
                value={formData.lat}
                onChange={handleChange}
                placeholder="Enter latitude"
                step="0.0001"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Longitude</label>
              <input
                type="number"
                name="lon"
                className="form-input"
                value={formData.lon}
                onChange={handleChange}
                placeholder="Enter longitude"
                step="0.0001"
              />
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TreeForm;
