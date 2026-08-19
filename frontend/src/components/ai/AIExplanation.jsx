import AIStatusBadge from './AIStatusBadge';

const AIExplanation = ({ modelName, status, dataSource, foodBridgeTrained, limitations, version }) => {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 mt-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-[#1A312C]">{modelName || 'AI Capability'}</span>
        <AIStatusBadge status={status} />
      </div>
      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200">
        <div><span className="font-semibold">Dataset Source:</span> {dataSource || 'N/A'}</div>
        <div><span className="font-semibold">FoodBridge-Trained:</span> {foodBridgeTrained ? 'True' : 'False'}</div>
        {version && <div><span className="font-semibold">Version:</span> {version}</div>}
        {limitations && <div className="text-slate-500 italic pt-0.5">{limitations}</div>}
      </div>
    </div>
  );
};

export default AIExplanation;
