const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}>
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-sm text-slate-900 outline-none"
    />
    <button type="button" className="text-slate-500 hover:text-secondary">
      Search
    </button>
  </div>
);

export default SearchBar;
