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
      <div className="p-4 md:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-semibold hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            {/* <Download size={16} /> */} {/* Assuming Download icon would be imported */}
            Export to CSV
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md">
            Add Records
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50/50">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
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
      
      <div className="p-4 md:p-6 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
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
