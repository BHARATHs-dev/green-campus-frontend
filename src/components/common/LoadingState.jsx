function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <span className="loading-state__text">{text}</span>
    </div>
  );
}

export default LoadingState;
