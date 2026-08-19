import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../EmptyState';
import Spinner from '../Spinner';

const defaultStringSearch = (row, query, columns) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return columns.some((column) => {
    const cellValue = column.render ? String(column.render(row)) : String(row[column.key] ?? '');
    return cellValue.toLowerCase().includes(normalizedQuery);
  });
};

const compareValues = (a, b, order) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return order === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return order === 'asc' ? -1 : 1;

  const aString = String(a).toLowerCase();
  const bString = String(b).toLowerCase();

  if (aString < bString) return order === 'asc' ? -1 : 1;
  if (aString > bString) return order === 'asc' ? 1 : -1;
  return 0;
};

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  rowsPerPage = 10,
  initialPage = 1,
  initialSort = null,
  showSearch = true,
  showPagination = true,
  emptyMessage = 'No records available.',
  searchPlaceholder = 'Search...',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortConfig, setSortConfig] = useState(initialSort);

  const safeData = useMemo(() => data || [], [data]);

  const filteredData = useMemo(() => {
    return safeData.filter((row) => defaultStringSearch(row, searchQuery, columns));
  }, [safeData, searchQuery, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, order, accessor } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const valA = accessor ? accessor(a) : a[key];
      const valB = accessor ? accessor(b) : b[key];
      return compareValues(valA, valB, order);
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleSort = (column) => {
    if (!column.sortable) return;

    setSortConfig((prev) => {
      if (prev?.key !== column.key) {
        return { key: column.key, order: 'asc', accessor: column.accessor };
      }
      return {
        ...prev,
        order: prev.order === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={className}>
      {showSearch && (
        <div className="mb-4 rounded-2xl border border-[#89D7B7] bg-white px-4 py-3 shadow-card">
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/30 px-4 py-2.5 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
            aria-label="Search table"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-[#89D7B7] bg-white shadow-card">
        <div className="max-h-[600px] overflow-auto">
          <table className="min-w-full divide-y divide-[#89D7B7]/30 text-left">
            <thead className="sticky top-0 z-10 bg-[#1A312C] text-white shadow-sm">
              <tr>
                {columns.map((column) => {
                  const isActiveSort = sortConfig?.key === column.key;
                  return (
                    <th
                      key={column.key}
                      className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#89D7B7] ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                      onClick={() => toggleSort(column)}
                      scope="col"
                      aria-sort={isActiveSort ? (sortConfig.order === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.title}</span>
                        {column.sortable && (
                          <span className="text-xs text-[#89D7B7]/70">{isActiveSort ? (sortConfig.order === 'asc' ? '↑' : '↓') : '↕'}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-10 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12">
                    <EmptyState title="No records found" description={emptyMessage} />
                  </td>
                </tr>
              ) : (
                currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="transition-colors hover:bg-[#89D7B7]/10">
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 text-sm font-medium text-[#1A312C]">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && !loading && sortedData.length > rowsPerPage && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#89D7B7] bg-white px-5 py-3 text-sm text-[#1A312C] shadow-card">
          <div className="font-semibold text-xs text-slate-600">
            Page {currentPage} of {totalPages} ({sortedData.length} records)
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-[#428475] px-3.5 py-1.5 text-xs font-semibold text-[#428475] transition hover:bg-[#428475] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  page === currentPage
                    ? 'bg-[#428475] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-[#89D7B7]/20'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-[#428475] px-3.5 py-1.5 text-xs font-semibold text-[#428475] transition hover:bg-[#428475] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
