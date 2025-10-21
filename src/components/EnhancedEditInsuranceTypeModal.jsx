import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Close,
  Category,
  Info,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import { getAllPricingTypes } from '../services/pricingTypeApi';

const EnhancedEditInsuranceTypeModal = ({ isOpen, onClose, onInsuranceTypeUpdated, insuranceType }) => {
  const { t, i18n: { language } } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    pricing_type_id: '',
    description: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [pricingTypes, setPricingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedPricingType, setSelectedPricingType] = useState(null);

  useEffect(() => {
    if (isOpen && insuranceType) {
      const pricingTypeId = typeof insuranceType.pricing_type_id === 'object'
        ? insuranceType.pricing_type_id?._id
        : insuranceType.pricing_type_id;

      const initialData = {
        name: insuranceType.name || '',
        pricing_type_id: pricingTypeId || '',
        description: insuranceType.description || ''
      };

      setFormData(initialData);
      setOriginalData(initialData);
      setErrors({});
      fetchPricingTypes(pricingTypeId);
    }
  }, [isOpen, insuranceType]);

  const fetchPricingTypes = async (currentPricingTypeId) => {
    try {
      const response = await getAllPricingTypes();
      const types = response.pricingTypes || response.data || [];
      setPricingTypes(types);

      // Set selected pricing type
      if (currentPricingTypeId) {
        const selectedType = types.find(t => t._id === currentPricingTypeId);
        setSelectedPricingType(selectedType || null);
      }
    } catch (error) {
      console.error('Error fetching pricing types:', error);
      toast.error(t('insuranceType.messages.fetchPricingTypesError', 'Failed to load pricing types'));
    }
  };

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

  const handlePricingTypeSelect = (pricingType) => {
    setFormData(prev => ({
      ...prev,
      pricing_type_id: pricingType._id
    }));
    setSelectedPricingType(pricingType);

    if (errors.pricing_type_id) {
      setErrors(prev => ({
        ...prev,
        pricing_type_id: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('insuranceType.validation.nameRequired', 'Insurance type name is required');
    }

    if (!formData.pricing_type_id) {
      newErrors.pricing_type_id = t('insuranceType.validation.pricingTypeRequired', 'Pricing type is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.pricing_type_id !== originalData.pricing_type_id ||
      formData.description !== originalData.description
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      toast.info(t('common.noChanges', 'No changes to save'));
      return;
    }

    setLoading(true);

    try {
      const insuranceTypeData = {
        name: formData.name.trim(),
        pricing_type_id: formData.pricing_type_id,
        description: formData.description.trim()
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

  const isRTL = language === 'ar' || language === 'he';

  const getPricingTypeIcon = (pricingTypeId) => {
    const icons = {
      'compulsory': '🛡️',
      'third_party': '🚗',
      'comprehensive': '💎',
      'road_service': '🛣️',
      'accident_fee_waiver': '📋'
    };
    return icons[pricingTypeId] || '📄';
  };

  const getPricingTypeDescription = (pricingType) => {
    if (pricingType._id === 'compulsory') {
      return t('companyPricing.compulsoryDesc', 'Manual entry during insurance creation');
    }
    if (pricingType._id === 'road_service') {
      return t('companyPricing.roadServiceDesc', 'Configured in Road Services section');
    }
    if (pricingType.requiresPricingTable) {
      return t('companyPricing.matrixDesc', 'Matrix-based pricing with vehicle type, age, and value');
    }
    return t('companyPricing.fixedAmountDesc', 'Fixed amount pricing');
  };

  const isPricingTypeChanged = formData.pricing_type_id !== originalData.pricing_type_id;

  return (
    <Dialog
      open={isOpen}
      onClose={!loading ? onClose : undefined}
      maxWidth="md"
      fullWidth
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Category className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {t('insuranceType.editInsuranceType', 'Edit Insurance Type')}
              </h2>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                {insuranceType?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="dark:bg-navbarBack dark:text-white">
          <div className="space-y-6 py-2">
            {/* Warning about pricing type change */}
            {isPricingTypeChanged && (
              <Alert severity="warning" className="dark:bg-yellow-900/20">
                <div className="flex items-start gap-2">
                  <Warning fontSize="small" className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {t('insuranceType.pricingTypeChangeWarning', 'Pricing Type Change')}
                    </p>
                    <p className="text-xs mt-1">
                      {t('insuranceType.pricingTypeChangeDesc', 'Changing the pricing type may affect existing company pricing configurations using this insurance type.')}
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                {t('insuranceType.labels.name', 'Name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('insuranceType.placeholders.name', 'Enter insurance type name')}
                className={`w-full px-4 py-2.5 border rounded-lg dark:bg-dark2 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Pricing Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                {t('insuranceType.labels.pricingType', 'Pricing Type')} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {t('insuranceType.helpers.pricingType', 'This determines how pricing is calculated for this insurance type')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pricingTypes.map((pricingType) => {
                  const isSelected = formData.pricing_type_id === pricingType._id;

                  return (
                    <div
                      key={pricingType._id}
                      onClick={() => handlePricingTypeSelect(pricingType)}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-dark2'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getPricingTypeIcon(pricingType._id)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {pricingType.name}
                            </h4>
                            {isSelected && (
                              <CheckCircle className="text-blue-600 dark:text-blue-400" fontSize="small" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {pricingType.description || getPricingTypeDescription(pricingType)}
                          </p>
                          {pricingType.requiresPricingTable !== undefined && (
                            <Chip
                              label={pricingType.requiresPricingTable ? t('companyPricing.matrixBased', 'Matrix-based') : t('companyPricing.simplePricing', 'Simple')}
                              size="small"
                              className={`${
                                pricingType.requiresPricingTable
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.pricing_type_id && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.pricing_type_id}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                {t('insuranceType.labels.description', 'Description')}
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  ({t('common.optional', 'Optional')})
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder={t('insuranceType.placeholders.description', 'Enter description (optional)')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-dark2 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Changes Summary */}
            {hasChanges() && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                      {t('wizard.changesSummary', 'Changes to be saved')}
                    </p>
                    <ul className="text-xs text-green-800 dark:text-green-400 space-y-1">
                      {formData.name !== originalData.name && (
                        <li>• {t('insuranceType.nameChanged', 'Name updated')}</li>
                      )}
                      {formData.pricing_type_id !== originalData.pricing_type_id && (
                        <li>• {t('insuranceType.pricingTypeChanged', 'Pricing type changed')}</li>
                      )}
                      {formData.description !== originalData.description && (
                        <li>• {t('insuranceType.descriptionChanged', 'Description updated')}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
          <Button
            onClick={onClose}
            disabled={loading}
            className="dark:text-gray-300"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !hasChanges()}
            sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
          >
            {loading ? t('common.updating', 'Updating...') : t('insuranceType.buttons.saveChanges', 'Save Changes')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EnhancedEditInsuranceTypeModal;
