const Pagination = ({ currentPage, totalPages, onChange, className = '' }) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-full px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
      >
        Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onChange(page)}
          className={`rounded-full px-3 py-2 text-sm transition ${
            currentPage === page ? 'bg-secondary text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-full px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
