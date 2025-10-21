import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Close,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  Business,
  Category,
  AttachMoney,
  CarRepair,
  AssignmentTurnedIn,
  Add,
  Delete,
  Edit
} from '@mui/icons-material';
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
  const [createdCompanyId, setCreatedCompanyId] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [roadServiceError, setRoadServiceError] = useState('');

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
    { label: t('wizard.step1', 'Company Info'), icon: <Business /> },
    { label: t('wizard.step2', 'Insurance Types'), icon: <Category /> },
    { label: t('wizard.step3', 'Pricing Setup'), icon: <AttachMoney /> },
    { label: t('wizard.step4', 'Road Services'), icon: <CarRepair /> },
    { label: t('wizard.step5', 'Review & Submit'), icon: <AssignmentTurnedIn /> }
  ];

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    try {
      // Fetch insurance types
      const insuranceTypesRes = await insuranceTypeApi.getAll();
      const types = Array.isArray(insuranceTypesRes)
        ? insuranceTypesRes
        : (insuranceTypesRes.data || insuranceTypesRes.insuranceTypes || []);
      setAvailableInsuranceTypes(types);

      // Fetch pricing types
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
    setCreatedCompanyId(null);
    setEditingPricingType(null);
    setEditingRoadService(null);
    setValidationError('');
    setRoadServiceError('');
  };

  const handleNext = async () => {
    // Clear previous validation errors
    setValidationError('');

    // Validate current step
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

    // Move to next step
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setValidationError('');
    setRoadServiceError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Step 1: Create company
      const companyData = {
        name: companyName,
        description: companyDescription,
        insuranceTypeIds: selectedInsuranceTypes,
        roadServiceIds: [] // Will be added after creating road services
      };

      const companyResponse = await createCompany(companyData);
      const newCompanyId = companyResponse.company?._id || companyResponse._id;
      setCreatedCompanyId(newCompanyId);

      // Step 2: Create pricing configurations
      for (const [pricingTypeId, config] of Object.entries(pricingConfigs)) {
        if (config && Object.keys(config).length > 0) {
          await createOrUpdatePricing(newCompanyId, {
            pricing_type_id: pricingTypeId,
            rules: config
          });
        }
      }

      // Step 3: Create road services
      for (const service of roadServices) {
        await createRoadService(newCompanyId, {
          service_name: service.service_name,
          normal_price: parseFloat(service.normal_price),
          old_car_price: parseFloat(service.old_car_price),
          cutoff_year: parseInt(service.cutoff_year),
          description: service.description
        });
      }

      // Success
      Swal.fire({
        icon: 'success',
        title: t('wizard.success', 'Success!'),
        text: t('wizard.companyCreated', 'Insurance company created successfully with all configurations'),
        timer: 3000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating company:', error);
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: error.response?.data?.message || t('wizard.errorCreating', 'Failed to create company')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (activeStep > 0 && activeStep < steps.length - 1) {
      Swal.fire({
        title: t('wizard.confirmClose', 'Are you sure?'),
        text: t('wizard.confirmCloseText', 'Your progress will be lost'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel')
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

  // Step 2: Toggle insurance type selection
  const toggleInsuranceType = (typeId) => {
    setSelectedInsuranceTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  // Step 3: Pricing configuration helpers
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

  // Step 4: Road service helpers
  const addRoadService = () => {
    setRoadServiceError('');

    if (!roadServiceForm.service_name || !roadServiceForm.normal_price || !roadServiceForm.old_car_price) {
      setRoadServiceError(t('wizard.validation.roadServiceRequired', 'Please fill all required fields'));
      return;
    }

    if (editingRoadService !== null) {
      // Update existing
      const updated = [...roadServices];
      updated[editingRoadService] = { ...roadServiceForm };
      setRoadServices(updated);
      setEditingRoadService(null);
    } else {
      // Add new
      setRoadServices((prev) => [...prev, { ...roadServiceForm }]);
    }

    // Reset form
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
  };

  const getStepProgress = () => {
    const total = steps.length;
    return ((activeStep + 1) / total) * 100;
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="text-center mb-4 sm:mb-6">
              <Business className="text-blue-600 dark:text-blue-400 mx-auto mb-2" sx={{ fontSize: { xs: 36, sm: 48 } }} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('wizard.step1Title', 'Company Information')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 px-2">
                {t('wizard.step1Desc', 'Enter basic details about the insurance company')}
              </p>
            </div>

            {validationError && (
              <Alert severity="error" onClose={() => setValidationError('')} className="mb-3">
                {validationError}
              </Alert>
            )}

            <TextField
              fullWidth
              label={t('wizard.companyName', 'Company Name')}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="dark:text-white"
              InputLabelProps={{ className: 'dark:text-gray-400' }}
              InputProps={{
                className: 'dark:text-white dark:bg-dark2',
                dir: isRTL ? 'rtl' : 'ltr'
              }}
            />

            <TextField
              fullWidth
              label={t('wizard.companyDescription', 'Description (Optional)')}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              multiline
              rows={3}
              className="dark:text-white"
              InputLabelProps={{ className: 'dark:text-gray-400' }}
              InputProps={{
                className: 'dark:text-white dark:bg-dark2',
                dir: isRTL ? 'rtl' : 'ltr'
              }}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="text-center mb-4 sm:mb-6">
              <Category className="text-blue-600 dark:text-blue-400 mx-auto mb-2" sx={{ fontSize: { xs: 36, sm: 48 } }} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('wizard.step2Title', 'Select Insurance Types')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 px-2">
                {t('wizard.step2Desc', 'Choose which insurance types this company will offer')}
              </p>
            </div>

            {validationError && (
              <Alert severity="error" onClose={() => setValidationError('')} className="mb-3">
                {validationError}
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-3">
              {availableInsuranceTypes.map((type) => (
                <div
                  key={type._id}
                  onClick={() => toggleInsuranceType(type._id)}
                  className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedInsuranceTypes.includes(type._id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className={`flex items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{type.name}</h4>
                      {type.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{type.description}</p>
                      )}
                    </div>
                    <Checkbox
                      checked={selectedInsuranceTypes.includes(type._id)}
                      onChange={() => toggleInsuranceType(type._id)}
                      color="primary"
                      className="flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedInsuranceTypes.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ {selectedInsuranceTypes.length} {t('wizard.typesSelected', 'insurance type(s) selected')}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        // Filter pricing types based on selected insurance types
        const relevantPricingTypes = pricingTypes.filter(pricingType => {
          // Get selected insurance types
          const selectedTypes = availableInsuranceTypes.filter(it =>
            selectedInsuranceTypes.includes(it._id)
          );

          // Check if any selected insurance type uses this pricing type
          return selectedTypes.some(insuranceType => {
            const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
              ? insuranceType.pricing_type_id
              : insuranceType.pricing_type_id?._id;
            return pricingTypeId === pricingType._id;
          });
        }).filter(pt => pt._id !== 'compulsory' && pt._id !== 'road_service');

        return (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="text-center mb-4 sm:mb-6">
              <AttachMoney className="text-blue-600 dark:text-blue-400 mx-auto mb-2" sx={{ fontSize: { xs: 36, sm: 48 } }} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('wizard.step3Title', 'Configure Pricing')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 px-2">
                {t('wizard.step3Desc', 'Set up pricing rules for each insurance type (optional)')}
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
                <p className="text-yellow-800 dark:text-yellow-300">
                  {t('wizard.noPricingTypesAvailable', 'The selected insurance types do not require pricing configuration, or all selected types use manual pricing.')}
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
                      className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4"
                    >
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'} w-full`}>
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{pricingType.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{pricingType.description}</p>
                          {isConfigured && (
                            <Chip
                              label={t('wizard.configured', 'Configured')}
                              size="small"
                              color="success"
                              icon={<CheckCircle />}
                              className="mt-2"
                            />
                          )}
                        </div>
                        <div className={`flex gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {isConfigured && (
                            <IconButton
                              size="small"
                              onClick={() => removePricingConfig(pricingType._id)}
                              className="text-red-600"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                          <Button
                            size="small"
                            variant={isConfigured ? "outlined" : "contained"}
                            onClick={() => setEditingPricingType(pricingType)}
                            fullWidth
                            className="sm:w-auto"
                          >
                            {isConfigured ? t('common.edit', 'Edit') : t('wizard.configure', 'Configure')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ℹ️ {t('wizard.pricingOptional', 'Pricing configuration is optional. You can skip this step and configure later.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="text-center mb-4 sm:mb-6">
              <CarRepair className="text-blue-600 dark:text-blue-400 mx-auto mb-2" sx={{ fontSize: { xs: 36, sm: 48 } }} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('wizard.step4Title', 'Road Services')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 px-2">
                {t('wizard.step4Desc', 'Add road services offered by this company (optional)')}
              </p>
            </div>

            {roadServiceError && (
              <Alert severity="error" onClose={() => setRoadServiceError('')} className="mb-3">
                {roadServiceError}
              </Alert>
            )}

            {/* Road Service Form */}
            <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-3 sm:p-4 space-y-3">
              <TextField
                fullWidth
                size="small"
                label={t('wizard.serviceName', 'Service Name')}
                value={roadServiceForm.service_name}
                onChange={(e) => setRoadServiceForm({ ...roadServiceForm, service_name: e.target.value })}
                InputProps={{ dir: isRTL ? 'rtl' : 'ltr' }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('wizard.normalPrice', 'Normal Price (₪)')}
                  value={roadServiceForm.normal_price}
                  onChange={(e) => setRoadServiceForm({ ...roadServiceForm, normal_price: e.target.value })}
                  InputProps={{ dir: 'ltr' }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('wizard.oldCarPrice', 'Old Car Price (₪)')}
                  value={roadServiceForm.old_car_price}
                  onChange={(e) => setRoadServiceForm({ ...roadServiceForm, old_car_price: e.target.value })}
                  InputProps={{ dir: 'ltr' }}
                />
              </div>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('wizard.cutoffYear', 'Cutoff Year')}
                value={roadServiceForm.cutoff_year}
                onChange={(e) => setRoadServiceForm({ ...roadServiceForm, cutoff_year: e.target.value })}
                InputProps={{ dir: 'ltr' }}
              />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label={t('wizard.description', 'Description')}
                value={roadServiceForm.description}
                onChange={(e) => setRoadServiceForm({ ...roadServiceForm, description: e.target.value })}
                InputProps={{ dir: isRTL ? 'rtl' : 'ltr' }}
              />
              <Button
                fullWidth
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
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t('wizard.addedServices', 'Added Services')} ({roadServices.length})
                </h4>
                {roadServices.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-navbarBack rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h5 className="font-medium text-gray-900 dark:text-white">{service.service_name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" dir="ltr">
                          {t('roadService.labels.normalPrice', 'Normal')}: ₪{service.normal_price} | {t('roadService.labels.oldCarPrice', 'Old Car')}: ₪{service.old_car_price} | {t('roadService.labels.year', 'Year')}: {service.cutoff_year}
                        </p>
                      </div>
                      <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="text-center mb-4 sm:mb-6">
              <AssignmentTurnedIn className="text-green-600 dark:text-green-400 mx-auto mb-2" sx={{ fontSize: { xs: 36, sm: 48 } }} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('wizard.step5Title', 'Review & Submit')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 px-2">
                {t('wizard.step5Desc', 'Review all information before creating the company')}
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-3 sm:space-y-4">
              {/* Company Info */}
              <div className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <h4 className={`text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Business fontSize="small" />
                  {t('wizard.companyInfo', 'Company Information')}
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <span className="text-gray-600 dark:text-gray-400">{t('wizard.name', 'Name')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white break-words">{companyName}</span>
                  </div>
                  {companyDescription && (
                    <div className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                      <span className="text-gray-600 dark:text-gray-400">{t('wizard.description', 'Description')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white break-words">{companyDescription}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Types */}
              <div className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <h4 className={`text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Category fontSize="small" />
                  {t('wizard.insuranceTypes', 'Insurance Types')} ({selectedInsuranceTypes.length})
                </h4>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                  {availableInsuranceTypes
                    .filter((type) => selectedInsuranceTypes.includes(type._id))
                    .map((type) => (
                      <Chip key={type._id} label={type.name} color="primary" size="small" />
                    ))}
                </div>
              </div>

              {/* Pricing Configurations */}
              <div className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <h4 className={`text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AttachMoney fontSize="small" />
                  {t('wizard.pricingConfigs', 'Pricing Configurations')} ({Object.keys(pricingConfigs).length})
                </h4>
                {Object.keys(pricingConfigs).length > 0 ? (
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                    {Object.keys(pricingConfigs).map((typeId) => {
                      const pricingType = pricingTypes.find((pt) => pt._id === typeId);
                      return (
                        <Chip
                          key={typeId}
                          label={pricingType?.name || typeId}
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-xs sm:text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('wizard.noPricingConfigured', 'No pricing configured (can be added later)')}
                  </p>
                )}
              </div>

              {/* Road Services */}
              <div className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <h4 className={`text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CarRepair fontSize="small" />
                  {t('wizard.roadServices', 'Road Services')} ({roadServices.length})
                </h4>
                {roadServices.length > 0 ? (
                  <div className="space-y-2">
                    {roadServices.map((service, index) => (
                      <div key={index} className={`text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className="font-medium text-gray-900 dark:text-white break-words">{service.service_name}</span>
                        <span className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'mr-2' : 'ml-2'}`} dir="ltr">
                          (₪{service.normal_price} / ₪{service.old_car_price})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs sm:text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('wizard.noRoadServices', 'No road services added (can be added later)')}
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
      maxWidth="md"
      fullWidth
      dir={isRTL ? 'rtl' : 'ltr'}
      PaperProps={{
        className: 'dark:bg-navbarBack m-2 sm:m-4',
        sx: {
          maxHeight: { xs: '95vh', sm: '90vh' }
        }
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-bold truncate">{t('wizard.title', 'Add New Insurance Company')}</h2>
            <p className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
              {t('wizard.subtitle', 'Step-by-step setup wizard')}
            </p>
          </div>
          <IconButton
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            size="small"
          >
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      <div className="px-3 sm:px-6 pt-3 sm:pt-4">
        <LinearProgress variant="determinate" value={getStepProgress()} className="mb-3 sm:mb-4" />
        {/* Desktop Stepper */}
        <div className="hidden md:block">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={() => (
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        index === activeStep
                          ? 'bg-blue-600 text-white'
                          : index < activeStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {index < activeStep ? <CheckCircle fontSize="small" /> : step.icon}
                    </div>
                  )}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
        {/* Mobile/Tablet Stepper */}
        <div className="md:hidden">
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={() => (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === activeStep
                          ? 'bg-blue-600 text-white'
                          : index < activeStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {index < activeStep ? <CheckCircle fontSize="small" /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                  )}
                />
              </Step>
            ))}
          </Stepper>
          <div className="text-center mt-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {steps[activeStep].label}
            </p>
          </div>
        </div>
      </div>

      <DialogContent className="dark:bg-navbarBack dark:text-white min-h-[300px] sm:min-h-[400px] px-3 sm:px-6 overflow-y-auto">
        {renderStepContent()}
      </DialogContent>

      <div className={`flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-t dark:border-gray-700 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          startIcon={isRTL ? <NavigateNext /> : <NavigateBefore />}
          fullWidth
          className="sm:w-auto order-2 sm:order-none"
        >
          {t('common.back', 'Back')}
        </Button>

        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''} order-1 sm:order-none`}>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={isRTL ? <NavigateBefore /> : <NavigateNext />}
              disabled={loading}
              fullWidth
              className="sm:w-auto"
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
              fullWidth
              className="sm:w-auto"
            >
              {loading ? t('common.creating', 'Creating...') : t('wizard.createCompany', 'Create Company')}
            </Button>
          )}
        </div>
      </div>
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
    <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">{pricingType.name}</h4>

      {isFixedAmount ? (
        <TextField
          fullWidth
          type="number"
          label={t('wizard.fixedAmount', 'Fixed Amount (₪)')}
          value={fixedAmount}
          onChange={(e) => setFixedAmount(e.target.value)}
          InputProps={{ dir: 'ltr' }}
        />
      ) : isMatrixType ? (
        <div className="space-y-3">
          <Button size="small" startIcon={<Add />} onClick={addMatrixRule}>
            {t('wizard.addRule', 'Add Rule')}
          </Button>
          {matrixRules.map((rule, index) => (
            <div key={index} className="bg-white dark:bg-navbarBack rounded p-3 space-y-2">
              <div className={`flex justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium">{t('wizard.ruleNumber', 'Rule #{{number}}', { number: index + 1 })}</span>
                <IconButton size="small" onClick={() => removeMatrixRule(index)}>
                  <Delete fontSize="small" />
                </IconButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  select
                  size="small"
                  label={t('wizard.vehicleType', 'Vehicle Type')}
                  value={rule.vehicle_type}
                  onChange={(e) => updateMatrixRule(index, 'vehicle_type', e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="car">{t('vehicleTypes.car', 'Car')}</option>
                  <option value="bus">{t('vehicleTypes.bus', 'Bus')}</option>
                  <option value="commercial_under_4t">{t('vehicleTypes.commercialUnder4t', 'Commercial < 4t')}</option>
                  <option value="commercial_over_4t">{t('vehicleTypes.commercialOver4t', 'Commercial > 4t')}</option>
                  <option value="taxi">{t('vehicleTypes.taxi', 'Taxi')}</option>
                </TextField>
                <TextField
                  select
                  size="small"
                  label={t('wizard.driverAge', 'Driver Age')}
                  value={rule.driver_age_group}
                  onChange={(e) => updateMatrixRule(index, 'driver_age_group', e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="under_24">{t('driverAge.under24', 'Under 24')}</option>
                  <option value="above_24">{t('driverAge.above24', '24 and Above')}</option>
                </TextField>
                <TextField
                  size="small"
                  type="number"
                  label={t('wizard.minAmount', 'Min Amount')}
                  value={rule.offer_amount_min}
                  onChange={(e) => updateMatrixRule(index, 'offer_amount_min', e.target.value)}
                  InputProps={{ dir: 'ltr' }}
                />
                <TextField
                  size="small"
                  type="number"
                  label={t('wizard.maxAmount', 'Max Amount')}
                  value={rule.offer_amount_max}
                  onChange={(e) => updateMatrixRule(index, 'offer_amount_max', e.target.value)}
                  InputProps={{ dir: 'ltr' }}
                />
                <TextField
                  size="small"
                  type="number"
                  label={t('wizard.price', 'Price')}
                  value={rule.price}
                  onChange={(e) => updateMatrixRule(index, 'price', e.target.value)}
                  className="col-span-2"
                  InputProps={{ dir: 'ltr' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button variant="outlined" onClick={onCancel}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {t('common.save', 'Save')}
        </Button>
      </div>
    </div>
  );
};

export default AddCompanyWizard;
