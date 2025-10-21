import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createRoadService } from '../services/roadServiceApi';

const AddRoadServiceModal = ({ isOpen, onClose, onRoadServiceAdded, companies }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    company_id: '',
    service_name: '',
    normal_price: '',
    old_car_price: '',
    cutoff_year: '2007',
    description: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen, loading]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        company_id: '',
        service_name: '',
        normal_price: '',
        old_car_price: '',
        cutoff_year: '2007',
        description: '',
        is_active: true
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_id) {
      newErrors.company_id = t('roadService.validation.companyRequired', 'Company is required');
    }

    if (!formData.service_name.trim()) {
      newErrors.service_name = t('roadService.validation.nameRequired', 'Service name is required');
    }

    if (!formData.normal_price || parseFloat(formData.normal_price) <= 0) {
      newErrors.normal_price = t('roadService.validation.normalPriceRequired', 'Normal price must be greater than 0');
    }

    if (!formData.old_car_price || parseFloat(formData.old_car_price) <= 0) {
      newErrors.old_car_price = t('roadService.validation.oldCarPriceRequired', 'Old car price must be greater than 0');
    }

    if (!formData.cutoff_year || parseInt(formData.cutoff_year) < 1900 || parseInt(formData.cutoff_year) > new Date().getFullYear()) {
      newErrors.cutoff_year = t('roadService.validation.cutoffYearInvalid', 'Cutoff year is invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const roadServiceData = {
        service_name: formData.service_name.trim(),
        normal_price: parseFloat(formData.normal_price),
        old_car_price: parseFloat(formData.old_car_price),
        cutoff_year: parseInt(formData.cutoff_year),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        is_active: formData.is_active
      };

      await createRoadService(formData.company_id, roadServiceData);

      toast.success(t('roadService.messages.createSuccess', 'Road service created successfully'));
      if (onRoadServiceAdded) onRoadServiceAdded();
      onClose();
    } catch (error) {
      console.error('Error saving road service:', error);
      toast.error(error.response?.data?.message || t('roadService.messages.createError', 'Failed to create road service'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleBackdropClick}>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-semibold dark:text-white">{t('roadService.addRoadService', 'Add Road Service')}</h2>
          <button
            onClick={handleCloseClick}
            disabled={loading}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Company Selection */}
            <div>
              <label htmlFor="company_id" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('roadService.labels.company', 'Insurance Company')} <span className="text-red-500">*</span>
              </label>
              <select
                id="company_id"
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.company_id ? 'border-red-500' : ''}`}
              >
                <option value="">{t('roadService.placeholders.selectCompany', 'Select a company')}</option>
                {companies && companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.company_id && <p className="mt-1 text-sm text-red-500">{errors.company_id}</p>}
            </div>

            {/* Service Name */}
            <div>
              <label htmlFor="service_name" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('roadService.labels.serviceName', 'Service Name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                placeholder={t('roadService.placeholders.serviceName', 'e.g., Towing Service')}
                className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.service_name ? 'border-red-500' : ''}`}
              />
              {errors.service_name && <p className="mt-1 text-sm text-red-500">{errors.service_name}</p>}
            </div>

            {/* Price Fields - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Normal Price */}
              <div>
                <label htmlFor="normal_price" className="block text-sm font-medium dark:text-gray-300 mb-1">
                  {t('roadService.labels.normalPrice', 'Normal Price (₪)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="normal_price"
                  name="normal_price"
                  value={formData.normal_price}
                  onChange={handleInputChange}
                  placeholder="300"
                  step="0.01"
                  min="0"
                  className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.normal_price ? 'border-red-500' : ''}`}
                />
                {errors.normal_price && <p className="mt-1 text-sm text-red-500">{errors.normal_price}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('roadService.help.normalPrice', 'Price for newer vehicles')}
                </p>
              </div>

              {/* Old Car Price */}
              <div>
                <label htmlFor="old_car_price" className="block text-sm font-medium dark:text-gray-300 mb-1">
                  {t('roadService.labels.oldCarPrice', 'Old Car Price (₪)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="old_car_price"
                  name="old_car_price"
                  value={formData.old_car_price}
                  onChange={handleInputChange}
                  placeholder="450"
                  step="0.01"
                  min="0"
                  className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.old_car_price ? 'border-red-500' : ''}`}
                />
                {errors.old_car_price && <p className="mt-1 text-sm text-red-500">{errors.old_car_price}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('roadService.help.oldCarPrice', 'Price for vehicles before cutoff year')}
                </p>
              </div>
            </div>

            {/* Cutoff Year */}
            <div>
              <label htmlFor="cutoff_year" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('roadService.labels.cutoffYear', 'Cutoff Year')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="cutoff_year"
                name="cutoff_year"
                value={formData.cutoff_year}
                onChange={handleInputChange}
                placeholder="2007"
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.cutoff_year ? 'border-red-500' : ''}`}
              />
              {errors.cutoff_year && <p className="mt-1 text-sm text-red-500">{errors.cutoff_year}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('roadService.help.cutoffYear', 'Vehicles manufactured before this year use old car price')}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('roadService.labels.description', 'Description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder={t('roadService.placeholders.description', 'Enter service description...')}
                className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                {t('roadService.labels.isActive', 'Service is active')}
              </label>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={handleCloseClick}
              disabled={loading}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? t('common.saving', 'Saving...') : t('roadService.buttons.save', 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoadServiceModal;
