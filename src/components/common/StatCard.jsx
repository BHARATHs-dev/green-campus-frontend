import './StatCard.css';

function StatCard({ label, value, trend, trendUp }) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {trend && (
        <span className={`stat-card__trend ${trendUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
  );
}

export default StatCard;
