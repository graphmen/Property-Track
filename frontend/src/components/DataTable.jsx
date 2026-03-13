import React from 'react';

const DataTable = ({ title, columns, data }) => {
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const val = row[col.key] || '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            Export to CSV
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark">
            Add Records
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-[var(--border)]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-sm">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted italic">
                  No records found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-[var(--border)] bg-gray-50/30 flex justify-between items-center px-6">
        <p className="text-xs text-text-muted">Showing {data?.length || 0} entries</p>
        <div className="flex gap-2">
          <button disabled className="px-3 py-1 bg-white border border-[var(--border)] rounded md:text-xs opacity-50">Previous</button>
          <button disabled className="px-3 py-1 bg-white border border-[var(--border)] rounded md:text-xs opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
