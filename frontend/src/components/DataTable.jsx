import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 25;

const DataTable = ({ title, columns, data }) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((data?.length || 0) / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageData = (data || []).slice(startIdx, startIdx + PAGE_SIZE);

  // Reset to page 1 if data changes
  React.useEffect(() => { setPage(1); }, [data?.length]);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = columns.map(col => `"${col.header}"`).join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col.key] ?? '';
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
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 md:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs text-text-muted mt-0.5">{data?.length || 0} records total</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!data || data.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm font-bold hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          title="Download this table as a CSV file"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-primary/10 border-b-2 border-primary/20">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-primary whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageData.length > 0 ? (
              pageData.map((row, rowIdx) => (
                <tr key={rowIdx} className={`transition-colors hover:bg-primary/5 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-3.5 text-sm whitespace-nowrap">
                      {row[col.key] ?? '—'}
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

      <div className="p-4 md:p-6 bg-gray-50/30 flex items-center justify-between gap-4 border-t border-[var(--border)]">
        <p className="text-xs text-text-muted font-medium">
          Showing {Math.min(startIdx + 1, data?.length || 0)}–{Math.min(startIdx + PAGE_SIZE, data?.length || 0)} of {data?.length || 0} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] bg-white hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <span className="text-xs font-bold text-text-muted px-2">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] bg-white hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
