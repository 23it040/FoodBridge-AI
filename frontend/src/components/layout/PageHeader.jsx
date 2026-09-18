const PageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div className={`mb-6 flex flex-col gap-4 rounded-[24px] bg-white p-6 shadow-card border border-[#DDE5E1] transition-all duration-200 hover:border-[#79D6B2]/50 sm:flex-row sm:items-center sm:justify-between ${className}`}>
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-[#102A2A]">{title}</h1>
      {subtitle && <p className="mt-1 text-xs font-semibold text-[#687370]">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
