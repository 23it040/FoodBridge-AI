import { memo } from 'react';

const Card = ({ title, description, icon, action, children, className = '' }) => (
  <div className={`rounded-[24px] bg-white p-6 shadow-card border border-[#89D7B7] transition-all duration-300 hover:shadow-elevated ${className}`}>
    {(title || description || icon || action) && (
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#89D7B7]/20 text-[#428475]">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-bold text-[#1A312C]">{title}</h3>}
            {description && <p className="text-xs font-medium text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default memo(Card);
