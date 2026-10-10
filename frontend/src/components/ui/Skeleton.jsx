import { memo } from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-[#E6DED6]/60 ${className}`} />
);

export default memo(Skeleton);
