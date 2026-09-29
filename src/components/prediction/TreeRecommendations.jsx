import { useState, useMemo } from 'react';
import './TreeRecommendations.css';

const TREE_SPECIES_DATABASE = [
  {
    id: 'saman',
    commonName: 'Saman / Rain Tree',
    scientificName: 'Samanea saman',
    family: 'Fabaceae',
    group: 'canopy',
    groupLabel: 'Canopy Shade',
    matureAgbRange: '800 – 1,500+ kg/tree',
    annualCo2: '~45 kg CO₂/yr',
    growthRate: 'Rapid',
    woodDensity: '0.56 g/cm³',
    biomassTier: 'maximum',
    recommendedFor: ['maximum_biomass', 'canopy_shade', 'nitrogen_fixation'],
    whyRecommend: 'Massive crown spread (up to 30m) creates extreme visual biomass and carbon stock. Nitrogen-fixing root nodules enrich surrounding soil.',
    canopyRole: 'Dominant overstory crown (up to 30m diameter), maximizing regional spatial canopy density in remote sensing imagery.',
    suitableSites: ['Nestor Macias RGB', 'Carlos Vera Arteaga RGB', 'Flora Pluas RGB', 'Campus Open Zones'],
    carbonRank: 'Top Tier (Extreme AGB)',
  },
  {
    id: 'guayacan',
    commonName: 'Guayacán Rosado',
    scientificName: 'Tabebuia rosea',
    family: 'Bignoniaceae',
    group: 'timber',
    groupLabel: 'Native Hardwood',
    matureAgbRange: '450 – 750 kg/tree',
    annualCo2: '~28 kg CO₂/yr',
    growthRate: 'Moderate',
    woodDensity: '0.62 g/cm³',
    biomassTier: 'high',
    recommendedFor: ['maximum_biomass', 'timber_value', 'windbreak'],
    whyRecommend: 'High wood density ensures dense, durable carbon sequestration. Deep taproot prevents wind throw and stabilizes sloping campus terrain.',
    canopyRole: 'Dense mid-to-upper canopy emergent with high structural stability and durable wood density.',
    suitableSites: ['Nestor Macias RGB', 'Carlos Vera Guevara RGB', 'Leonor Aspiazu RGB'],
    carbonRank: 'High Biomass Reservoir',
  },
  {
    id: 'mahogany',
    commonName: 'Caoba / Mahogany',
    scientificName: 'Swietenia macrophylla',
    family: 'Meliaceae',
    group: 'timber',
    groupLabel: 'High-Value Timber',
    matureAgbRange: '500 – 900 kg/tree',
    annualCo2: '~35 kg CO₂/yr',
    growthRate: 'Moderate',
    woodDensity: '0.65 g/cm³',
    biomassTier: 'maximum',
    recommendedFor: ['maximum_biomass', 'permanent_carbon', 'timber_value'],
    whyRecommend: 'Prized native timber tree that locks carbon into hardwood for decades. Ideal for dedicated permanent carbon sequestration blocks.',
    canopyRole: 'Long-term high-density carbon sink that builds durable regional biomass density year after year.',
    suitableSites: ['Carlos Vera Arteaga RGB', 'Manuel Macias RGB', 'Nestor Macias RGB'],
    carbonRank: 'Long-Term Carbon Lock',
  },
  {
    id: 'cedro',
    commonName: 'Spanish Cedar / Cedro',
    scientificName: 'Cedrela odorata',
    family: 'Meliaceae',
    group: 'timber',
    groupLabel: 'Fast Timber',
    matureAgbRange: '350 – 600 kg/tree',
    annualCo2: '~25 kg CO₂/yr',
    growthRate: 'Fast',
    woodDensity: '0.48 g/cm³',
    biomassTier: 'fast_growing',
    recommendedFor: ['fast_growing', 'timber_value', 'agroforestry'],
    whyRecommend: 'Fast juvenile growth rate with straight trunk architecture. Readily combines with lower-strata fruit and cacao crops.',
    canopyRole: 'Vertical upper canopy builder that quickly raises plot-level vegetative spectral response.',
    suitableSites: ['Flora Pluas RGB', 'Nestor Macias RGB', 'Leonor Aspiazu RGB'],
    carbonRank: 'Rapid Biomass Builder',
  },
  {
    id: 'laurel',
    commonName: 'Laurel / Cordia',
    scientificName: 'Cordia alliodora',
    family: 'Boraginaceae',
    group: 'agroforestry',
    groupLabel: 'Agroforestry Shade',
    matureAgbRange: '300 – 520 kg/tree',
    annualCo2: '~22 kg CO₂/yr',
    growthRate: 'Fast',
    woodDensity: '0.52 g/cm³',
    biomassTier: 'agroforestry',
    recommendedFor: ['agroforestry', 'fast_growing', 'timber_value'],
    whyRecommend: 'Self-pruning tall trunk that casts light, dappled shade. The single best companion overstory for cacao and coffee multi-strata systems.',
    canopyRole: 'Permeable high shade canopy that preserves understory photosynthesis while adding high biomass density.',
    suitableSites: ['Nestor Macias RGB', 'Carlos Vera Guevara RGB', 'Manuel Macias RGB'],
    carbonRank: 'Agroforestry Champion',
  },
  {
    id: 'guaba',
    commonName: 'Guaba / Inga',
    scientificName: 'Inga edulis',
    family: 'Fabaceae',
    group: 'restorative',
    groupLabel: 'Soil Restorative',
    matureAgbRange: '200 – 400 kg/tree',
    annualCo2: '~18 kg CO₂/yr',
    growthRate: 'Very Fast',
    woodDensity: '0.45 g/cm³',
    biomassTier: 'fast_growing',
    recommendedFor: ['fast_growing', 'nitrogen_fixation', 'restorative'],
    whyRecommend: 'High-speed biomass accumulation coupled with aggressive nitrogen fixation. Generates nutrient-rich leaf mulch that increases soil carbon.',
    canopyRole: 'Pioneer rapid-closure canopy that revives degraded parcels and accelerates green index values (NDVI/SAVI).',
    suitableSites: ['All Campus Plots', 'Degraded Soils', 'Nestor Macias RGB'],
    carbonRank: 'Soil & Biomass Restorer',
  },
  {
    id: 'balsa',
    commonName: 'Balsa',
    scientificName: 'Ochroma pyramidale',
    family: 'Malvaceae',
    group: 'pioneer',
    groupLabel: 'Pioneer Ultra-Fast',
    matureAgbRange: '250 – 500 kg/tree',
    annualCo2: '~30 kg CO₂/yr',
    growthRate: 'Very Fast',
    woodDensity: '0.16 g/cm³',
    biomassTier: 'fast_growing',
    recommendedFor: ['fast_growing', 'restorative', 'maximum_biomass'],
    whyRecommend: 'Fastest growing tropical tree (up to 5m/year). Rapidly creates massive green foliage and pioneer canopy cover across open ground.',
    canopyRole: 'First-wave pioneer canopy: establishes complete vegetative cover in under 3 years to maximize satellite reflectance.',
    suitableSites: ['All Campus Plots', 'Open Plots', 'Flora Pluas RGB'],
    carbonRank: 'Pioneer Biomass Accelerator',
  },
  {
    id: 'cacao',
    commonName: 'Cacao Fino de Aroma',
    scientificName: 'Theobroma cacao',
    family: 'Malvaceae',
    group: 'agroforestry',
    groupLabel: 'Productive Agroforestry',
    matureAgbRange: '80 – 160 kg/tree',
    annualCo2: '~12 kg CO₂/yr',
    growthRate: 'Moderate',
    woodDensity: '0.50 g/cm³',
    biomassTier: 'agroforestry',
    recommendedFor: ['agroforestry', 'soil_carbon', 'crop_yield'],
    whyRecommend: 'Understory perennial crop that sustains steady biomass while generating economic value and supporting ground-level biodiversity.',
    canopyRole: 'Dense sub-canopy layer (3–6m) that enriches ground-cover biomass and prevents bare-ground optical reflectance.',
    suitableSites: ['Nestor Macias RGB', 'Carlos Vera Arteaga RGB', 'Flora Pluas RGB'],
    carbonRank: 'Productive Understory',
  },
  {
    id: 'mango',
    commonName: 'Mango',
    scientificName: 'Mangifera indica',
    family: 'Anacardiaceae',
    group: 'fruit',
    groupLabel: 'Fruit & Canopy',
    matureAgbRange: '400 – 700 kg/tree',
    annualCo2: '~26 kg CO₂/yr',
    growthRate: 'Moderate',
    woodDensity: '0.60 g/cm³',
    biomassTier: 'high',
    recommendedFor: ['canopy_shade', 'fruit_yield', 'windbreak'],
    whyRecommend: 'Dense evergreen crown with high leaf density that resists drought. Provides continuous canopy biomass, shade, and fruit yield.',
    canopyRole: 'Year-round evergreen canopy cover that maintains elevated satellite spectral index signals even during dry seasons.',
    suitableSites: ['Campus Green Spaces', 'Nestor Macias RGB', 'Carlos Vera Guevara RGB'],
    carbonRank: 'Evergreen Canopy Block',
  },
];

