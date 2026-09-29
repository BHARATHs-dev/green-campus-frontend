import './PageHeader.css';

function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div className="page-header">
      {breadcrumb && <div className="page-header__breadcrumb">{breadcrumb}</div>}
      <div className="page-header__content">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
