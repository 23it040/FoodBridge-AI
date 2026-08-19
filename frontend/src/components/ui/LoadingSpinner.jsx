const LoadingSpinner = ({ size = 32, label = 'Loading...' }) => (
  <div className="flex items-center gap-3 text-slate-600">
    <svg
      className="animate-spin text-secondary"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default LoadingSpinner;
