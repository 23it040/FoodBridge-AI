const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => (
  <div className={className}>
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab.value
              ? 'bg-[#BD715C] text-white shadow-xs'
              : 'bg-[#FAF7F2] text-[#626760] border border-[#E6DED6] hover:bg-[#F3DED6]/40 hover:text-[#292B29]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div className="mt-4">{tabs.find((tab) => tab.value === activeTab)?.content}</div>
  </div>
);

export default Tabs;
