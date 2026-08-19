import { memo } from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-[#89D7B7]/25 ${className}`} />
);

export default memo(Skeleton);
