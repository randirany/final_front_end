import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Close,
  Business,
  Category,
  Settings,
  CheckCircle,
  RadioButtonUnchecked,
  ChevronLeft,
  ChevronRight,
  CarRepair,
  AttachMoney
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Chip
} from '@mui/material';
import Swal from 'sweetalert2';
import { getCompanyById, updateCompany } from '../services/insuranceCompanyApi';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import { getAllRoadServices } from '../services/roadServiceApi';
import { getPricingByCompany } from '../services/companyPricingApi';
import { getAllPricingTypes } from '../services/pricingTypeApi';

const EnhancedEditCompanyModal = ({ open, onClose, companyId, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    insuranceTypeIds: [],
    roadServiceIds: []
  });

  const [originalData, setOriginalData] = useState({});
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [roadServices, setRoadServices] = useState([]);
  const [pricingTypes, setPricingTypes] = useState([]);
  const [configuredPricings, setConfiguredPricings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    { label: t('wizard.steps.basicInfo', 'Basic Information'), icon: <Business /> },
    { label: t('wizard.steps.insuranceTypes', 'Insurance Types'), icon: <Category /> },
    { label: t('wizard.steps.roadServices', 'Road Services'), icon: <CarRepair /> },
    { label: t('wizard.steps.pricingReview', 'Pricing Review'), icon: <AttachMoney /> }
  ];

  useEffect(() => {
    if (open && companyId) {
      fetchAllData();
    } else {
      resetForm();
    }
  }, [open, companyId]);

  const fetchAllData = async () => {
    setFetching(true);
    try {
      // Fetch company data
      const companyResponse = await getCompanyById(companyId);
      const company = companyResponse.company || companyResponse;

      // Extract IDs from populated objects
      const insuranceTypeIds = company.insuranceTypes?.map(type =>
        typeof type === 'string' ? type : type._id
      ) || [];

      const roadServiceIds = company.roadServices?.map(service =>
        typeof service === 'string' ? service : service._id
      ) || [];

      const initialData = {
        name: company.name || '',
        description: company.description || '',
        insuranceTypeIds,
        roadServiceIds
      };

      setFormData(initialData);
      setOriginalData(initialData);

      // Fetch other data in parallel
      const [typesRes, servicesRes, pricingTypesRes, pricingConfigRes] = await Promise.all([
        insuranceTypeApi.getAll(),
        getAllRoadServices({ page: 1, limit: 1000 }),
        getAllPricingTypes(),
        getPricingByCompany(companyId)
      ]);

      setInsuranceTypes(typesRes.insuranceTypes || typesRes.data || []);
      setRoadServices(servicesRes.roadServices || servicesRes.data || []);
      setPricingTypes(pricingTypesRes.pricingTypes || pricingTypesRes.data || []);
      setConfiguredPricings(pricingConfigRes.pricing || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        title: t('common.error'),
        text: t('companies.errorFetchingData', 'Error loading data'),
        icon: 'error'
      });
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      insuranceTypeIds: [],
      roadServiceIds: []
    });
    setOriginalData({});
    setActiveStep(0);
    setErrors({});
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

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = t('companies.validation.nameRequired', 'Company name is required');
      }
    }

    if (step === 1) {
      if (formData.insuranceTypeIds.length === 0) {
        newErrors.insuranceTypeIds = t('companies.validation.atLeastOneType', 'At least one insurance type is required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);

    try {
      await updateCompany(companyId, formData);

      Swal.fire({
        title: t('companies.updateSuccess', 'Success!'),
        text: t('companies.companyUpdatedSuccessfully', 'Company updated successfully'),
        icon: 'success',
        timer: 2000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating company:', error);
      Swal.fire({
        title: t('common.error'),
        text: error.response?.data?.message || t('companies.errorUpdatingCompany', 'Error updating company'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getPricingProgress = () => {
    // Filter pricing types based on selected insurance types
    const relevantPricingTypes = pricingTypes.filter(pricingType => {
      const selectedTypes = insuranceTypes.filter(it =>
        formData.insuranceTypeIds.includes(it._id)
      );

      return selectedTypes.some(insuranceType => {
        const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
          ? insuranceType.pricing_type_id
          : insuranceType.pricing_type_id?._id;
        return pricingTypeId === pricingType._id;
      });
    }).filter(pt => pt._id !== 'compulsory' && pt._id !== 'road_service');

    const total = relevantPricingTypes.length;
    const configured = configuredPricings.filter(cp => {
      const cpId = typeof cp.pricing_type_id === 'string'
        ? cp.pricing_type_id
        : cp.pricing_type_id?._id;
      return relevantPricingTypes.some(rpt => rpt._id === cpId);
    }).length;

    return { configured, total, percentage: total > 0 ? (configured / total) * 100 : 0 };
  };

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      JSON.stringify(formData.insuranceTypeIds.sort()) !== JSON.stringify(originalData.insuranceTypeIds.sort()) ||
      JSON.stringify(formData.roadServiceIds.sort()) !== JSON.stringify(originalData.roadServiceIds.sort())
    );
  };

  const isRTL = language === 'ar' || language === 'he';

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Basic Information
        return (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.basicInfoDesc', 'Update the company name and description')}
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                {t('companies.name', 'Company Name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 sm:text-sm dark:bg-dark2 dark:text-white ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                }`}
                placeholder={t('companies.namePlaceholder', 'Enter company name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                {t('companies.description', 'Description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-dark2 dark:text-white"
                placeholder={t('companies.descriptionPlaceholder', 'Enter company description')}
              />
            </div>
          </div>
        );

      case 1:
        // Insurance Types
        return (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.insuranceTypesDesc', 'Select the insurance types offered by this company')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insuranceTypes.map((type) => {
                const isSelected = formData.insuranceTypeIds.includes(type._id);
                const pricingTypeName = typeof type.pricing_type_id === 'object'
                  ? type.pricing_type_id?.name
                  : type.pricing_type_id;

                return (
                  <div
                    key={type._id}
                    onClick={() => handleCheckboxChange('insuranceTypeIds', type._id)}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-dark2'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isSelected ? (
                          <CheckCircle className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <RadioButtonUnchecked className="text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {type.name}
                        </h4>
                        {pricingTypeName && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {pricingTypeName}
                          </p>
                        )}
                        {type.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {type.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.insuranceTypeIds && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.insuranceTypeIds}</p>
            )}
          </div>
        );

      case 2:
        // Road Services
        return (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.roadServicesDesc', 'Select road services offered by this company (optional)')}
              </p>
            </div>

            {roadServices.length === 0 ? (
              <div className="text-center py-8">
                <CarRepair className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('companies.noRoadServices', 'No road services available')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roadServices.map((service) => {
                  const isSelected = formData.roadServiceIds.includes(service._id);

                  return (
                    <div
                      key={service._id}
                      onClick={() => handleCheckboxChange('roadServiceIds', service._id)}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-dark2'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isSelected ? (
                            <CheckCircle className="text-green-600 dark:text-green-400" />
                          ) : (
                            <RadioButtonUnchecked className="text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {service.service_name || service.name}
                          </h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {service.description}
                            </p>
                          )}
                          {service.is_active !== undefined && (
                            <Chip
                              label={service.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                              size="small"
                              className="mt-2"
                              color={service.is_active ? 'success' : 'default'}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 3:
        // Pricing Review
        const pricingProgress = getPricingProgress();
        const selectedInsuranceTypes = insuranceTypes.filter(it =>
          formData.insuranceTypeIds.includes(it._id)
        );

        return (
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {t('wizard.pricingReviewDesc', 'Review pricing configuration status. You can configure pricing after saving the company.')}
              </p>
            </div>

            {/* Pricing Progress */}
            <div className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('companyPricing.configurationProgress', 'Pricing Configuration')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {pricingProgress.configured} of {pricingProgress.total} configured
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(pricingProgress.percentage)}%
                  </p>
                </div>
              </div>
              <LinearProgress
                variant="determinate"
                value={pricingProgress.percentage}
                className="h-2 rounded-full"
                sx={{
                  backgroundColor: 'rgba(156, 163, 175, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: pricingProgress.percentage === 100 ? '#10b981' : pricingProgress.percentage >= 50 ? '#3b82f6' : '#f59e0b',
                    borderRadius: '9999px'
                  }
                }}
              />
            </div>

            {/* Selected Insurance Types */}
            <div className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('wizard.selectedInsuranceTypes', 'Selected Insurance Types')} ({selectedInsuranceTypes.length})
              </h4>
              <div className="space-y-2">
                {selectedInsuranceTypes.map((type) => (
                  <div key={type._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">{type.name}</span>
                    <Chip
                      label={typeof type.pricing_type_id === 'object' ? type.pricing_type_id?.name : type.pricing_type_id}
                      size="small"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Changes Summary */}
            {hasChanges() && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  {t('wizard.changesSummary', 'Changes to be saved')}
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
                  {formData.name !== originalData.name && (
                    <li>• {t('wizard.nameChanged', 'Company name updated')}</li>
                  )}
                  {formData.description !== originalData.description && (
                    <li>• {t('wizard.descriptionChanged', 'Description updated')}</li>
                  )}
                  {JSON.stringify(formData.insuranceTypeIds.sort()) !== JSON.stringify(originalData.insuranceTypeIds.sort()) && (
                    <li>• {t('wizard.insuranceTypesChanged', 'Insurance types updated')}</li>
                  )}
                  {JSON.stringify(formData.roadServiceIds.sort()) !== JSON.stringify(originalData.roadServiceIds.sort()) && (
                    <li>• {t('wizard.roadServicesChanged', 'Road services updated')}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{t('companies.editCompany', 'Edit Insurance Company')}</h2>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
              {formData.name || t('wizard.stepProgress', 'Step {{current}} of {{total}}', { current: activeStep + 1, total: steps.length })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      {fetching ? (
        <DialogContent className="dark:bg-navbarBack dark:text-white">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      ) : (
        <>
          <DialogContent className="dark:bg-navbarBack dark:text-white">
            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              className="mb-6 mt-2"
              sx={{
                '& .MuiStepLabel-label': {
                  color: 'rgb(156 163 175)',
                  fontSize: '0.875rem',
                  '&.Mui-active': {
                    color: 'rgb(59 130 246)',
                    fontWeight: 600
                  },
                  '&.Mui-completed': {
                    color: 'rgb(34 197 94)'
                  }
                },
                '& .MuiStepIcon-root': {
                  color: 'rgb(209 213 219)',
                  '&.Mui-active': {
                    color: 'rgb(59 130 246)'
                  },
                  '&.Mui-completed': {
                    color: 'rgb(34 197 94)'
                  }
                }
              }}
            >
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            {renderStepContent()}
          </DialogContent>

          <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
            <div className="flex justify-between w-full">
              <Button
                onClick={handleClose}
                disabled={loading}
                className="dark:text-gray-300"
              >
                {t('common.cancel', 'Cancel')}
              </Button>

              <div className="flex gap-2">
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    disabled={loading}
                    startIcon={isRTL ? <ChevronRight /> : <ChevronLeft />}
                    className="dark:text-gray-300"
                  >
                    {t('common.back', 'Back')}
                  </Button>
                )}

                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    endIcon={isRTL ? <ChevronLeft /> : <ChevronRight />}
                    sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
                  >
                    {t('common.next', 'Next')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !hasChanges()}
                    sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
                  >
                    {loading ? t('common.updating', 'Updating...') : t('companies.saveChanges', 'Save Changes')}
                  </Button>
                )}
              </div>
            </div>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default EnhancedEditCompanyModal;
