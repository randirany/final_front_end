import { useTranslation } from 'react-i18next';

const StatCard = ({
  icon,
  title,
  value,
  color = 'blue',
  className = '',
  suffix = '',
  onClick = null,
  loading = false
}) => {
  const { i18n: { language } } = useTranslation();
  const isRTL = language === 'ar' || language === 'he';

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-800',
      icon: 'text-blue-600 dark:text-blue-300'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-800',
      icon: 'text-green-600 dark:text-green-300'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-800',
      icon: 'text-red-600 dark:text-red-300'
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-300'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-800',
      icon: 'text-purple-600 dark:text-purple-300'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-800',
      icon: 'text-orange-600 dark:text-orange-300'
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-800',
      icon: 'text-indigo-600 dark:text-indigo-300'
    }
  };

  const cardClasses = `bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-200 ${
    onClick ? 'cursor-pointer hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700' : ''
  } ${className}`;

  const handleClick = onClick ? () => onClick() : undefined;

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="flex items-center animate-pulse">
          <div className={`p-3 rounded-full bg-gray-200 dark:bg-gray-700`}>
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className={`${isRTL ? 'mr-4' : 'ml-4'} flex-1`}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full transition-all duration-200 ${colorClasses[color]?.bg || colorClasses.blue.bg}`}>
          <div className={`w-6 h-6 transition-colors duration-200 ${colorClasses[color]?.icon || colorClasses.blue.icon}`}>
            {icon}
          </div>
        </div>
        <div className={`${isRTL ? 'mr-4' : 'ml-4'} flex-1`}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            {typeof value === 'number' ? value.toLocaleString() : value} {suffix}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;