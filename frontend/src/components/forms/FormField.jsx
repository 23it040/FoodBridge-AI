const FormField = ({ label, htmlFor, children, helpText }) => (
  <div className="space-y-2">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
    {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
  </div>
);

export default FormField;
