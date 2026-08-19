const Spinner = ({ size = 40, className = '' }) => (
  <div className={`inline-flex items-center justify-center ${className}`}>
    <svg className="animate-spin text-[#428475]" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    </svg>
  </div>
);

export default Spinner;
