import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close, CheckCircle, Warning, Settings, Info } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import ConfigurePricingModal from './ConfigurePricingModal';
import { getAllPricingTypes } from '../services/pricingTypeApi';
import { getPricingByCompany } from '../services/companyPricingApi';

const CompanyPricingManagementModal = ({ open, onClose, company, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();

  const [pricingTypes, setPricingTypes] = useState([]);
  const [configuredPricings, setConfiguredPricings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configureModalOpen, setConfigureModalOpen] = useState(false);
  const [selectedPricingType, setSelectedPricingType] = useState(null);

  useEffect(() => {
    if (open && company) {
      fetchData();
    }
  }, [open, company]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all pricing types
      const typesResponse = await getAllPricingTypes();
      const allPricingTypes = typesResponse.pricingTypes || typesResponse.data || [];

      // Filter pricing types based on company's insurance types
      const relevantPricingTypes = allPricingTypes.filter(pricingType => {
        // Check if any of the company's insurance types use this pricing type
        return company.insuranceTypes?.some(insuranceType => {
          const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
            ? insuranceType.pricing_type_id
            : insuranceType.pricing_type_id?._id;
          return pricingTypeId === pricingType._id;
        });
      });

      setPricingTypes(relevantPricingTypes);

      // Fetch configured pricings for this company
      const pricingResponse = await getPricingByCompany(company._id);
      const configured = pricingResponse.pricing || [];
      setConfiguredPricings(configured);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: t('companyPricing.fetchError', 'Failed to fetch pricing data')
      });
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = (pricingTypeId) => {
    return configuredPricings.some(p => {
      // pricing_type_id can be either a string or an object with _id
      const configuredId = typeof p.pricing_type_id === 'string'
        ? p.pricing_type_id
        : p.pricing_type_id?._id;
      return configuredId === pricingTypeId;
    });
  };

  const getConfiguredPricing = (pricingTypeId) => {
    return configuredPricings.find(p => {
      // pricing_type_id can be either a string or an object with _id
      const configuredId = typeof p.pricing_type_id === 'string'
        ? p.pricing_type_id
        : p.pricing_type_id?._id;
      return configuredId === pricingTypeId;
    });
  };

  const handleConfigureClick = (pricingType) => {
    setSelectedPricingType(pricingType);
    setConfigureModalOpen(true);
  };

  const handleConfigureSuccess = () => {
    fetchData();
    setConfigureModalOpen(false);
    setSelectedPricingType(null);
    if (onSuccess) onSuccess();
  };

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

  const getRulesSummary = (configured) => {
    if (!configured || !configured.rules) return null;

    if (configured.rules.fixedAmount) {
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Fixed: ₪{configured.rules.fixedAmount}
        </span>
      );
    }

    if (configured.rules.matrix && configured.rules.matrix.length > 0) {
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {configured.rules.matrix.length} rule(s) configured
        </span>
      );
    }

    return null;
  };

  const isRTL = language === 'ar' || language === 'he';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
              <h2 className="text-xl font-bold">{t('companyPricing.manageTitle', 'Manage Pricing Configuration')}</h2>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                {company?.name}
              </p>
            </div>
            <IconButton
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Close />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent className="dark:bg-navbarBack dark:text-white py-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {t('companyPricing.infoTitle', 'Company-Specific Pricing')}
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                      {t('companyPricing.infoDesc', 'Each company has its own pricing configuration for all insurance types')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Types List */}
              {pricingTypes.map((pricingType) => {
                const configured = isConfigured(pricingType._id);
                const configuredData = getConfiguredPricing(pricingType._id);
                const isDisabled = pricingType._id === 'compulsory' || pricingType._id === 'road_service';

                return (
                  <div
                    key={pricingType._id}
                    className={`bg-white dark:bg-dark2 rounded-lg border-2 transition-all duration-200 ${
                      configured
                        ? 'border-green-500 dark:border-green-600'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${isDisabled ? 'opacity-60' : 'hover:shadow-md'}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Icon */}
                          <div className="text-3xl">{getPricingTypeIcon(pricingType._id)}</div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {pricingType.name}
                              </h3>
                              {configured && (
                                <CheckCircle className="text-green-600 dark:text-green-400" fontSize="small" />
                              )}
                              {!configured && !isDisabled && (
                                <Warning className="text-yellow-600 dark:text-yellow-400" fontSize="small" />
                              )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {pricingType.description || getPricingTypeDescription(pricingType)}
                            </p>

                            {/* Configuration Status */}
                            {configured ? (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {t('companyPricing.configured', 'Configured')}
                                </span>
                                {getRulesSummary(configuredData)}
                              </div>
                            ) : !isDisabled ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                {t('companyPricing.notConfigured', 'Not Configured')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                {t('companyPricing.noConfigRequired', 'No Configuration Required')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {!isDisabled && (
                          <button
                            onClick={() => handleConfigureClick(pricingType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                              configured
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <Settings fontSize="small" />
                            {configured ? t('common.edit', 'Edit') : t('companyPricing.configure', 'Configure')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Configuration Summary */}
              <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('companyPricing.configurationProgress', 'Configuration Progress')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {configuredPricings.length} of {pricingTypes.length} pricing types configured
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {pricingTypes.length > 0
                        ? Math.round((configuredPricings.length / pricingTypes.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configure Pricing Modal */}
      <ConfigurePricingModal
        open={configureModalOpen}
        onClose={() => {
          setConfigureModalOpen(false);
          setSelectedPricingType(null);
        }}
        companyId={company?._id}
        pricingType={selectedPricingType}
        onSuccess={handleConfigureSuccess}
      />
    </>
  );
};

export default CompanyPricingManagementModal;
