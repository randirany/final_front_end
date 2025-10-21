import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { insuranceTypeApi } from '../services/insuranceTypeApi';

const EditInsuranceTypeModal = ({ isOpen, onClose, onInsuranceTypeUpdated, insuranceType }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: ''
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
    if (isOpen && insuranceType) {
      setFormData({
        name: insuranceType.name || ''
      });
      setErrors({});
    }
  }, [isOpen, insuranceType]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.name.trim()) {
      newErrors.name = t('insuranceType.validation.nameRequired', 'Insurance type name is required');
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
      const insuranceTypeData = {
        name: formData.name.trim()
      };

      await insuranceTypeApi.update(insuranceType._id, insuranceTypeData);

      toast.success(t('insuranceType.messages.updateSuccess', 'Insurance type updated successfully'));
      if (onInsuranceTypeUpdated) onInsuranceTypeUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating insurance type:', error);
      toast.error(error.response?.data?.message || t('insuranceType.messages.updateError', 'Failed to update insurance type'));
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
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-semibold dark:text-white">{t('insuranceType.editInsuranceType', 'Edit Insurance Type')}</h2>
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('insuranceType.labels.name', 'Name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('insuranceType.placeholders.name', 'Enter insurance type name')}
                className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
              {loading ? t('common.updating', 'Updating...') : t('insuranceType.buttons.update', 'Update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInsuranceTypeModal;
