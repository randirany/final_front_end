import { useTranslation } from 'react-i18next';

const FormInput = ({ type = 'text', label, value, onChange, options = [], className = '', placeholder, disabled = false, required = false }) => {
  const { i18n: { language } } = useTranslation();
  const isRTL = language === 'ar' || language === 'he';

  const baseInputClasses = `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 ${
    isRTL ? 'text-right' : 'text-left'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  const labelClasses = `block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`;

  if (type === 'select') {
    return (
      <div>
        <label className={labelClasses}>
          {label}
        </label>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={baseInputClasses}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className={labelClasses}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={baseInputClasses}
      />
    </div>
  );
};

export default FormInput;