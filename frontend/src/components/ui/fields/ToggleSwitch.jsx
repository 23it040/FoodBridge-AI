const ToggleSwitch = ({ checked, onChange, disabled, label, className = '' }) => (
  <label className={`inline-flex cursor-pointer items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}>
    <span className="text-sm text-slate-700">{label}</span>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
        checked ? 'bg-secondary' : 'bg-slate-300'
      }`}
      disabled={disabled}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

export default ToggleSwitch;
