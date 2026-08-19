import { memo } from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No results found', description = 'Try adjusting your filters or search terms.', action }) => (
  <div className="rounded-[24px] border-2 border-dashed border-[#89D7B7] bg-white/80 p-10 text-center shadow-card backdrop-blur-xs">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#89D7B7]/25 text-[#428475] shadow-sm mb-4">
      <FiInbox className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-extrabold text-[#1A312C]">{title}</h3>
    <p className="mt-1.5 text-xs font-medium text-slate-500 max-w-md mx-auto">{description}</p>
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);

export default memo(EmptyState);
