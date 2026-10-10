const RadioButton = ({ label, name, checked, value, onChange, disabled, className = '' }) => (
  <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-[#292B29] ${disabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-5 w-5 rounded-full border-[#E6DED6] text-[#BD715C] focus:ring-[#BD715C]"
    />
    <span>{label}</span>
  </label>
);

export default RadioButton;
