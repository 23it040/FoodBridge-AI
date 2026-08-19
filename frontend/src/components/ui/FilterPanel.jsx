const FilterPanel = ({ title = 'Filters', children, className = '' }) => (
  <div className={`rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default FilterPanel;
