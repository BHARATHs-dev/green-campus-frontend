import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getMapData,
  predictAGBFromTree,
  getBiomassStats,
  getCarbonStats
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import PredictionResult from '../../components/common/PredictionResult';
import './Maps.css';

const CARBON_FRACTION = 0.47;

// Default Origin: Central Tamil Nadu, India
const TAMIL_NADU_ORIGIN = {
  center: [11.1271, 78.6569],
  zoom: 8
};

// Preset Campus & Research Forest Locations across Tamil Nadu, India
export const TN_CAMPUS_PRESETS = [
  {
    id: 'all_tn',
    name: 'Tamil Nadu (State Overview)',
    short: '🇮🇳 All Tamil Nadu',
    site: '',
    center: [11.1271, 78.6569],
    zoom: 8,
    desc: 'Statewide overview across Tamil Nadu, India'
  },
  {
    id: 'tnau_cbe',
    name: 'TNAU Forest College & Research, Coimbatore',
    short: '🏫 TNAU Coimbatore',
    site: 'Nestor Macias RGB',
    center: [11.0130, 76.9366],
    zoom: 17,
    desc: 'TNAU Forestry & Agroforestry Campus, Coimbatore'
  },
  {
    id: 'anna_chennai',
    name: 'Anna University & Guindy Forest Campus, Chennai',
    short: '🎓 Anna Univ Chennai',
    site: 'Flora Pluas RGB',
    center: [13.0067, 80.2355],
    zoom: 17,
    desc: 'Anna University Guindy Urban Forest Campus, Chennai'
  },
  {
    id: 'bharathiar_cbe',
    name: 'Bharathiar University Campus, Coimbatore',
    short: '🌿 Bharathiar Univ',
    site: 'Carlos Vera Guevara RGB',
    center: [11.0401, 76.8794],
    zoom: 17,
    desc: 'Bharathiar University Foothills Eco-Campus, Coimbatore'
  },
  {
    id: 'nilgiris_ooty',
    name: 'Nilgiris Agroforestry Reserve, Ooty',
    short: '🌲 Nilgiris Ooty',
    site: 'Carlos Vera Arteaga RGB',
    center: [11.4168, 76.7116],
    zoom: 17,
    desc: 'Nilgiris Western Ghats High-Altitude Forest, Ooty'
  },
  {
    id: 'madurai_kamaraj',
    name: 'Madurai Kamaraj University Campus, Madurai',
    short: '🏛️ Madurai Kamaraj',
    site: 'Leonor Aspiazu RGB',
    center: [9.9431, 78.0108],
    zoom: 17,
    desc: 'Madurai Kamaraj University Semi-Arid Eco-Zone'
  },
  {
    id: 'salem_yercaud',
    name: 'Salem Yercaud Forest Reserve, Salem',
    short: '⛰️ Salem Yercaud',
    site: 'Manuel Macias RGB',
    center: [11.7753, 78.2093],
    zoom: 17,
    desc: 'Shevaroy Hills Reserve Forest Plot, Salem'
  }
];

// High-Speed GIS Tile Providers with Fast CDNs & API Key support
export const TILE_PROVIDERS = {
  cartoVoyager: {
    id: 'cartoVoyager',
    name: 'Carto Voyager',
    tag: '⚡ Fast CDN (Default)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: 'abcd'
  },
  esriSatellite: {
    id: 'esriSatellite',
    name: 'Satellite GIS (ArcGIS)',
    tag: '🛰️ High-Res Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 19
  },
  esriTopo: {
    id: 'esriTopo',
    name: 'Topographic / Terrain',
    tag: '⛰️ Topo GIS',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap (Standard)',
    tag: '🗺️ OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  customMapbox: {
    id: 'customMapbox',
    name: 'Mapbox Satellite Streets',
    tag: '🔑 Mapbox Key',
    url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token={key}',
    attribution: '&copy; Mapbox &copy; OpenStreetMap',
    requiresKey: true,
    maxZoom: 20
  },
  customMaptiler: {
    id: 'customMaptiler',
    name: 'MapTiler Hybrid Satellite',
    tag: '🔑 MapTiler Key',
    url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key={key}',
    attribution: '&copy; MapTiler &copy; OpenStreetMap',
    requiresKey: true,
    maxZoom: 20
  },
  googleHybrid: {
    id: 'googleHybrid',
    name: 'Google Maps (Satellite Hybrid)',
    tag: '🔑 Google Key',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key={key}',
    attribution: '&copy; Google Maps',
    requiresKey: true,
    maxZoom: 20
  },
  googleRoadmap: {
    id: 'googleRoadmap',
    name: 'Google Maps (Roadmap)',
    tag: '🔑 Google Key',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key={key}',
    attribution: '&copy; Google Maps',
    requiresKey: true,
    maxZoom: 20
  }
};

