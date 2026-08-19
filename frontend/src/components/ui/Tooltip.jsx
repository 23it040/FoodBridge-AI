const Tooltip = ({ label, content, position = 'top', className = '' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="group relative inline-block">
      <div className={className}>{label}</div>
      <div
        className={`pointer-events-none absolute z-10 hidden rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-lg group-hover:block ${positionClasses[position]}`}
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
