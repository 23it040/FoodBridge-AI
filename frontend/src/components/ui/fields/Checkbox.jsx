const Checkbox = ({ label, checked, onChange, disabled, className = '' }) => (
  <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-[#292B29] ${disabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="h-5 w-5 rounded border-[#E6DED6] text-[#BD715C] focus:ring-[#BD715C]" />
    <span>{label}</span>
  </label>
);

export default Checkbox;