const getEnvApiKey = () => {
  return (
    import.meta.env.VITE_GIS_MAP_API_KEY ||
    import.meta.env.VITE_MAPBOX_TOKEN ||
    import.meta.env.VITE_MAPBOX_API_KEY ||
    import.meta.env.VITE_MAP_API_KEY ||
    import.meta.env.VITE_MAPTILER_KEY ||
    import.meta.env.VITE_MAPTILER_API_KEY ||
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.VITE_GOOGLE_MAP_API_KEY ||
    ''
  ).trim();
};

const BIOMASS_COLORS_HEX = {
  'Low': '#059669',
  'Medium-Low': '#10b981',
  Medium: '#d97706',
  High: '#dc2626',
  'Very High': '#7c3aed'
};

const biomassCategory = (agb) => {
  if (agb == null) return 'Low';
  if (agb < 5) return 'Low';
  if (agb < 10) return 'Medium-Low';
  if (agb < 20) return 'Medium';
  if (agb < 50) return 'High';
  return 'Very High';
};

const CARBON_COLORS_HEX = {
  'Low': '#059669',
  'Medium-Low': '#10b981',
  Medium: '#d97706',
  High: '#dc2626',
  'Very High': '#7c3aed'
};

const carbonCategory = (carbon) => {
  if (carbon == null) return 'Low';
  if (carbon < 2.35) return 'Low';
  if (carbon < 4.70) return 'Medium-Low';
  if (carbon < 9.40) return 'Medium';
  if (carbon < 23.50) return 'High';
  return 'Very High';
};

const CONDITION_COLORS_HEX = {
  Healthy: '#16a34a',
  'Moderately Degraded': '#d97706',
  'Severely Degraded': '#dc2626'
};

const treeIcon = L.divIcon({
  html: '<div class="map-marker-tree"></div>',
  className: 'map-emoji-wrapper',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13]
});

