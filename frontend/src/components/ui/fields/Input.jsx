const Input = ({ label, error, helperText, className = '', ...props }) => (
  <label className="space-y-2 text-sm text-slate-700">
    {label && <span className="font-medium">{label}</span>}
    <input
      className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20 ${
        error ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
      } ${className}`}
      {...props}
    />
    {error ? <p className="text-xs text-red-600">{error}</p> : helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
  </label>
);

export default Input;
