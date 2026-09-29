function SearchToolbar({ search, onSearchChange, onSearch, filters, onFilterChange, onClear, actions, children }) {
  return (
    <div className="search-toolbar">
      <input
        type="text"
        className="search-toolbar__input"
        placeholder={search?.placeholder || 'Search...'}
        value={search?.value || ''}
        onChange={(e) => onSearchChange?.(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
      />
      {filters?.map((f) => (
        <select
          key={f.name}
          className="search-toolbar__select"
          value={f.value}
          onChange={(e) => onFilterChange?.(f.name, e.target.value)}
        >
          <option value="">{f.placeholder || `All ${f.label}`}</option>
          {f.options?.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
          ))}
        </select>
      ))}
      {onSearch && (
        <button className="btn btn-primary btn-sm" onClick={onSearch}>Search</button>
      )}
      {onClear && (
        <button className="btn btn-secondary btn-sm" onClick={onClear}>Clear</button>
      )}
      {actions}
      {children}
    </div>
  );
}

export default SearchToolbar;
