import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { createCompany } from '../services/insuranceCompanyApi';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import { getAllRoadServices } from '../services/roadServiceApi';

const AddCompanyModal = ({ open, onClose, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    insuranceTypeIds: [],
    roadServiceIds: []
  });

  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [roadServices, setRoadServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch insurance types and road services on mount
  useEffect(() => {
    if (open) {
      fetchInsuranceTypes();
      fetchRoadServices();
    }
  }, [open]);

  const fetchInsuranceTypes = async () => {
    try {
      const response = await insuranceTypeApi.getAll();
      setInsuranceTypes(response.insuranceTypes || response.data || []);
    } catch (error) {
      console.error('Error fetching insurance types:', error);
    }
  };

  const fetchRoadServices = async () => {
    try {
      const response = await getAllRoadServices({ page: 1, limit: 1000 });
      setRoadServices(response.roadServices || response.data || []);
    } catch (error) {
      console.error('Error fetching road services:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (field, id) => {
    setFormData(prev => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter(itemId => itemId !== id)
        : [...currentIds, id];

      return {
        ...prev,
        [field]: newIds
      };
    });

    // Clear error when user selects
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('companies.validation.nameRequired', 'Company name is required');
    }

    if (formData.insuranceTypeIds.length === 0) {
      newErrors.insuranceTypeIds = t('companies.validation.atLeastOneType', 'At least one insurance type is required');
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
      await createCompany(formData);

      Swal.fire({
        title: t('companies.addSuccess', 'Success!'),
        text: t('companies.companyAddedSuccessfully', 'Company added successfully'),
        icon: 'success',
        timer: 2000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving company:', error);
      Swal.fire({
        title: t('companies.error', 'Error'),
        text: error.response?.data?.message || t('companies.errorAddingCompany', 'Error adding company'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      insuranceTypeIds: [],
      roadServiceIds: []
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span>{t('companies.addCompany', 'Add Insurance Company')}</span>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="dark:bg-navbarBack dark:text-white">
          <div className="space-y-4 mt-2">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('companies.name', 'Company Name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                }`}
                placeholder={t('companies.namePlaceholder', 'Enter company name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('companies.description', 'Description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-dark2 dark:text-white dark:focus:border-blue-400"
                placeholder={t('companies.descriptionPlaceholder', 'Enter company description')}
              />
            </div>

            {/* Insurance Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                {t('companies.labels.insuranceTypes', 'Insurance Types')} *
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 space-y-2 dark:bg-dark2">
                {insuranceTypes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('companies.noInsuranceTypes', 'No insurance types available')}
                  </p>
                ) : (
                  insuranceTypes.map((type) => (
                    <div key={type._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type._id}`}
                        checked={formData.insuranceTypeIds.includes(type._id)}
                        onChange={() => handleCheckboxChange('insuranceTypeIds', type._id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <label
                        htmlFor={`type-${type._id}`}
                        className="mr-2 ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {type.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {errors.insuranceTypeIds && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.insuranceTypeIds}</p>
              )}
            </div>

            {/* Road Services (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                {t('companies.labels.roadServices', 'Road Services')} ({t('common.optional', 'Optional')})
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 space-y-2 dark:bg-dark2">
                {roadServices.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('companies.noRoadServices', 'No road services available')}
                  </p>
                ) : (
                  roadServices.map((service) => (
                    <div key={service._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service._id}`}
                        checked={formData.roadServiceIds.includes(service._id)}
                        onChange={() => handleCheckboxChange('roadServiceIds', service._id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <label
                        htmlFor={`service-${service._id}`}
                        className="mr-2 ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {service.service_name || service.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
          <Button
            onClick={handleClose}
            disabled={loading}
            className="dark:text-gray-300"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
          >
            {loading ? t('common.saving', 'Saving...') : t('companies.save', 'Save Company')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCompanyModal;
