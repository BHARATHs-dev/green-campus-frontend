import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import './AppHeader.css';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const labels = {
    '': 'Dashboard',
    trees: 'Tree Inventory',
    vegetation: 'Vegetation',
    maps: 'GIS Map',
    biomass: 'Biomass',
    carbon: 'Carbon',
    reports: 'Reports',
    prediction: 'AI Prediction',
    settings: 'Settings',
    admin: 'Administration',
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/" className="breadcrumbs__home">Home</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = labels[name] || name;

        return (
          <span key={name} className="breadcrumbs__item">
            <span className="breadcrumbs__sep">/</span>
            {isLast ? (
              <span className="breadcrumbs__current">{label}</span>
            ) : (
              <Link to={routeTo} className="breadcrumbs__link">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function AppHeader({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button className="app-header__menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Breadcrumbs />
      </div>
      <div className="app-header__right">
        <div className="app-header__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search..." className="app-header__search-input" />
        </div>
        <StatusBadge />
        <div className="app-header__user">
          <div className="app-header__avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="app-header__user-info">
            <span className="app-header__user-name">{user?.name}</span>
            <span className="app-header__user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