function TreeRecommendations({
  agb = null,
  site = null,
  group = null,
  unit = 'kg',
  isDensity = false,
  predictionType = 'tree',
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'maximum' | 'agroforestry' | 'fast_growing'

  const numAgb = agb != null ? Number(agb) : null;
  const isSatellite = isDensity || unit === 'Mg/ha' || predictionType === 'satellite';

  // Determine site/biomass context
  const contextMessage = useMemo(() => {
    if (numAgb == null) {
      return isSatellite
        ? 'Recommended canopy species to optimize regional Above-Ground Biomass Density (AGBD) and landscape carbon storage:'
        : 'Recommended species to optimize Above-Ground Biomass (AGB) and carbon storage for your site:';
    }

    if (isSatellite) {
      if (numAgb < 20) {
        return `Detected canopy biomass density is low (${numAgb.toFixed(2)} Mg/ha). Recommended Strategy: Fast-growing pioneer reforestation and nitrogen-fixers (Inga edulis, Balsa, Laurel) to rapidly establish canopy closure and restore soil carbon.`;
      }
      if (numAgb < 60) {
        return `Detected canopy biomass density is moderate (${numAgb.toFixed(2)} Mg/ha). Recommended Strategy: Canopy enrichment planting. Introduce high-density timber hardwoods (Guayacán, Mahogany, Saman) to escalate biomass density toward mature forest capacity (>80 Mg/ha).`;
      }
      return `Detected canopy biomass density is high (${numAgb.toFixed(2)} Mg/ha). Recommended Strategy: Conservation and multi-strata maintenance. Preserve primary hardwood carbon reservoirs while maintaining biodiverse understory layers to sustain maximum equilibrium.`;
    }

    // Individual Tree (kg)
    if (numAgb < 15) {
      return `Predicted AGB is juvenile/low (${numAgb.toFixed(2)} kg). We recommend rapid biomass builders and nitrogen-fixing companion species to accelerate biomass accumulation:`;
    }
    if (numAgb < 100) {
      return `Predicted AGB is moderate (${numAgb.toFixed(2)} kg). Integrate multi-strata timber and shade canopy species to significantly scale total plot biomass:`;
    }
    return `Predicted AGB is high (${numAgb.toFixed(2)} kg). Recommend long-term high-density hardwoods and large canopy reservoirs to maintain peak carbon storage:`;
  }, [numAgb, isSatellite]);

  const filteredSpecies = useMemo(() => {
    if (filter === 'all') return TREE_SPECIES_DATABASE;
    if (filter === 'maximum') {
      return TREE_SPECIES_DATABASE.filter(s => s.biomassTier === 'maximum' || s.biomassTier === 'high');
    }
    if (filter === 'agroforestry') {
      return TREE_SPECIES_DATABASE.filter(s => s.group === 'agroforestry' || s.group === 'canopy');
    }
    if (filter === 'fast_growing') {
      return TREE_SPECIES_DATABASE.filter(
        s => s.growthRate === 'Rapid' || s.growthRate === 'Very Fast' || s.growthRate === 'Fast'
      );
    }
    return TREE_SPECIES_DATABASE;
  }, [filter]);

  return (
    <div className="tree-recs-card">
      <div className="tree-recs-card__header">
        <div className="tree-recs-card__title-group">
          <div className="tree-recs-card__icon-wrapper">
            <svg className="tree-recs-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              <path d="M7 21a5 5 0 0 1 10 0" />
              <path d="M12 14v7" />
              <path d="m19 14-3 3" />
              <path d="m5 14 3 3" />
            </svg>
          </div>
          <div>
            <h4 className="tree-recs-card__title">
              {isSatellite
                ? 'Canopy Species Recommendations for AGBD Enhancement'
                : 'Recommended Tree Species for AGB Enhancement'}
            </h4>
            <p className="tree-recs-card__subtitle">
              {isSatellite
                ? 'Scientifically curated tree species to maximize canopy biomass density (Mg/ha) and carbon sequestration across campus zones'
                : `Scientifically curated species to maximize biomass density and carbon sequestration${site ? ` for site "${site}"` : ''}`}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="tree-recs-filter-group" role="tablist" aria-label="Tree recommendation filters">
          <button
            type="button"
            className={`tree-recs-filter-btn ${filter === 'all' ? 'tree-recs-filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Species ({TREE_SPECIES_DATABASE.length})
          </button>
          <button
            type="button"
            className={`tree-recs-filter-btn ${filter === 'maximum' ? 'tree-recs-filter-btn--active' : ''}`}
            onClick={() => setFilter('maximum')}
          >
            Max Biomass
          </button>
          <button
            type="button"
            className={`tree-recs-filter-btn ${filter === 'agroforestry' ? 'tree-recs-filter-btn--active' : ''}`}
            onClick={() => setFilter('agroforestry')}
          >
            Agroforestry &amp; Canopy
          </button>
          <button
            type="button"
            className={`tree-recs-filter-btn ${filter === 'fast_growing' ? 'tree-recs-filter-btn--active' : ''}`}
            onClick={() => setFilter('fast_growing')}
          >
            Rapid Growth
          </button>
        </div>
      </div>

      {/* Context banner */}
      <div className="tree-recs-context-banner">
        <svg className="tree-recs-context-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{contextMessage}</span>
      </div>

      {/* Species Cards Grid */}
      <div className="tree-recs-grid">
        {filteredSpecies.map((species) => {
          const isSiteMatch =
            site &&
            species.suitableSites.some(
              (s) => s.toLowerCase().includes(site.toLowerCase()) || s.includes('Campus') || s.includes('All')
            );

          return (
            <div key={species.id} className="tree-rec-item">
              <div className="tree-rec-item__top">
                <div className="tree-rec-item__header-left">
                  <h5 className="tree-rec-item__name">{species.commonName}</h5>
                  <span className="tree-rec-item__scientific">
                    {species.scientificName} ({species.family})
                  </span>
                </div>
                <span className="tree-rec-item__badge">{species.groupLabel}</span>
              </div>

              {/* Metrics Strip */}
              <div className="tree-rec-item__metrics">
                <div className="tree-rec-metric">
                  <span className="tree-rec-metric__label">Mature AGB</span>
                  <span className="tree-rec-metric__value">{species.matureAgbRange}</span>
                </div>
                <div className="tree-rec-metric">
                  <span className="tree-rec-metric__label">Est. CO₂ Sequestration</span>
                  <span className="tree-rec-metric__value tree-rec-metric__value--co2">{species.annualCo2}</span>
                </div>
                <div className="tree-rec-metric">
                  <span className="tree-rec-metric__label">Growth Rate</span>
                  <span className="tree-rec-metric__value">{species.growthRate}</span>
                </div>
                <div className="tree-rec-metric">
                  <span className="tree-rec-metric__label">Wood Density</span>
                  <span className="tree-rec-metric__value">{species.woodDensity}</span>
                </div>
              </div>

              {/* Rationale / Why Recommend */}
              <p className="tree-rec-item__desc">
                {isSatellite && species.canopyRole ? species.canopyRole : species.whyRecommend}
              </p>

              {/* Footer Tags */}
              <div className="tree-rec-item__footer">
                <span className="tree-rec-tag tree-rec-tag--rank">{species.carbonRank}</span>
                {isSiteMatch && (
                  <span className="tree-rec-tag tree-rec-tag--site">Recommended for {site}</span>
                )}
                {isSatellite && (
                  <span className="tree-rec-tag" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-200)' }}>
                    Canopy Target: {species.group === 'canopy' || species.group === 'timber' ? 'Overstory Matrix' : 'Sub-Canopy Layer'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ecological Multi-Strata Takeaway */}
      <div className="tree-recs-footer-tip">
        <div className="tree-recs-footer-tip__icon">💡</div>
        <div className="tree-recs-footer-tip__text">
          {isSatellite ? (
            <span>
              <strong>Spatial Canopy Density Strategy:</strong> Interplanting fast-growing pioneer cover (<em>Balsa</em> / <em>Inga</em>) alongside large-crown dominant canopy trees (<em>Samanea saman</em>) and dense timber hardwoods (<em>Guayacán Rosado</em>) accelerates vegetative spectral response (NDVI/SAVI) and boosts total above-ground biomass density (AGBD) by up to <strong>160%</strong> per hectare.
            </span>
          ) : (
            <span>
              <strong>Agroforestry Maximization Strategy:</strong> Combining deep-rooting native timber (<em>Guayacán Rosado</em> / <em>Caoba</em>) with high-canopy shade (<em>Samanea saman</em>) and nitrogen-fixing companion species (<em>Inga edulis</em>) creates multi-strata vertical layering that can increase total plot Above-Ground Biomass by up to <strong>140%</strong> compared to monoculture plantings.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TreeRecommendations;
