const StatCard = ({ label, value, change, icon, className = '' }) => (
  <div className={`rounded-[24px] bg-white p-6 shadow-card border border-[#89D7B7] transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 ${className}`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-[#1A312C]">{value}</p>
      </div>
      {icon ? (
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#89D7B7]/25 text-[#428475] shadow-sm">
          {icon}
        </div>
      ) : (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#89D7B7]/20 text-[#428475]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#428475]" />
        </div>
      )}
    </div>
    {change && (
      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-200">
        <span>{change}</span>
      </div>
    )}
  </div>
);

export default StatCard;
