import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close, Add, Delete } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import { createOrUpdatePricing, getSpecificPricing } from '../services/companyPricingApi';

const ConfigurePricingModal = ({ open, onClose, companyId, pricingType, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // For matrix-based pricing (comprehensive, third_party)
  const [matrixRules, setMatrixRules] = useState([]);

  // For fixed amount pricing (accident_fee_waiver)
  const [fixedAmount, setFixedAmount] = useState('');

  // For compulsory and road_service (no configuration needed)
  const isManualEntry = pricingType?._id === 'compulsory';
  const isRoadService = pricingType?._id === 'road_service';
  const isMatrixType = pricingType?._id === 'comprehensive' || pricingType?._id === 'third_party';
  const isFixedAmount = pricingType?._id === 'accident_fee_waiver';

  useEffect(() => {
    if (open && companyId && pricingType) {
      fetchExistingConfiguration();
    }
  }, [open, companyId, pricingType]);

  const fetchExistingConfiguration = async () => {
    setFetching(true);
    try {
      const response = await getSpecificPricing(companyId, pricingType._id);
      const config = response.pricing;

      if (config.rules?.matrix) {
        setMatrixRules(config.rules.matrix);
      }

      if (config.rules?.fixedAmount) {
        setFixedAmount(config.rules.fixedAmount.toString());
      }
    } catch (error) {
      // No existing configuration - start fresh
      console.log('No existing configuration found');
      resetForm();
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setMatrixRules([]);
    setFixedAmount('');
  };

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

  const validateForm = () => {
    if (isManualEntry) {
      return true; // No validation needed for manual entry
    }

    if (isRoadService) {
      Swal.fire({
        icon: 'info',
        title: t('companyPricing.info', 'Information'),
        text: t('companyPricing.roadServiceInfo', 'Road services are configured separately')
      });
      return false;
    }

    if (isFixedAmount) {
      if (!fixedAmount || parseFloat(fixedAmount) <= 0) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: t('companyPricing.validation.fixedAmountRequired', 'Valid fixed amount is required')
        });
        return false;
      }
      return true;
    }

    if (isMatrixType) {
      if (matrixRules.length === 0) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: t('companyPricing.validation.atLeastOneRule', 'At least one pricing rule is required')
        });
        return false;
      }

      for (let i = 0; i < matrixRules.length; i++) {
        const rule = matrixRules[i];
        if (!rule.vehicle_type || !rule.driver_age_group ||
            !rule.offer_amount_min || !rule.offer_amount_max || !rule.price) {
          Swal.fire({
            icon: 'error',
            title: t('common.error'),
            text: t('companyPricing.validation.allFieldsRequired', `All fields are required for rule ${i + 1}`)
          });
          return false;
        }

        if (parseFloat(rule.offer_amount_min) >= parseFloat(rule.offer_amount_max)) {
          Swal.fire({
            icon: 'error',
            title: t('common.error'),
            text: t('companyPricing.validation.minMaxError', `Min amount must be less than max amount in rule ${i + 1}`)
          });
          return false;
        }
      }

      return true;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let rules = {};

      if (isManualEntry) {
        rules = {}; // Empty rules for manual entry
      } else if (isFixedAmount) {
        rules = { fixedAmount: parseFloat(fixedAmount) };
      } else if (isMatrixType) {
        rules = {
          matrix: matrixRules.map(rule => ({
            vehicle_type: rule.vehicle_type,
            driver_age_group: rule.driver_age_group,
            offer_amount_min: parseFloat(rule.offer_amount_min),
            offer_amount_max: parseFloat(rule.offer_amount_max),
            price: parseFloat(rule.price)
          }))
        };
      }

      await createOrUpdatePricing(companyId, {
        pricing_type_id: pricingType._id,
        rules
      });

      Swal.fire({
        title: t('companyPricing.success', 'Success!'),
        text: t('companyPricing.configurationSaved', 'Pricing configuration saved successfully'),
        icon: 'success',
        timer: 2000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving pricing configuration:', error);
      Swal.fire({
        title: t('common.error'),
        text: error.response?.data?.message || t('companyPricing.errorSaving', 'Error saving configuration'),
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

  if (!pricingType) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <span>{t('companyPricing.configurePricing', 'Configure Pricing')}</span>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
              {pricingType.name}
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
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent className="dark:bg-navbarBack dark:text-white">
            <div className="mt-4">
              {/* Manual Entry (Compulsory) */}
              {isManualEntry && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t('companyPricing.manualEntryInfo', 'This pricing type requires manual entry during insurance creation. No configuration needed.')}
                  </p>
                </div>
              )}

              {/* Road Service */}
              {isRoadService && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {t('companyPricing.roadServiceInfo', 'Road services are configured in the dedicated Road Services page.')}
                  </p>
                </div>
              )}

              {/* Fixed Amount (Accident Fee Waiver) */}
              {isFixedAmount && (
                <div>
                  <label htmlFor="fixedAmount" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    {t('companyPricing.fixedAmount', 'Fixed Amount')} (₪) *
                  </label>
                  <input
                    type="number"
                    id="fixedAmount"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className="block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-dark2 dark:text-white dark:focus:border-blue-400"
                    placeholder="500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('companyPricing.fixedAmountHelp', 'Enter the fixed amount for accident fee waiver')}
                  </p>
                </div>
              )}

              {/* Matrix Pricing (Comprehensive / Third Party) */}
              {isMatrixType && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('companyPricing.pricingMatrix', 'Pricing Matrix')}
                    </h3>
                    <button
                      type="button"
                      onClick={addMatrixRule}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Add fontSize="small" />
                      {t('companyPricing.addRule', 'Add Rule')}
                    </button>
                  </div>

                  {matrixRules.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('companyPricing.noRules', 'No pricing rules defined yet. Click "Add Rule" to create one.')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matrixRules.map((rule, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('companyPricing.rule', 'Rule')} #{index + 1}
                            </h4>
                            <IconButton
                              size="small"
                              onClick={() => removeMatrixRule(index)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Vehicle Type */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('companyPricing.vehicleType', 'Vehicle Type')}
                              </label>
                              <select
                                value={rule.vehicle_type}
                                onChange={(e) => updateMatrixRule(index, 'vehicle_type', e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                              >
                                <option value="car">{t('companyPricing.car', 'Car')}</option>
                                <option value="bus">{t('companyPricing.bus', 'Bus')}</option>
                                <option value="commercial_under_4t">{t('companyPricing.commercialUnder4t', 'Commercial < 4t')}</option>
                                <option value="commercial_over_4t">{t('companyPricing.commercialOver4t', 'Commercial > 4t')}</option>
                                <option value="taxi">{t('companyPricing.taxi', 'Taxi')}</option>
                              </select>
                            </div>

                            {/* Driver Age Group */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('companyPricing.driverAge', 'Driver Age')}
                              </label>
                              <select
                                value={rule.driver_age_group}
                                onChange={(e) => updateMatrixRule(index, 'driver_age_group', e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                              >
                                <option value="under_24">{t('companyPricing.under24', 'Under 24')}</option>
                                <option value="above_24">{t('companyPricing.above24', '24 and Above')}</option>
                              </select>
                            </div>

                            {/* Offer Amount Min */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('companyPricing.minAmount', 'Min Amount (₪)')}
                              </label>
                              <input
                                type="number"
                                value={rule.offer_amount_min}
                                onChange={(e) => updateMatrixRule(index, 'offer_amount_min', e.target.value)}
                                step="1000"
                                min="0"
                                className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                                placeholder="60000"
                              />
                            </div>

                            {/* Offer Amount Max */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('companyPricing.maxAmount', 'Max Amount (₪)')}
                              </label>
                              <input
                                type="number"
                                value={rule.offer_amount_max}
                                onChange={(e) => updateMatrixRule(index, 'offer_amount_max', e.target.value)}
                                step="1000"
                                min="0"
                                className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                                placeholder="100000"
                              />
                            </div>

                            {/* Price */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('companyPricing.price', 'Price (₪)')}
                              </label>
                              <input
                                type="number"
                                value={rule.price}
                                onChange={(e) => updateMatrixRule(index, 'price', e.target.value)}
                                step="100"
                                min="0"
                                className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white"
                                placeholder="5000"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              disabled={loading || isRoadService}
              sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
            >
              {loading ? t('common.saving', 'Saving...') : t('companyPricing.saveConfiguration', 'Save Configuration')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default ConfigurePricingModal;
