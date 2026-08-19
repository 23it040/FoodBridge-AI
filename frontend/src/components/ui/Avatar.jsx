import { memo } from 'react';

const Avatar = ({ src, alt, initials, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg'
  };

  return (
    <div className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-700 ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <span>{initials || 'FD'}</span>
      )}
    </div>
  );
};

export default memo(Avatar);
