import { memo } from 'react';

const variantStyles = {
  default: 'bg-[#E8F6F0] text-[#102A2A] border border-[#79D6B2]/40',
  primary: 'bg-[#2F8F72] text-white',
  secondary: 'bg-[#79D6B2]/25 text-[#102A2A] border border-[#79D6B2]/40',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-red-50 text-red-800 border border-red-200',
  info: 'bg-sky-50 text-sky-800 border border-sky-200',
  outline: 'bg-white text-slate-700 border border-slate-300'
};

const Badge = ({ variant = 'default', children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${variantStyles[variant] || variantStyles.default} ${className}`}>
    {children}
  </span>
);

export default memo(Badge);
