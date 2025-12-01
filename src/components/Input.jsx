const Input = ({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  onChange,
  required,
  disabled,
}) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
    {label}
    <input
      className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100 disabled:text-slate-500"
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      required={required}
      disabled={disabled}
    />
  </label>
);

export default Input;



