import { memo } from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No results found', description = 'Try adjusting your filters or search terms.', action }) => (
  <div className="rounded-[24px] border-2 border-dashed border-[#E6DED6] bg-white/80 p-10 text-center shadow-card backdrop-blur-xs">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3DED6] text-[#BD715C] shadow-xs mb-4">
      <FiInbox className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-extrabold text-[#292B29]">{title}</h3>
    <p className="mt-1.5 text-xs font-medium text-[#626760] max-w-md mx-auto">{description}</p>
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);

export default memo(EmptyState);
