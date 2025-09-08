'use client';

export default function Input({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false,
  error,
  className = '',
  ...props 
}) {
  const inputClasses = `
    w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-steel-blue focus:ring-opacity-50
    ${error 
      ? 'border-red-400 focus:border-red-500' 
      : 'border-gray-300 focus:border-steel-blue'
    }
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gunmetal"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-red-500 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
