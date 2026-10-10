const Input = ({ label, error, helperText, className = '', ...props }) => (
  <label className="space-y-2 text-sm text-[#292B29]">
    {label && <span className="font-semibold text-xs uppercase tracking-wider text-[#626760]">{label}</span>}
    <input
      className={`w-full rounded-xl border px-4 py-3 text-sm text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20 ${
        error ? 'border-red-500 focus:border-red-500' : 'border-[#E6DED6] bg-white'
      } ${className}`}
      {...props}
    />
    {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : helperText ? <p className="text-xs text-[#626760]">{helperText}</p> : null}
  </label>
);

export default Input;
