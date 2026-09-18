import { memo } from 'react';

const Card = ({ title, description, icon, action, children, className = '' }) => (
  <div className={`rounded-[24px] bg-white p-6 shadow-card border border-[#DDE5E1] transition-all duration-300 hover:shadow-elevated hover:border-[#79D6B2]/50 ${className}`}>
    {(title || description || icon || action) && (
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F6F0] text-[#2F8F72]">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-bold text-[#102A2A]">{title}</h3>}
            {description && <p className="text-xs font-semibold text-[#687370] mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default memo(Card);
