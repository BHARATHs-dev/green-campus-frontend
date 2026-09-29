import './StatusBadge.css';

function StatusBadge() {
  return (
    <div className="status-badge" title="Backend API status">
      <span className="status-badge__dot" />
      <span className="status-badge__label">System Online</span>
    </div>
  );
}

export default StatusBadge;
