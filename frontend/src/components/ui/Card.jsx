import { memo } from 'react';

const Card = ({ title, description, icon, action, children, className = '' }) => (
  <div className={`rounded-[24px] bg-white/90 backdrop-blur-md p-6 shadow-card border border-[#E6DED6] transition-all duration-300 hover:shadow-elevated hover:border-[#BD715C]/30 ${className}`}>
    {(title || description || icon || action) && (
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#E6DED6]/60 pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3DED6] text-[#BD715C]">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-bold text-[#292B29]">{title}</h3>}
            {description && <p className="text-xs font-semibold text-[#626760] mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default memo(Card);
