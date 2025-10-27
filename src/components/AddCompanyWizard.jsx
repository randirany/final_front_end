import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Close,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  Business,
  Category,
  AttachMoney,
  CarRepair,
  Add,
  Delete,
  Edit,
  Warning,
  CheckCircleOutline
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import Swal from 'sweetalert2';
import { createCompany } from '../services/insuranceCompanyApi';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import { getAllPricingTypes } from '../services/pricingTypeApi';
import { createOrUpdatePricing } from '../services/companyPricingApi';
import { createRoadService } from '../services/roadServiceApi';

const AddCompanyWizard = ({ open, onClose, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();
  const isRTL = language === 'ar' || language === 'he';

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Step 1: Basic Info
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Step 2: Insurance Types
  const [availableInsuranceTypes, setAvailableInsuranceTypes] = useState([]);
  const [selectedInsuranceTypes, setSelectedInsuranceTypes] = useState([]);

  // Step 3: Pricing Configuration
  const [pricingTypes, setPricingTypes] = useState([]);
  const [pricingConfigs, setPricingConfigs] = useState({});
  const [editingPricingType, setEditingPricingType] = useState(null);

  // Step 4: Road Services
  const [roadServices, setRoadServices] = useState([]);
  const [editingRoadService, setEditingRoadService] = useState(null);
  const [roadServiceForm, setRoadServiceForm] = useState({
    service_name: '',
    normal_price: '',
    old_car_price: '',
    cutoff_year: 2007,
    description: ''
  });

  const steps = [
    { label: t('wizard.step1', 'Basic Info'), number: 1 },
    { label: t('wizard.step2', 'Insurance Types'), number: 2 },
    { label: t('wizard.step3', 'Pricing'), number: 3 },
    { label: t('wizard.step4', 'Road Services'), number: 4 },
    { label: t('wizard.step5', 'Review'), number: 5 }
  ];

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    try {
      const insuranceTypesRes = await insuranceTypeApi.getAll();
      const types = Array.isArray(insuranceTypesRes)
        ? insuranceTypesRes
        : (insuranceTypesRes.data || insuranceTypesRes.insuranceTypes || []);
      setAvailableInsuranceTypes(types);

      const pricingTypesRes = await getAllPricingTypes();
      const pTypes = pricingTypesRes.pricingTypes || pricingTypesRes.data || [];
      setPricingTypes(pTypes);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const resetWizard = () => {
    setActiveStep(0);
    setCompanyName('');
    setCompanyDescription('');
    setSelectedInsuranceTypes([]);
    setPricingConfigs({});
    setRoadServices([]);
    setEditingPricingType(null);
    setEditingRoadService(null);
    setValidationError('');
    setRoadServiceForm({
      service_name: '',
      normal_price: '',
      old_car_price: '',
      cutoff_year: 2007,
      description: ''
    });
  };

  const handleNext = async () => {
    setValidationError('');

    if (activeStep === 0) {
      if (!companyName.trim()) {
        setValidationError(t('wizard.validation.companyNameRequired', 'Company name is required'));
        return;
      }
    }

    if (activeStep === 1) {
      if (selectedInsuranceTypes.length === 0) {
        setValidationError(t('wizard.validation.selectInsuranceTypes', 'Please select at least one insurance type'));
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setValidationError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const companyData = {
        name: companyName,
        description: companyDescription,
        insuranceTypeIds: selectedInsuranceTypes,
        roadServiceIds: []
      };

      const companyResponse = await createCompany(companyData);
      const newCompanyId = companyResponse.company?._id || companyResponse._id;

      for (const [pricingTypeId, config] of Object.entries(pricingConfigs)) {
        if (config && Object.keys(config).length > 0) {
          await createOrUpdatePricing(newCompanyId, {
            pricing_type_id: pricingTypeId,
            rules: config
          });
        }
      }

      for (const service of roadServices) {
        await createRoadService(newCompanyId, {
          service_name: service.service_name,
          normal_price: parseFloat(service.normal_price),
          old_car_price: parseFloat(service.old_car_price),
          cutoff_year: parseInt(service.cutoff_year),
          description: service.description
        });
      }

      Swal.fire({
        icon: 'success',
        title: t('wizard.success', 'Success!'),
        text: t('wizard.companyCreated', 'Company created successfully'),
        timer: 3000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating company:', error);
      Swal.fire({
        icon: 'error',
        title: t('common.error', 'Error'),
        text: error.response?.data?.message || t('wizard.errorCreating', 'Error creating company')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (activeStep > 0 && activeStep < steps.length - 1 && !loading) {
      Swal.fire({
        title: t('wizard.confirmClose', 'Close Wizard?'),
        text: t('wizard.confirmCloseText', 'Your progress will be lost'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('common.yes', 'Yes'),
        cancelButtonText: t('common.cancel', 'Cancel')
      }).then((result) => {
        if (result.isConfirmed) {
          resetWizard();
          onClose();
        }
      });
    } else {
      resetWizard();
      onClose();
    }
  };

  const toggleInsuranceType = (typeId) => {
    setSelectedInsuranceTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const getPricingConfig = (pricingTypeId) => {
    return pricingConfigs[pricingTypeId] || null;
  };

  const savePricingConfig = (pricingTypeId, config) => {
    setPricingConfigs((prev) => ({
      ...prev,
      [pricingTypeId]: config
    }));
    setEditingPricingType(null);
  };

  const removePricingConfig = (pricingTypeId) => {
    setPricingConfigs((prev) => {
      const updated = { ...prev };
      delete updated[pricingTypeId];
      return updated;
    });
  };

  const addRoadService = () => {
    if (!roadServiceForm.service_name || !roadServiceForm.normal_price || !roadServiceForm.old_car_price) {
      setValidationError(t('wizard.validation.roadServiceRequired', 'All required fields must be filled'));
      return;
    }

    setValidationError('');

    if (editingRoadService !== null) {
      const updated = [...roadServices];
      updated[editingRoadService] = { ...roadServiceForm };
      setRoadServices(updated);
      setEditingRoadService(null);
    } else {
      setRoadServices((prev) => [...prev, { ...roadServiceForm }]);
    }

    setRoadServiceForm({
      service_name: '',
      normal_price: '',
      old_car_price: '',
      cutoff_year: 2007,
      description: ''
    });
  };

  const editRoadService = (index) => {
    setRoadServiceForm(roadServices[index]);
    setEditingRoadService(index);
  };

  const deleteRoadService = (index) => {
    setRoadServices((prev) => prev.filter((_, i) => i !== index));
    if (editingRoadService === index) {
      setEditingRoadService(null);
      setRoadServiceForm({
        service_name: '',
        normal_price: '',
        old_car_price: '',
        cutoff_year: 2007,
        description: ''
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.step1Desc', 'Enter the basic information for the company')}
              </p>
            </div>

            {validationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <Warning className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fontSize="small" />
                <p className="text-sm text-red-800 dark:text-red-300">{validationError}</p>
              </div>
            )}

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                {t('wizard.companyName', 'Company Name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                  validationError && !companyName.trim()
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                }`}
                placeholder={t('companies.placeholders.name', 'Enter company name')}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                {t('wizard.companyDescription', 'Description')}
              </label>
              <textarea
                id="companyDescription"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-dark2 dark:text-white"
                placeholder={t('companies.placeholders.description', 'Enter company description')}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.step2Desc', 'Select the insurance types this company offers')}
              </p>
            </div>

            {validationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <Warning className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fontSize="small" />
                <p className="text-sm text-red-800 dark:text-red-300">{validationError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {availableInsuranceTypes.map((type) => {
                const isSelected = selectedInsuranceTypes.includes(type._id);
                return (
                  <div
                    key={type._id}
                    onClick={() => toggleInsuranceType(type._id)}
                    className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-dark2'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckCircleOutline className="text-blue-600 dark:text-blue-400" fontSize="small" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</p>
                        {type.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{type.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedInsuranceTypes.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" fontSize="small" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  {selectedInsuranceTypes.length} {t('wizard.typesSelected', 'types selected')}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        const relevantPricingTypes = pricingTypes.filter(pricingType => {
          const selectedTypes = availableInsuranceTypes.filter(it =>
            selectedInsuranceTypes.includes(it._id)
          );
          return selectedTypes.some(insuranceType => {
            const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
              ? insuranceType.pricing_type_id
              : insuranceType.pricing_type_id?._id;
            return pricingTypeId === pricingType._id;
          });
        }).filter(pt => pt._id !== 'compulsory' && pt._id !== 'road_service');

        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.step3Desc', 'Configure pricing for insurance types (optional)')}
              </p>
            </div>

            {editingPricingType ? (
              <PricingConfigEditor
                pricingType={editingPricingType}
                config={getPricingConfig(editingPricingType._id)}
                onSave={(config) => savePricingConfig(editingPricingType._id, config)}
                onCancel={() => setEditingPricingType(null)}
                t={t}
                isRTL={isRTL}
              />
            ) : relevantPricingTypes.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                <Warning className="text-yellow-600 dark:text-yellow-400 mx-auto mb-2" fontSize="large" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {t('wizard.noPricingTypesAvailable', 'No pricing types available for selected insurance types')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {relevantPricingTypes.map((pricingType) => {
                  const config = getPricingConfig(pricingType._id);
                  const isConfigured = config && Object.keys(config).length > 0;

                  return (
                    <div
                      key={pricingType._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{pricingType.name}</p>
                            {isConfigured && (
                              <Chip
                                label={t('wizard.configured', 'Configured')}
                                size="small"
                                color="success"
                                icon={<CheckCircle />}
                                sx={{ height: 20, fontSize: '0.75rem' }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{pricingType.description}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isConfigured && (
                            <IconButton
                              size="small"
                              onClick={() => removePricingConfig(pricingType._id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                          <Button
                            size="small"
                            variant={isConfigured ? "outlined" : "contained"}
                            onClick={() => setEditingPricingType(pricingType)}
                            sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
                          >
                            {isConfigured ? t('common.edit', 'Edit') : t('wizard.configure', 'Configure')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    {t('wizard.pricingOptional', 'Pricing configuration is optional and can be added later')}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('wizard.step4Desc', 'Add road services for this company (optional)')}
              </p>
            </div>

            {validationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <Warning className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fontSize="small" />
                <p className="text-sm text-red-800 dark:text-red-300">{validationError}</p>
              </div>
            )}

            {/* Road Service Form */}
            <div className="bg-gray-50 dark:bg-dark2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {editingRoadService !== null ? t('wizard.editService', 'Edit Service') : t('wizard.addService', 'Add Service')}
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
                  {t('wizard.serviceName', 'Service Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roadServiceForm.service_name}
                  onChange={(e) => setRoadServiceForm({ ...roadServiceForm, service_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                  placeholder={t('roadService.placeholders.serviceName', 'Enter service name')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
                    {t('wizard.normalPrice', 'Normal Price')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={roadServiceForm.normal_price}
                    onChange={(e) => setRoadServiceForm({ ...roadServiceForm, normal_price: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                    placeholder="0"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
                    {t('wizard.oldCarPrice', 'Old Car Price')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={roadServiceForm.old_car_price}
                    onChange={(e) => setRoadServiceForm({ ...roadServiceForm, old_car_price: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                    placeholder="0"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
                  {t('wizard.cutoffYear', 'Cutoff Year')}
                </label>
                <input
                  type="number"
                  value={roadServiceForm.cutoff_year}
                  onChange={(e) => setRoadServiceForm({ ...roadServiceForm, cutoff_year: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                  placeholder="2007"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
                  {t('wizard.description', 'Description')}
                </label>
                <textarea
                  value={roadServiceForm.description}
                  onChange={(e) => setRoadServiceForm({ ...roadServiceForm, description: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                  placeholder={t('companies.placeholders.description', 'Enter description')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <Button
                fullWidth
                size="small"
                variant="contained"
                startIcon={editingRoadService !== null ? <Edit /> : <Add />}
                onClick={addRoadService}
              >
                {editingRoadService !== null ? t('common.update', 'Update') : t('wizard.addService', 'Add Service')}
              </Button>
            </div>

            {/* Road Services List */}
            {roadServices.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('wizard.addedServices', 'Added Services')} ({roadServices.length})
                </p>
                {roadServices.map((service, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{service.service_name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span>₪{service.normal_price}</span>
                          <span>•</span>
                          <span>₪{service.old_car_price}</span>
                          <span>•</span>
                          <span>{service.cutoff_year}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <IconButton size="small" onClick={() => editRoadService(index)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteRoadService(index)} className="text-red-600">
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-300">
                {t('wizard.step5Desc', 'Review your information before creating the company')}
              </p>
            </div>

            {/* Summary Sections */}
            <div className="space-y-3">
              {/* Company Info */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark2">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                  <Business fontSize="small" />
                  {t('wizard.companyInfo', 'Company Information')}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('wizard.name', 'Name')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{companyName}</span>
                  </div>
                  {companyDescription && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('wizard.description', 'Description')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right">{companyDescription}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Types */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark2">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                  <Category fontSize="small" />
                  {t('wizard.insuranceTypes', 'Insurance Types')} ({selectedInsuranceTypes.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {availableInsuranceTypes
                    .filter((type) => selectedInsuranceTypes.includes(type._id))
                    .map((type) => (
                      <Chip key={type._id} label={type.name} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    ))}
                </div>
              </div>

              {/* Pricing Configurations */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark2">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                  <AttachMoney fontSize="small" />
                  {t('wizard.pricingConfigs', 'Pricing Configurations')} ({Object.keys(pricingConfigs).length})
                </p>
                {Object.keys(pricingConfigs).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(pricingConfigs).map((typeId) => {
                      const pricingType = pricingTypes.find((pt) => pt._id === typeId);
                      return (
                        <Chip
                          key={typeId}
                          label={pricingType?.name || typeId}
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('wizard.noPricingConfigured', 'No pricing configured')}
                  </p>
                )}
              </div>

              {/* Road Services */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark2">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                  <CarRepair fontSize="small" />
                  {t('wizard.roadServices', 'Road Services')} ({roadServices.length})
                </p>
                {roadServices.length > 0 ? (
                  <div className="space-y-1">
                    {roadServices.map((service, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium text-gray-900 dark:text-white">{service.service_name}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          (₪{service.normal_price} / ₪{service.old_car_price})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('wizard.noRoadServices', 'No road services added')}
                  </p>
                )}
              </div>
            </div>
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
      maxWidth="sm"
      fullWidth
      dir={isRTL ? 'rtl' : 'ltr'}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold">{t('wizard.title', 'Add Insurance Company')}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t('wizard.stepXofY', 'Step {{current}} of {{total}}', { current: activeStep + 1, total: steps.length })}
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

      {/* Progress Steps */}
      <div className="px-6 pt-4 border-b dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    index === activeStep
                      ? 'bg-blue-600 text-white'
                      : index < activeStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {index < activeStep ? <CheckCircle fontSize="small" /> : step.number}
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${index < activeStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <DialogContent className="dark:bg-navbarBack dark:text-white">
        <div className="mt-4">
          {renderStepContent()}
        </div>
      </DialogContent>

      <DialogActions className="dark:bg-navbarBack border-t dark:border-gray-700 px-6 py-3">
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          startIcon={isRTL ? <NavigateNext /> : <NavigateBefore />}
        >
          {t('common.back', 'Back')}
        </Button>

        <div className="flex-1" />

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={isRTL ? <NavigateBefore /> : <NavigateNext />}
            disabled={loading}
          >
            {t('common.next', 'Next')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<CheckCircle />}
          >
            {loading ? t('common.creating', 'Creating...') : t('wizard.createCompany', 'Create Company')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Pricing Config Editor Component
const PricingConfigEditor = ({ pricingType, config, onSave, onCancel, t, isRTL }) => {
  const [matrixRules, setMatrixRules] = useState(config?.matrix || []);
  const [fixedAmount, setFixedAmount] = useState(config?.fixedAmount || '');

  const isMatrixType = pricingType.requiresPricingTable;
  const isFixedAmount = pricingType._id === 'accident_fee_waiver';

  const addMatrixRule = () => {
    setMatrixRules([
      ...matrixRules,
      {
        vehicle_type: 'car',
        driver_age_group: 'above_24',
        offer_amount_min: '',
        offer_amount_max: '',
        price: ''
      }
    ]);
  };

  const removeMatrixRule = (index) => {
    setMatrixRules(matrixRules.filter((_, i) => i !== index));
  };

  const updateMatrixRule = (index, field, value) => {
    const updated = [...matrixRules];
    updated[index][field] = value;
    setMatrixRules(updated);
  };

  const handleSave = () => {
    let rules = {};
    if (isFixedAmount) {
      rules = { fixedAmount: parseFloat(fixedAmount) };
    } else if (isMatrixType) {
      rules = {
        matrix: matrixRules.map((rule) => ({
          vehicle_type: rule.vehicle_type,
          driver_age_group: rule.driver_age_group,
          offer_amount_min: parseFloat(rule.offer_amount_min),
          offer_amount_max: parseFloat(rule.offer_amount_max),
          price: parseFloat(rule.price)
        }))
      };
    }
    onSave(rules);
  };

  return (
    <div className="bg-gray-50 dark:bg-dark2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{pricingType.name}</p>
        <Chip
          label={pricingType.requiresPricingTable ? t('companyPricing.matrixBased', 'Matrix') : t('companyPricing.simplePricing', 'Simple')}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </div>

      {pricingType.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{pricingType.description}</p>
      )}

      {isFixedAmount ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
            {t('wizard.fixedAmount', 'Fixed Amount')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
            placeholder="0"
            dir="ltr"
          />
        </div>
      ) : isMatrixType ? (
        <div className="space-y-2">
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={addMatrixRule}>
            {t('wizard.addRule', 'Add Rule')}
          </Button>

          {matrixRules.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                {t('companyPricing.noRules', 'No rules added yet')}
              </p>
            </div>
          ) : (
            matrixRules.map((rule, index) => (
              <div key={index} className="bg-white dark:bg-navbarBack border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {t('companyPricing.rule', 'Rule')} #{index + 1}
                  </span>
                  <IconButton size="small" onClick={() => removeMatrixRule(index)} className="text-red-600">
                    <Delete fontSize="small" />
                  </IconButton>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      {t('wizard.vehicleType', 'Vehicle')}
                    </label>
                    <select
                      value={rule.vehicle_type}
                      onChange={(e) => updateMatrixRule(index, 'vehicle_type', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                    >
                      <option value="car">{t('vehicleTypes.car', 'Car')}</option>
                      <option value="bus">{t('vehicleTypes.bus', 'Bus')}</option>
                      <option value="commercial_under_4t">{t('vehicleTypes.commercialUnder4t', 'Commercial < 4t')}</option>
                      <option value="commercial_over_4t">{t('vehicleTypes.commercialOver4t', 'Commercial > 4t')}</option>
                      <option value="taxi">{t('vehicleTypes.taxi', 'Taxi')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      {t('wizard.driverAge', 'Age')}
                    </label>
                    <select
                      value={rule.driver_age_group}
                      onChange={(e) => updateMatrixRule(index, 'driver_age_group', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                    >
                      <option value="under_24">{t('driverAge.under24', 'Under 24')}</option>
                      <option value="above_24">{t('driverAge.above24', '24+')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      {t('wizard.minAmount', 'Min')}
                    </label>
                    <input
                      type="number"
                      value={rule.offer_amount_min}
                      onChange={(e) => updateMatrixRule(index, 'offer_amount_min', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                      placeholder="0"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      {t('wizard.maxAmount', 'Max')}
                    </label>
                    <input
                      type="number"
                      value={rule.offer_amount_max}
                      onChange={(e) => updateMatrixRule(index, 'offer_amount_max', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                      placeholder="0"
                      dir="ltr"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      {t('wizard.price', 'Price')}
                    </label>
                    <input
                      type="number"
                      value={rule.price}
                      onChange={(e) => updateMatrixRule(index, 'price', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                      placeholder="0"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      <div className="flex gap-2 pt-2">
        <Button size="small" variant="outlined" onClick={onCancel}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button size="small" variant="contained" onClick={handleSave}>
          {t('common.save', 'Save')}
        </Button>
      </div>
    </div>
  );
};

export default AddCompanyWizard;
