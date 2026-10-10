const StatCard = ({ label, value, change, icon, className = '' }) => (
  <div className={`rounded-[24px] bg-white/90 backdrop-blur-md p-6 shadow-card border border-[#E6DED6] transition-all duration-300 hover:shadow-elevated hover:border-[#BD715C]/40 hover:-translate-y-0.5 ${className}`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#626760]">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-[#292B29]">{value}</p>
      </div>
      {icon ? (
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3DED6] text-[#BD715C] shadow-xs">
          {icon}
        </div>
      ) : (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3DED6] text-[#BD715C]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#BD715C]" />
        </div>
      )}
    </div>
    {change && (
      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#7D9588] bg-[#E6EEE8] w-fit px-2.5 py-1 rounded-full border border-[#7D9588]/30">
        <span>{change}</span>
      </div>
    )}
  </div>
);

export default StatCard;
