import { memo } from 'react';

const variantStyles = {
  default: 'bg-[#FAF7F2] text-[#626760] border border-[#E6DED6]',
  primary: 'bg-[#F3DED6] text-[#BD715C] border border-[#BD715C]/30',
  secondary: 'bg-[#E6EEE8] text-[#7D9588] border border-[#7D9588]/30',
  terracotta: 'bg-[#BD715C] text-white shadow-xs',
  sage: 'bg-[#7D9588] text-white shadow-xs',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  info: 'bg-[#EAF2F4] text-[#487180] border border-[#7196A3]/30',
  outline: 'bg-white text-[#626760] border border-[#E6DED6]'
};

const Badge = ({ variant = 'default', children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${variantStyles[variant] || variantStyles.default} ${className}`}>
    {children}
  </span>
);

export default memo(Badge);
