const ToggleSwitch = ({ checked, onChange, disabled, label, className = '' }) => (
  <label className={`inline-flex cursor-pointer items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}>
    <span className="text-sm font-semibold text-[#292B29]">{label}</span>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? 'bg-[#BD715C]' : 'bg-[#E6DED6]'
      }`}
      disabled={disabled}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

export default ToggleSwitch;
