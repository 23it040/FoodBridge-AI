const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => (
  <div className={className}>
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === tab.value
              ? 'bg-secondary text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
