import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Close,
  CheckCircle,
  Warning,
  Settings,
  Info,
  TrendingUp,
  AttachMoney,
  Speed
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import Swal from 'sweetalert2';
import ConfigurePricingModal from './ConfigurePricingModal';
import { getAllPricingTypes } from '../services/pricingTypeApi';
import { getPricingByCompany } from '../services/companyPricingApi';

const ImprovedCompanyPricingModal = ({ open, onClose, company, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();

  const [activeTab, setActiveTab] = useState(0);
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
      console.log('📊 Pricing Configurations Loaded:', {
        company: company.name,
        count: configured.length,
        configurations: configured.map(c => ({
          type: c.pricing_type_id?.name || c.pricing_type_id,
          rulesCount: c.rules?.matrix?.length || (c.rules?.fixedAmount ? 1 : 0)
        }))
      });
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
    const result = configuredPricings.some(p => {
      const configuredId = typeof p.pricing_type_id === 'string'
        ? p.pricing_type_id
        : p.pricing_type_id?._id;
      return configuredId === pricingTypeId;
    });
    return result;
  };

  const getConfiguredPricing = (pricingTypeId) => {
    return configuredPricings.find(p => {
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

  const categorizeTypes = () => {
    const categories = {
      configured: [],
      notConfigured: [],
      noConfigRequired: []
    };

    pricingTypes.forEach(type => {
      if (type._id === 'compulsory' || type._id === 'road_service') {
        categories.noConfigRequired.push(type);
      } else if (isConfigured(type._id)) {
        categories.configured.push(type);
      } else {
        categories.notConfigured.push(type);
      }
    });

    return categories;
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
        <div className="flex items-center gap-2 mt-2">
          <AttachMoney className="text-green-600 dark:text-green-400" fontSize="small" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            ₪{configured.rules.fixedAmount}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('companyPricing.fixedAmount', 'Fixed Amount')}
          </span>
        </div>
      );
    }

    if (configured.rules.matrix && configured.rules.matrix.length > 0) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <Speed className="text-blue-600 dark:text-blue-400" fontSize="small" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {configured.rules.matrix.length}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('companyPricing.matrixRules', 'matrix rules')}
          </span>
        </div>
      );
    }

    return null;
  };

  const renderPricingCard = (pricingType, showConfigureButton = true) => {
    const configured = isConfigured(pricingType._id);
    const configuredData = getConfiguredPricing(pricingType._id);
    const isDisabled = pricingType._id === 'compulsory' || pricingType._id === 'road_service';

    return (
      <div
        key={pricingType._id}
        className={`bg-white dark:bg-dark2 rounded-lg border-2 transition-all duration-200 ${
          configured
            ? 'border-green-500 dark:border-green-600 shadow-md'
            : isDisabled
            ? 'border-gray-300 dark:border-gray-700'
            : 'border-yellow-300 dark:border-yellow-700'
        } hover:shadow-lg`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Icon */}
              <div className="text-3xl flex-shrink-0">{getPricingTypeIcon(pricingType._id)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {pricingType.name}
                  </h3>
                  {configured && (
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" fontSize="small" />
                  )}
                  {!configured && !isDisabled && (
                    <Warning className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" fontSize="small" />
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {pricingType.description || getPricingTypeDescription(pricingType)}
                </p>

                {/* Type Badge */}
                {pricingType.requiresPricingTable !== undefined && (
                  <Chip
                    label={pricingType.requiresPricingTable ? t('companyPricing.matrixBased', 'Matrix-based') : t('companyPricing.simplePricing', 'Simple Pricing')}
                    size="small"
                    className={`mb-2 ${
                      pricingType.requiresPricingTable
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  />
                )}

                {/* Configuration Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  {configured ? (
                    <Chip
                      label={t('companyPricing.configured', 'Configured')}
                      size="small"
                      color="success"
                      icon={<CheckCircle />}
                    />
                  ) : !isDisabled ? (
                    <Chip
                      label={t('companyPricing.notConfigured', 'Not Configured')}
                      size="small"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      icon={<Warning />}
                    />
                  ) : (
                    <Chip
                      label={t('companyPricing.noConfigRequired', 'No Configuration Required')}
                      size="small"
                      className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    />
                  )}
                </div>

                {/* Rules Summary */}
                {configured && configuredData && getRulesSummary(configuredData)}
              </div>
            </div>

            {/* Action Button */}
            {!isDisabled && showConfigureButton && (
              <button
                onClick={() => handleConfigureClick(pricingType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex-shrink-0 ${
                  configured
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
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
  };

  const categories = categorizeTypes();
  const totalConfigurable = categories.configured.length + categories.notConfigured.length;
  const completionPercentage = totalConfigurable > 0
    ? Math.round((categories.configured.length / totalConfigurable) * 100)
    : 0;

  const isRTL = language === 'ar' || language === 'he';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        dir={isRTL ? "rtl" : "ltr"}
        PaperProps={{
          className: 'dark:bg-navbarBack'
        }}
      >
        <DialogTitle className="dark:text-white border-b dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold">{t('companyPricing.manageTitle', 'Pricing Configuration')}</h2>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                {company?.name}
              </p>
            </div>

            {/* Progress Summary */}
            <div className="flex items-center gap-4 mx-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('companyPricing.progress', 'Progress')}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {completionPercentage}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('companyPricing.configured', 'Configured')}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {categories.configured.length}/{totalConfigurable}
                </p>
              </div>
            </div>

            <IconButton
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Close />
            </IconButton>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              className="h-2 rounded-full"
              sx={{
                backgroundColor: 'rgba(156, 163, 175, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: completionPercentage === 100 ? '#10b981' : completionPercentage >= 50 ? '#3b82f6' : '#f59e0b',
                  borderRadius: '9999px'
                }
              }}
            />
          </div>
        </DialogTitle>

        <DialogContent className="dark:bg-navbarBack dark:text-white py-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {t('companyPricing.infoTitle', 'Company-Specific Pricing')}
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                      {t('companyPricing.infoDesc', 'Configure pricing for each insurance type offered by this company')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Box className="mb-6">
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  className="border-b border-gray-200 dark:border-gray-700"
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgb(156 163 175)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      minHeight: '48px',
                      '&.Mui-selected': {
                        color: 'rgb(59 130 246)',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'rgb(59 130 246)',
                      height: '3px'
                    }
                  }}
                >
                  <Tab
                    label={
                      <div className="flex items-center gap-2">
                        <TrendingUp fontSize="small" />
                        {t('companyPricing.tabs.all', 'All')} ({pricingTypes.length})
                      </div>
                    }
                  />
                  <Tab
                    label={
                      <div className="flex items-center gap-2">
                        <CheckCircle fontSize="small" />
                        {t('companyPricing.tabs.configured', 'Configured')} ({categories.configured.length})
                      </div>
                    }
                  />
                  <Tab
                    label={
                      <div className="flex items-center gap-2">
                        <Warning fontSize="small" />
                        {t('companyPricing.tabs.pending', 'Pending')} ({categories.notConfigured.length})
                      </div>
                    }
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <div className="space-y-3">
                {activeTab === 0 && (
                  // All Pricing Types
                  <>
                    {pricingTypes.length === 0 ? (
                      <div className="text-center py-8">
                        <Info className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('companyPricing.noPricingTypes', 'No pricing types available for this company')}
                        </p>
                      </div>
                    ) : (
                      pricingTypes.map(type => renderPricingCard(type))
                    )}
                  </>
                )}

                {activeTab === 1 && (
                  // Configured
                  <>
                    {categories.configured.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('companyPricing.noConfigured', 'No pricing types have been configured yet')}
                        </p>
                      </div>
                    ) : (
                      categories.configured.map(type => renderPricingCard(type))
                    )}
                  </>
                )}

                {activeTab === 2 && (
                  // Pending
                  <>
                    {categories.notConfigured.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-3" />
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          {t('companyPricing.allConfigured', 'All pricing types have been configured!')}
                        </p>
                      </div>
                    ) : (
                      categories.notConfigured.map(type => renderPricingCard(type))
                    )}
                  </>
                )}
              </div>
            </>
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

export default ImprovedCompanyPricingModal;
