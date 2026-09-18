import { memo } from 'react';

const variantStyles = {
  primary: 'bg-[#2F8F72] text-white hover:bg-[#102A2A] active:bg-[#102A2A] shadow-md',
  secondary: 'bg-[#E8F6F0] text-[#102A2A] border border-[#79D6B2]/40 hover:bg-[#79D6B2]/30 hover:border-[#79D6B2] shadow-sm',
  outline: 'bg-white border-2 border-[#2F8F72] text-[#2F8F72] hover:bg-[#2F8F72] hover:text-white',
  ghost: 'bg-transparent text-[#2F8F72] hover:bg-[#E8F6F0] hover:text-[#102A2A]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md'
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs font-semibold',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3.5 text-base font-semibold'
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const selectedVariant = variantStyles[variant] || variantStyles.primary;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#428475]/40 disabled:cursor-not-allowed disabled:opacity-50 ${selectedVariant} ${selectedSize} ${className}`;

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default memo(Button);