const vegIcon = (level) => {
  const cls = `map-marker-veg map-marker-veg-${level ? level.replace(/\s+/g, '-').toLowerCase() : 'unknown'}`;
  return L.divIcon({
    html: `<div class="${cls}"></div>`,
    className: 'map-emoji-wrapper',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const biomassIcon = (agb) => {
  const category = biomassCategory(agb);
  const cls = `map-marker-tree map-marker-tree--biomass-${category.replace(/\s+/g, '-').toLowerCase()}`;
  return L.divIcon({
    html: `<div class="${cls}"></div>`,
    className: 'map-emoji-wrapper',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

const carbonIcon = (agb) => {
  const carbon = agb != null ? agb * CARBON_FRACTION : 0;
  const category = carbonCategory(carbon);
  const cls = `map-marker-tree map-marker-tree--carbon-${category.replace(/\s+/g, '-').toLowerCase()}`;
  return L.divIcon({
    html: `<div class="${cls}"></div>`,
    className: 'map-emoji-wrapper',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

// Smooth Pan & Zoom Controller
function MapFlyController({ target, onComplete }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target.center, target.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
    if (onComplete) onComplete();
  }, [target, map, onComplete]);
  return null;
}

// User-triggered Fit Bounds component
function FitBoundsTrigger({ trigger, points }) {
  const map = useMap();
  useEffect(() => {
    if (!trigger || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    }
  }, [trigger, points, map]);
  return null;
}

function Maps() {
  const [mapMode, setMapMode] = useState('all');
  const [selectedSite, setSelectedSite] = useState('');
  const [activePreset, setActivePreset] = useState('all_tn');
  const [search, setSearch] = useState('');
  const [trees, setTrees] = useState([]);
  const [vegetation, setVegetation] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [summary, setSummary] = useState({ totalTrees: 0, totalAGB: 0, estimatedCarbon: 0 });

  // Map Tile & API Key State
  const envKey = getEnvApiKey();
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('agb_gis_api_key') || envKey || '';
  });

  const [activeTileId, setActiveTileId] = useState(() => {
    const saved = localStorage.getItem('agb_gis_tile_provider');
    if (saved) return saved;
    const effectiveKey = localStorage.getItem('agb_gis_api_key') || envKey;
    if (effectiveKey) {
      if (effectiveKey.startsWith('pk.')) return 'customMapbox';
      if (effectiveKey.startsWith('AIza')) return 'googleHybrid';
      return 'customMaptiler';
    }
    return 'cartoVoyager';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  // Performance Render Mode: 'canvas' (blazing fast, 60fps) vs 'markers' (DOM pins)
  const [renderMode, setRenderMode] = useState('canvas');

  // Map Camera Fly Target
  const [flyTarget, setFlyTarget] = useState(null);
  const [fitTrigger, setFitTrigger] = useState(0);

  // Load Map Data
  const load = async (mode, q, siteFilter) => {
    try {
      setLoading(true);
      const apiType = mode === 'biomass' || mode === 'carbon' ? 'trees' : mode;
      const params = { type: apiType, search: q };
      if (siteFilter) params.site = siteFilter;
      const res = await getMapData(params);
      const d = res.data.data;
      setTrees(d.trees || []);
      setVegetation(d.vegetation || []);
      setMeta(d.meta || null);
    } catch (err) {
      console.error('Map data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(mapMode, search, selectedSite);
    setSelected(null);
    setPrediction(null);
  }, [mapMode, selectedSite]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(mapMode, search, selectedSite);
    setSelected(null);
    setPrediction(null);
  };

  // Fetch summary
  useEffect(() => {
    let cancelled = false;
    const fetchSummary = async () => {
      try {
        const [biomassRes, carbonRes] = await Promise.all([
          getBiomassStats(),
          getCarbonStats()
        ]);
        if (cancelled) return;
        const biomassData = biomassRes.data.data || biomassRes.data;
        const carbonData = carbonRes.data.data || carbonRes.data;
        setSummary({
          totalTrees: biomassData.totalRecords || 0,
          totalAGB: biomassData.totalAGB || 0,
          estimatedCarbon: carbonData.estimatedCarbon || 0
        });
      } catch (err) {
        console.error('Map summary error:', err);
      }
    };
    fetchSummary();
    return () => { cancelled = true; };
  }, []);

  const allPoints = useMemo(() => [...trees, ...vegetation], [trees, vegetation]);

  // Navigate to a Tamil Nadu preset location
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setSelectedSite(preset.site);
    setFlyTarget({ center: preset.center, zoom: preset.zoom });
  };

  // Reset to Tamil Nadu Origin
  const handleResetToTamilNadu = () => {
    setActivePreset('all_tn');
    setSelectedSite('');
    setFlyTarget({ center: TAMIL_NADU_ORIGIN.center, zoom: TAMIL_NADU_ORIGIN.zoom });
  };

  // Handle Tile Provider Change
  const handleTileChange = (providerId) => {
    const prov = TILE_PROVIDERS[providerId];
    if (prov?.requiresKey && !apiKey.trim()) {
      setTempApiKey(apiKey);
      setShowKeyModal(true);
      return;
    }
    setActiveTileId(providerId);
    localStorage.setItem('agb_gis_tile_provider', providerId);
  };

  // Save API Key
  const handleSaveApiKey = () => {
    const cleanKey = tempApiKey.trim();
    setApiKey(cleanKey);
    localStorage.setItem('agb_gis_api_key', cleanKey);
    setShowKeyModal(false);
  };

  // Resolve current tile URL
  const currentTileConfig = useMemo(() => {
    const prov = TILE_PROVIDERS[activeTileId] || TILE_PROVIDERS.cartoVoyager;
    let url = prov.url;
    if (prov.requiresKey) {
      if (!apiKey.trim()) {
        // Fallback to fast Carto Voyager if no key
        return TILE_PROVIDERS.cartoVoyager;
      }
      url = url.replace('{key}', apiKey.trim());
    }
    return { ...prov, url };
  }, [activeTileId, apiKey]);

  // AI Prediction
  const handlePredict = async (item) => {
    try {
      setPredicting(true);
      setPrediction(null);
      if (item.kind === 'tree') {
        const res = await predictAGBFromTree(item._id);
        setPrediction({ type: 'AGB', result: res.data });
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setPrediction({ error: 'Prediction failed.' });
    } finally {
      setPredicting(false);
    }
  };

  const getTreeColor = (tree) => {
    if (mapMode === 'biomass') {
      const cat = biomassCategory(tree.AGB);
      return BIOMASS_COLORS_HEX[cat] || '#059669';
    }
    if (mapMode === 'carbon') {
      const carbon = tree.AGB != null ? tree.AGB * CARBON_FRACTION : 0;
      const cat = carbonCategory(carbon);
      return CARBON_COLORS_HEX[cat] || '#059669';
    }
    return '#10b981';
  };

  const getTreeIcon = (tree) => {
    if (mapMode === 'biomass') return biomassIcon(tree.AGB);
    if (mapMode === 'carbon') return carbonIcon(tree.AGB);
    return treeIcon;
  };

  const renderLegend = () => {
    if (mapMode === 'biomass') {
      return (
        <>
          <h4>Biomass (kg)</h4>
          {Object.entries(BIOMASS_COLORS_HEX).map(([label, color]) => (
            <div key={label} className="map-legend-item">
              <span className="map-legend-dot" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </>
      );
    }
    if (mapMode === 'carbon') {
      return (
        <>
          <h4>Estimated Carbon (kg)</h4>
          {Object.entries(CARBON_COLORS_HEX).map(([label, color]) => (
            <div key={label} className="map-legend-item">
              <span className="map-legend-dot" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </>
      );
    }
    return (
      <>
        <h4>Legend</h4>
        <div className="map-legend-item"><span className="map-legend-dot" style={{ background: '#16a34a' }} /> Healthy Vegetation</div>
        <div className="map-legend-item"><span className="map-legend-dot" style={{ background: '#d97706' }} /> Moderately Degraded</div>
        <div className="map-legend-item"><span className="map-legend-dot" style={{ background: '#dc2626' }} /> Severely Degraded</div>
        <div className="map-legend-item"><span className="map-legend-dot" style={{ background: '#10b981' }} /> Campus Tree</div>
      </>
    );
  };

  return (
    <div className="maps-page">
      <PageHeader
        title="GIS Map — Tamil Nadu Origin"
        subtitle="High-speed GIS mapping of campus biomass and carbon stock across Tamil Nadu, India."
      />

      {/* Quick Tamil Nadu Campus & Regional Navigation Bar */}
      <div className="map-region-bar" role="navigation" aria-label="Tamil Nadu Regional Presets">
        <span className="map-region-bar__label">
          <span className="tn-flag-dot" /> Tamil Nadu Sites:
        </span>
        <div className="map-region-bar__scroll">
          {TN_CAMPUS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`map-preset-pill ${activePreset === preset.id ? 'map-preset-pill--active' : ''}`}
              onClick={() => handleSelectPreset(preset)}
              title={preset.desc}
            >
              {preset.short}
            </button>
          ))}
        </div>
      </div>

      <div className="maps-layout">
        <div className="maps-map-wrap">
          {/* Floating Top GIS Toolbar inside Map */}
          <div className="map-floating-bar">
            {/* Tile Layer Selector */}
            <div className="map-floating-group">
              <label className="map-floating-label">Basemap:</label>
              <select
                className="map-tile-select"
                value={activeTileId}
                onChange={(e) => handleTileChange(e.target.value)}
                aria-label="Select GIS Tile Layer"
              >
                {Object.values(TILE_PROVIDERS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Performance Engine Selector */}
            <div className="map-floating-group">
              <button
                className={`map-tool-btn ${renderMode === 'canvas' ? 'map-tool-btn--active' : ''}`}
                onClick={() => setRenderMode('canvas')}
                title="Canvas rendering: Blazing fast 60 FPS for 4000+ trees"
              >
                ⚡ Canvas (Fast)
              </button>
              <button
                className={`map-tool-btn ${renderMode === 'markers' ? 'map-tool-btn--active' : ''}`}
                onClick={() => setRenderMode('markers')}
                title="DOM Pin markers with custom icons"
              >
                📍 Pins
              </button>
            </div>

            {/* Quick Actions */}
            <div className="map-floating-group">
              <button
                className="map-tool-btn"
                onClick={handleResetToTamilNadu}
                title="Reset view to central Tamil Nadu, India"
              >
                📍 Reset TN Origin
              </button>
              <button
                className="map-tool-btn"
                onClick={() => setFitTrigger((prev) => prev + 1)}
                title="Fit view to all currently visible trees"
              >
                🔍 Fit Trees
              </button>
              <button
                className={`map-tool-btn ${apiKey ? 'map-tool-btn--has-key' : ''}`}
                onClick={() => {
                  setTempApiKey(apiKey);
                  setShowKeyModal(true);
                }}
                title="Configure GIS Map API Key (Mapbox / MapTiler)"
              >
                🔑 {apiKey ? 'API Key Configured' : 'GIS API Key'}
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingState text="Loading Tamil Nadu GIS map..." />
          ) : (
            <MapContainer
              center={TAMIL_NADU_ORIGIN.center}
              zoom={TAMIL_NADU_ORIGIN.zoom}
              preferCanvas={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                key={`${currentTileConfig.id}-${apiKey}`}
                url={currentTileConfig.url}
                attribution={currentTileConfig.attribution}
                maxZoom={currentTileConfig.maxZoom || 19}
                subdomains={currentTileConfig.subdomains || 'abc'}
                keepBuffer={8}
                updateWhenIdle={false}
                crossOrigin="anonymous"
              />

              <MapFlyController target={flyTarget} onComplete={() => setFlyTarget(null)} />
              <FitBoundsTrigger trigger={fitTrigger} points={allPoints} />

              {/* High-Performance Canvas Rendering Mode */}
              {renderMode === 'canvas' && (
                <>
                  {(mapMode === 'all' || mapMode === 'trees' || mapMode === 'biomass' || mapMode === 'carbon') &&
                    trees.map((t) => {
                      const color = getTreeColor(t);
                      const isSelected = selected?._id === t._id;
                      return (
                        <CircleMarker
                          key={t._id}
                          center={[t.latitude, t.longitude]}
                          radius={isSelected ? 8 : 5}
                          pathOptions={{
                            color: isSelected ? '#ffffff' : color,
                            fillColor: color,
                            fillOpacity: isSelected ? 1 : 0.85,
                            weight: isSelected ? 2.5 : 1.2
                          }}
                          eventHandlers={{
                            click: () => {
                              setSelected({ ...t, kind: 'tree' });
                              setPrediction(null);
                            }
                          }}
                        >
                          <Popup maxWidth={260}>
                            <div className="map-popup">
                              <h4>{t.name || 'Campus Tree'}</h4>
                              <p><strong>Campus / Site:</strong> {t.site || 'Tamil Nadu Plot'}</p>
                              <p><strong>Diameter:</strong> {Number(t.diameter || 0).toFixed(2)} cm</p>
                              <p><strong>Height:</strong> {t.height > 0 ? Number(t.height).toFixed(2) + ' m' : 'Not Available'}</p>
                              <p><strong>AGB:</strong> {t.AGB != null ? Number(t.AGB).toFixed(3) + ' kg' : 'N/A'}</p>
                              <p><strong>Est. Carbon:</strong> {t.carbon != null ? Number(t.carbon).toFixed(3) + ' kg' : 'N/A'}</p>
                              <div className="popup-tag">📍 Tamil Nadu, India</div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}

                  {(mapMode === 'all' || mapMode === 'vegetation') &&
                    vegetation.map((v) => {
                      const color = CONDITION_COLORS_HEX[v.degradationLevel] || '#16a34a';
                      const isSelected = selected?._id === v._id;
                      return (
                        <CircleMarker
                          key={v._id}
                          center={[v.latitude, v.longitude]}
                          radius={isSelected ? 8 : 5}
                          pathOptions={{
                            color: isSelected ? '#ffffff' : color,
                            fillColor: color,
                            fillOpacity: isSelected ? 1 : 0.85,
                            weight: isSelected ? 2.5 : 1.2
                          }}
                          eventHandlers={{
                            click: () => {
                              setSelected({ ...v, kind: 'vegetation' });
                              setPrediction(null);
                            }
                          }}
                        >
                          <Popup maxWidth={260}>
                            <div className="map-popup">
                              <h4>{v.sampleId || 'Vegetation Plot'}</h4>
                              <p><strong>NDVI:</strong> {v.ndvi}</p>
                              <p><strong>Region:</strong> {v.region}</p>
                              <p><strong>Condition:</strong> {v.degradationLevel}</p>
                              <div className="popup-tag">📍 Tamil Nadu, India</div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                </>
              )}

              {/* DOM Marker Pins Mode */}
              {renderMode === 'markers' && (
                <>
                  {(mapMode === 'all' || mapMode === 'trees' || mapMode === 'biomass' || mapMode === 'carbon') &&
                    trees.map((t) => (
                      <Marker
                        key={t._id}
                        position={[t.latitude, t.longitude]}
                        icon={getTreeIcon(t)}
                        eventHandlers={{
                          click: () => {
                            setSelected({ ...t, kind: 'tree' });
                            setPrediction(null);
                          }
                        }}
                      >
                        <Popup maxWidth={260}>
                          <div className="map-popup">
                            <h4>{t.name || 'Campus Tree'}</h4>
                            <p><strong>Campus / Site:</strong> {t.site || 'Tamil Nadu Plot'}</p>
                            <p><strong>Diameter:</strong> {Number(t.diameter || 0).toFixed(2)} cm</p>
                            <p><strong>Height:</strong> {t.height > 0 ? Number(t.height).toFixed(2) + ' m' : 'Not Available'}</p>
                            <p><strong>AGB:</strong> {t.AGB != null ? Number(t.AGB).toFixed(3) + ' kg' : 'N/A'}</p>
                            <p><strong>Est. Carbon:</strong> {t.carbon != null ? Number(t.carbon).toFixed(3) + ' kg' : 'N/A'}</p>
                            <div className="popup-tag">📍 Tamil Nadu, India</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                  {(mapMode === 'all' || mapMode === 'vegetation') &&
                    vegetation.map((v) => (
                      <Marker
                        key={v._id}
                        position={[v.latitude, v.longitude]}
                        icon={vegIcon(v.degradationLevel)}
                        eventHandlers={{
                          click: () => {
                            setSelected({ ...v, kind: 'vegetation' });
                            setPrediction(null);
                          }
                        }}
                      >
                        <Popup maxWidth={260}>
                          <div className="map-popup">
                            <h4>{v.sampleId || 'Vegetation Plot'}</h4>
                            <p><strong>NDVI:</strong> {v.ndvi}</p>
                            <p><strong>Region:</strong> {v.region}</p>
                            <p><strong>Condition:</strong> {v.degradationLevel}</p>
                            <div className="popup-tag">📍 Tamil Nadu, India</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </>
              )}
            </MapContainer>
          )}

          {/* Map bottom-left status indicator */}
          <div className="map-origin-badge">
            <span className="origin-badge-dot" />
            <span>Origin: Tamil Nadu, India (11.1271° N, 78.6569° E)</span>
            <span className="origin-badge-sep">•</span>
            <span className="origin-badge-tiles">Tile: {currentTileConfig.name}</span>
          </div>
        </div>

        {/* Sidebar Controls & Inspection */}
        <aside className="maps-sidebar">
          <div className="maps-sidebar__header">
            {/* Campus filter dropdown */}
            <div className="form-group mb-2">
              <label className="text-xs font-semibold uppercase text-muted tracking-wider">
                Filter Campus / Site:
              </label>
              <select
                className="map-site-select"
                value={selectedSite}
                onChange={(e) => {
                  setSelectedSite(e.target.value);
                  const matched = TN_CAMPUS_PRESETS.find((p) => p.site === e.target.value);
                  if (matched) {
                    setActivePreset(matched.id);
                    setFlyTarget({ center: matched.center, zoom: matched.zoom });
                  } else {
                    setActivePreset('all_tn');
                  }
                }}
              >
                <option value="">All Campuses (Tamil Nadu)</option>
                {TN_CAMPUS_PRESETS.filter((p) => p.site).map((p) => (
                  <option key={p.id} value={p.site}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="map-controls">
              {[
                { key: 'all', label: 'All', env: false },
                { key: 'trees', label: 'Trees', env: false },
                { key: 'vegetation', label: 'Vegetation', env: true },
                { key: 'biomass', label: 'Biomass', env: false },
                { key: 'carbon', label: 'Carbon', env: false }
              ].map(({ key: t, label, env }) => (
                <button
                  key={t}
                  className={`map-mode-btn ${mapMode === t ? (env ? 'map-mode-btn--active-environment' : 'map-mode-btn--active') : ''}`}
                  onClick={() => setMapMode(t)}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="map-search-form">
              <input
                type="text"
                placeholder="Search tree, species, site, plot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>

          <div className="maps-sidebar__body">
            <div className="map-summary">
              <h4>Tamil Nadu Green Assets Summary</h4>
              <div className="map-summary-row">
                <span>Active Trees</span>
                <span>{trees.length.toLocaleString()}</span>
              </div>
              <div className="map-summary-row">
                <span>Total Stored Biomass</span>
                <span>{summary.totalAGB.toLocaleString()} kg</span>
              </div>
              <div className="map-summary-row">
                <span>Estimated Stored Carbon</span>
                <span>{summary.estimatedCarbon.toLocaleString()} kg</span>
              </div>
              <div className="map-summary-row">
                <span>Rendering Speed</span>
                <span className="text-emerald-500 font-semibold">⚡ Ultra-Fast Canvas</span>
              </div>
            </div>

            {mapMode === 'vegetation' && (
              <div className="map-gis-notice">
                <h4>Vegetation GIS Data</h4>
                <p>Vegetation coordinates: {meta?.vegetationWithCoordinates ?? 0} / {meta?.totalVegetation ?? 0} records have coordinates.</p>
                <p className="map-gis-note">Vegetation markers unavailable for this dataset.</p>
              </div>
            )}

            {selected ? (
              <div className="map-detail-panel">
                <h3>{selected.name || selected.sampleId}</h3>
                {selected.kind === 'tree' ? (
                  <>
                    <div className="detail-row"><span>Campus / Site</span><span>{selected.site || 'Tamil Nadu Site'}</span></div>
                    <div className="detail-row"><span>Diameter (DBH)</span><span>{Number(selected.diameter || 0).toFixed(2)} cm</span></div>
                    <div className="detail-row"><span>Height</span><span>{selected.height > 0 ? Number(selected.height).toFixed(2) + ' m' : 'Not Available'}</span></div>
                    <div className="detail-row"><span>Dataset AGB</span><span>{selected.AGB != null ? Number(selected.AGB).toFixed(3) + ' kg' : 'N/A'}</span></div>
                    <div className="detail-row"><span>Dataset Carbon</span><span>{selected.carbon != null ? Number(selected.carbon).toFixed(3) + ' kg' : 'N/A'}</span></div>
                    <div className="detail-row"><span>Coordinates</span><span className="font-mono text-xs">{selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}</span></div>
                    <button className="btn btn-ai w-full mt-3" disabled={predicting} onClick={() => handlePredict(selected)}>
                      {predicting ? 'Predicting...' : 'AI Biomass Predict'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="detail-row"><span>NDVI</span><span>{selected.ndvi}</span></div>
                    <div className="detail-row"><span>Region</span><span>{selected.region}</span></div>
                    <div className="detail-row"><span>Condition</span><span>{selected.degradationLevel}</span></div>
                    <button className="btn btn-ai w-full mt-3" disabled={predicting} onClick={() => handlePredict(selected)}>
                      {predicting ? 'Analyzing...' : 'AI Assess'}
                    </button>
                  </>
                )}

                {prediction?.type === 'AGB' && (
                  <PredictionResult
                    title="AI Predicted AGB"
                    value={`${Number(prediction.result?.prediction?.prediction).toFixed(4)} kg`}
                    carbonValue={prediction.result?.prediction?.prediction * CARBON_FRACTION}
                    carbonNote="Estimated Carbon = AGB × 0.47"
                    modelInfo={<div><div>Model: CatBoost Regression</div><div>Test R²: 0.9959</div></div>}
                    inputFeatures={[
                      { label: 'Diameter', value: `${Number(selected.diameter || 0).toFixed(2)} cm` },
                      { label: 'Height', value: selected.height > 0 ? `${Number(selected.height).toFixed(2)} m` : 'Not Available' }
                    ]}
                  />
                )}

                {prediction?.error && (
                  <div className="warning-banner">
                    <svg className="warning-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{prediction.error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="map-placeholder">
                <p>Click any tree circle to inspect GPS metrics, campus plot, and run AI prediction.</p>
              </div>
            )}

            <div className="map-legend">
              {renderLegend()}
            </div>

            {meta && mapMode !== 'vegetation' && (
              <div className="map-data-quality">
                <h4>Dataset Health</h4>
                <p>Trees with GPS coordinates: {meta.treesWithCoordinates} / {meta.totalTrees}</p>
                <p className="text-xs text-muted mt-1">Origin verified: Tamil Nadu, India</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* API Key Configuration Modal */}
      {showKeyModal && (
        <div className="map-modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="map-modal" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal__header">
              <h3>Configure GIS Map API Key</h3>
              <button
                className="map-modal__close"
                onClick={() => setShowKeyModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="map-modal__body">
              <p className="text-sm text-secondary mb-3">
                Connect your Mapbox or MapTiler token for satellite imagery tiles. Fast CDN providers (Carto Voyager & Esri Satellite) work automatically with <strong>no API key required</strong>.
              </p>
              <div className="form-group mb-3">
                <label className="form-label font-medium text-xs">
                  Mapbox Access Token / MapTiler Key:
                </label>
                <input
                  type="text"
                  className="form-input font-mono text-xs"
                  placeholder="e.g. pk.eyJ1Ijoi..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                />
              </div>
              <div className="map-key-status">
                {apiKey ? (
                  <span className="text-emerald-500 text-xs font-medium">
                    ✓ Key active in local session
                  </span>
                ) : (
                  <span className="text-muted text-xs">
                    ⚡ Using high-speed Carto / Esri CDN tiles (no key needed)
                  </span>
                )}
              </div>
            </div>
            <div className="map-modal__footer">
              {apiKey && (
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={() => {
                    setApiKey('');
                    localStorage.removeItem('agb_gis_api_key');
                    setActiveTileId('cartoVoyager');
                    setShowKeyModal(false);
                  }}
                >
                  Clear Key
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary text-xs ml-auto mr-2"
                onClick={() => setShowKeyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary text-xs"
                onClick={handleSaveApiKey}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maps;
