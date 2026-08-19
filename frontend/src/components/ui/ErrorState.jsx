import { memo } from 'react';

const ErrorState = ({ title = 'Something went wrong', description = 'Please try again or refresh the page.', action }) => (
  <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center shadow-sm">
    <p className="text-sm uppercase tracking-[0.32em] text-red-600">Error</p>
    <h2 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h2>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default memo(ErrorState);
