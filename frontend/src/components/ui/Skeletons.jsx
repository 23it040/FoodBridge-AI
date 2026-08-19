import Skeleton from './Skeleton';

export const CardSkeleton = () => (
  <div className="space-y-4 rounded-[24px] bg-white p-6 border border-[#89D7B7] shadow-card">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-40 w-full rounded-2xl" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 p-4 rounded-[24px] bg-white border border-[#89D7B7] shadow-card">
    <Skeleton className="h-10 w-full rounded-xl" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-2">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ items = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#89D7B7]/60 shadow-xs">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <Skeleton className="h-56 w-full rounded-[24px]" />
    <div className="lg:col-span-2 space-y-4 rounded-[24px] bg-white p-6 border border-[#89D7B7] shadow-card">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

export const NotificationSkeleton = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full rounded-2xl" />
    ))}
  </div>
);

export const ChartSkeleton = () => <Skeleton className="h-56 w-full rounded-[24px]" />;

export const FormSkeleton = () => (
  <div className="space-y-4 rounded-[24px] bg-white p-6 border border-[#89D7B7] shadow-card">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

export default Skeleton;
