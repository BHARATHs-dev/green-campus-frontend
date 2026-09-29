import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

function DataTable({ columns, data, loading, emptyTitle, emptyDescription, rowKey = '_id' }) {
  if (loading) {
    return <LoadingState text="Loading data..." />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No records found'}
        description={emptyDescription || 'Try adjusting your search or filters.'}
      />
    );
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="data-table__th">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row[rowKey] || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
