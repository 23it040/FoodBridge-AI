const Input = ({ label, error, helperText, className = '', ...props }) => (
  <label className="space-y-2 text-sm text-[#102A2A]">
    {label && <span className="font-semibold text-xs uppercase tracking-wider text-[#687370]">{label}</span>}
    <input
      className={`w-full rounded-xl border px-4 py-3 text-sm text-[#102A2A] outline-none transition focus:border-[#2F8F72] focus:ring-2 focus:ring-[#2F8F72]/20 ${
        error ? 'border-red-500 focus:border-red-500' : 'border-[#DDE5E1] bg-white'
      } ${className}`}
      {...props}
    />
    {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : helperText ? <p className="text-xs text-[#687370]">{helperText}</p> : null}
  </label>
);

export default Input;
