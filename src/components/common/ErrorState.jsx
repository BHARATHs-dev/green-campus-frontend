function ErrorState({ title = 'Unable to load data', message = 'Please try again later.', onRetry }) {
  return (
    <div className="error-state">
      <svg className="error-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="error-state__title">{title}</div>
      <div className="error-state__message">{message}</div>
      {onRetry && (
        <button className="btn btn-primary error-state__action" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
