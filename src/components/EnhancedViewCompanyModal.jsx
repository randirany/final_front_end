import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Close,
  Business,
  Description,
  CalendarToday,
  Edit,
  Delete,
  Settings,
  CarRepair,
  AttachMoney,
  Category,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import Swal from 'sweetalert2';
import { getCompanyById, deleteCompany } from '../services/insuranceCompanyApi';
import { getPricingByCompany } from '../services/companyPricingApi';
import { insuranceTypeApi } from '../services/insuranceTypeApi';

const EnhancedViewCompanyModal = ({ open, onClose, companyId, onEdit, onDelete, onConfigurePricing, onManageRoadServices }) => {
  const { t, i18n: { language } } = useTranslation();

  const [company, setCompany] = useState(null);
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [insuranceTypesDetails, setInsuranceTypesDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && companyId) {
      fetchCompanyData();
    }
  }, [open, companyId]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      // Fetch company details
      const response = await getCompanyById(companyId);
      const companyData = response.company || response;
      setCompany(companyData);

      // Fetch full insurance type details for each insurance type
      if (companyData.insuranceTypes && companyData.insuranceTypes.length > 0) {
        const insuranceTypePromises = companyData.insuranceTypes.map(async (insuranceType) => {
          try {
            const typeResponse = await insuranceTypeApi.getById(insuranceType._id);
            return typeResponse.insuranceType || typeResponse;
          } catch (error) {
            console.error('Error fetching insurance type:', insuranceType._id, error);
            return insuranceType; // Return basic info if fetch fails
          }
        });

        const detailedInsuranceTypes = await Promise.all(insuranceTypePromises);
        setInsuranceTypesDetails(detailedInsuranceTypes);
      }

      // Fetch pricing configurations
      try {
        const pricingResponse = await getPricingByCompany(companyData._id);
        setPricingConfigs(pricingResponse.pricing || []);
      } catch (error) {
        console.log('No pricing configurations found');
        setPricingConfigs([]);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      Swal.fire({
        title: t('companies.error', 'Error'),
        text: t('companies.errorFetchingCompany', 'Error loading company data'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompany(null);
    setPricingConfigs([]);
    setInsuranceTypesDetails([]);
    setActiveTab(0);
    onClose();
  };

  const handleEditClick = () => {
    if (onEdit && company) {
      onEdit(company);
      handleClose();
    }
  };

  const handleDeleteClick = async () => {
    if (!company) return;

    const result = await Swal.fire({
      title: t('common.areYouSure'),
      html: `
        <div class="text-left">
          <p class="mb-3">${t('companies.deleteWarning', 'This will permanently delete:')}</p>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li><strong>${company.name}</strong></li>
            <li>${pricingConfigs.length} ${t('companies.pricingConfigurations', 'pricing configuration(s)')}</li>
            <li>${company.roadServices?.length || 0} ${t('companies.roadServices', 'road service(s)')}</li>
          </ul>
          <p class="mt-3 text-red-600 font-semibold">${t('companies.deleteCannotBeUndone', 'This action cannot be undone!')}</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      width: '500px'
    });

    if (result.isConfirmed) {
      try {
        await deleteCompany(company._id);
        Swal.fire({
          icon: 'success',
          title: t('common.deleted'),
          text: t('companies.deleteSuccess', 'Company deleted successfully'),
          timer: 2000
        });
        if (onDelete) onDelete();
        handleClose();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: error.response?.data?.message || t('companies.deleteError', 'Failed to delete company')
        });
      }
    }
  };

  const handleConfigurePricingClick = () => {
    if (onConfigurePricing && company) {
      onConfigurePricing(company);
      handleClose();
    }
  };

  const handleManageRoadServicesClick = () => {
    if (onManageRoadServices && company) {
      onManageRoadServices(company);
      handleClose();
    }
  };

  const getPricingProgress = () => {
    // Use detailed insurance types if available, otherwise use basic company data
    const insuranceTypes = insuranceTypesDetails.length > 0 ? insuranceTypesDetails : (company?.insuranceTypes || []);

    // Count how many insurance types have pricing configured
    let configuredCount = 0;
    insuranceTypes.forEach(insuranceType => {
      const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
        ? insuranceType.pricing_type_id
        : insuranceType.pricing_type_id?._id;

      if (pricingTypeId) {
        const config = getPricingTypeConfig(pricingTypeId);
        if (config) {
          configuredCount++;
        }
      }
    });

    const total = insuranceTypes.length;
    const percentage = total > 0 ? (configuredCount / total) * 100 : 0;

    return {
      configured: configuredCount,
      total: total,
      percentage
    };
  };

  const getPricingTypeConfig = (pricingTypeId) => {
    return pricingConfigs.find(config => {
      const configId = typeof config.pricing_type_id === 'string'
        ? config.pricing_type_id
        : config.pricing_type_id?._id;
      return configId === pricingTypeId;
    });
  };

  const renderOverviewTab = () => {
    const progress = getPricingProgress();

    return (
      <div className="space-y-6 mt-4">
        {/* Company Information */}
        <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Business className="text-blue-600 dark:text-blue-400" />
            {t('companies.companyInformation', 'Company Information')}
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Business className="text-gray-400 mt-0.5" fontSize="small" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('companies.name', 'Company Name')}
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {company.name}
                </p>
              </div>
            </div>

            {company.description && (
              <div className="flex items-start gap-3">
                <Description className="text-gray-400 mt-0.5" fontSize="small" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('companies.description', 'Description')}
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {company.description}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarToday className="text-gray-400 mt-0.5" fontSize="small" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('companies.createdAt', 'Created Date')}
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(company.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {company.insuranceTypes?.length || 0}
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
              {t('companies.insuranceTypes', 'Insurance Types')}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {progress.configured}/{progress.total}
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-300 mt-1">
              {t('companies.pricingConfigured', 'Pricing Configured')}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {company.roadServices?.length || 0}
            </div>
            <div className="text-xs text-green-800 dark:text-green-300 mt-1">
              {t('companies.roadServices', 'Road Services')}
            </div>
          </div>
        </div>

        {/* Pricing Progress */}
        {progress.total > 0 && (
          <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('companies.pricingProgress', 'Pricing Configuration Progress')}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(progress.percentage)}%
              </span>
            </div>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress.percentage === 100 ? '#10b981' : progress.percentage >= 50 ? '#3b82f6' : '#f59e0b'
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderInsuranceTypesTab = () => {
    const insuranceTypesToDisplay = insuranceTypesDetails.length > 0 ? insuranceTypesDetails : (company?.insuranceTypes || []);

    return (
      <div className="space-y-4 mt-4">
        {insuranceTypesToDisplay.length > 0 ? (
          insuranceTypesToDisplay.map((insuranceType) => {
            // Get pricing type ID from the insurance type
            const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
              ? insuranceType.pricing_type_id
              : insuranceType.pricing_type_id?._id;

            const pricingTypeName = typeof insuranceType.pricing_type_id === 'object'
              ? insuranceType.pricing_type_id?.name
              : pricingTypeId;

            // Find matching pricing configuration
            const config = getPricingTypeConfig(pricingTypeId);
            const isConfigured = !!config;

            return (
              <div
                key={insuranceType._id}
                className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Category className="text-blue-600 dark:text-blue-400" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {insuranceType.name}
                      </h4>
                      {isConfigured ? (
                        <CheckCircle className="text-green-600 dark:text-green-400" fontSize="small" />
                      ) : (
                        <Warning className="text-yellow-600 dark:text-yellow-400" fontSize="small" />
                      )}
                    </div>

                    {insuranceType.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {insuranceType.description}
                      </p>
                    )}

                    {/* Display Pricing Type */}
                    {pricingTypeId && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Chip
                          label={pricingTypeName || pricingTypeId}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {isConfigured ? (
                          <Chip
                            label={t('companies.configured', 'Configured')}
                            size="small"
                            color="success"
                            icon={<CheckCircle />}
                          />
                        ) : (
                          <Chip
                            label={t('companies.notConfigured', 'Not Configured')}
                            size="small"
                            color="warning"
                            icon={<Warning />}
                          />
                        )}
                      </div>
                    )}

                    {/* Display Pricing Configuration Summary */}
                    {isConfigured && config && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('companies.pricingConfiguration', 'Pricing Configuration')}:
                        </h5>

                        {config.rules?.fixedAmount && (
                          <div className="flex items-center gap-2">
                            <AttachMoney className="text-green-600 dark:text-green-400" fontSize="small" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t('companyPricing.fixedAmount', 'Fixed Amount')}:
                            </span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              ₪{config.rules.fixedAmount.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {config.rules?.matrix && config.rules.matrix.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Category className="text-blue-600 dark:text-blue-400" fontSize="small" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {config.rules.matrix.length} {t('companyPricing.pricingRules', 'pricing rule(s)')} -
                            </span>
                            <span
                              className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                              onClick={() => setActiveTab(2)}
                            >
                              {t('companies.viewDetails', 'View Details')}
                            </span>
                          </div>
                        )}

                        {!config.rules?.fixedAmount && !config.rules?.matrix && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('companyPricing.manualEntry', 'Manual entry - no pricing rules configured')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Not Configured Warning */}
                    {!isConfigured && pricingTypeId && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                        <Warning className="text-yellow-600 dark:text-yellow-400 mt-0.5" fontSize="small" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          {t('companies.pricingNotConfigured', 'Pricing configuration is missing for this insurance type')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('companies.noInsuranceTypes', 'No insurance types configured')}
          </p>
        )}
      </div>
    );
  };

  const renderPricingDetailsTab = () => {
    return (
      <div className="space-y-4 mt-4">
        {pricingConfigs && pricingConfigs.length > 0 ? (
          pricingConfigs.map((config) => {
            const pricingTypeName = config.pricing_type_id?.name || config.pricing_type_id;
            const requiresPricingTable = config.pricing_type_id?.requiresPricingTable;

            return (
              <div
                key={config._id}
                className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AttachMoney className="text-green-600 dark:text-green-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pricingTypeName}
                  </h4>
                  {requiresPricingTable && (
                    <Chip
                      label={t('companyPricing.matrixBased', 'Matrix Based')}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </div>

                {config.pricing_type_id?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {config.pricing_type_id.description}
                  </p>
                )}

                {/* Fixed Amount Pricing */}
                {config.rules?.fixedAmount && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AttachMoney className="text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('companyPricing.fixedAmount', 'Fixed Amount')}:
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ₪{config.rules.fixedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Matrix-Based Pricing */}
                {config.rules?.matrix && config.rules.matrix.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                            {t('companyPricing.vehicleType', 'Vehicle Type')}
                          </th>
                          <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                            {t('companyPricing.driverAge', 'Driver Age')}
                          </th>
                          <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                            {t('companyPricing.minAmount', 'Min Amount')}
                          </th>
                          <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                            {t('companyPricing.maxAmount', 'Max Amount')}
                          </th>
                          <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                            {t('companyPricing.price', 'Price')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.rules.matrix.map((row, idx) => (
                          <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-3 py-2 text-gray-900 dark:text-white capitalize">
                              {row.vehicle_type || '-'}
                            </td>
                            <td className="px-3 py-2 text-gray-900 dark:text-white">
                              {row.driver_age_group === 'above_24' ? t('companyPricing.above24', 'Above 24') : row.driver_age_group === 'below_24' ? t('companyPricing.below24', 'Below 24') : row.driver_age_group}
                            </td>
                            <td className="px-3 py-2 text-gray-900 dark:text-white">
                              ₪{row.offer_amount_min?.toLocaleString() || 0}
                            </td>
                            <td className="px-3 py-2 text-gray-900 dark:text-white">
                              ₪{row.offer_amount_max?.toLocaleString() || 0}
                            </td>
                            <td className="px-3 py-2 font-semibold text-green-600 dark:text-green-400">
                              ₪{row.price?.toLocaleString() || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty Rules */}
                {!config.rules?.fixedAmount && !config.rules?.matrix && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                    <Warning className="text-yellow-600 dark:text-yellow-400 mb-2" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {t('companyPricing.noRulesConfigured', 'No pricing rules configured')}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <AttachMoney className="text-gray-400 text-5xl mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('companies.noPricingConfigurations', 'No pricing configurations found')}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderRoadServicesTab = () => {
    return (
      <div className="space-y-3 mt-4">
        {company.roadServices && company.roadServices.length > 0 ? (
          company.roadServices.map((service, index) => (
            <div
              key={service._id}
              className="bg-white dark:bg-dark2 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CarRepair className="text-blue-600 dark:text-blue-400" />
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {service.service_name || `${t('roadService.service', 'Service')} #${index + 1}`}
                  </h4>
                </div>
                <Chip
                  label={service.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  size="small"
                  color={service.is_active ? 'success' : 'default'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('roadService.labels.normalPrice', 'Normal Price')}:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ₪{service.normal_price?.toLocaleString() || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('roadService.labels.oldCarPrice', 'Old Car Price')}:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ₪{service.old_car_price?.toLocaleString() || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('roadService.labels.cutoffYear', 'Cutoff Year')}:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {service.cutoff_year || t('common.notAvailable', 'N/A')}
                  </span>
                </div>
              </div>

              {service.description && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('companies.description', 'Description')}:
                  </span>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {service.description}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('companies.noRoadServices', 'No road services')}
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{company?.name || t('companies.viewCompany', 'Company Details')}</h2>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
              {t('companies.viewSubtitle', 'View and manage company information')}
            </p>
          </div>
          <IconButton onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      {loading ? (
        <DialogContent className="dark:bg-navbarBack">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </DialogContent>
      ) : company ? (
        <>
          <div className="border-b dark:border-gray-700">
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={t('companies.tabs.overview', 'Overview')} />
              <Tab label={t('companies.tabs.insuranceTypes', 'Insurance Types')} />
              <Tab label={t('companies.tabs.pricingDetails', 'Pricing Details')} />
              <Tab label={t('companies.tabs.roadServices', 'Road Services')} />
            </Tabs>
          </div>

          <DialogContent className="dark:bg-navbarBack dark:text-white">
            {activeTab === 0 && renderOverviewTab()}
            {activeTab === 1 && renderInsuranceTypesTab()}
            {activeTab === 2 && renderPricingDetailsTab()}
            {activeTab === 3 && renderRoadServicesTab()}
          </DialogContent>

          <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4 gap-2">
            <Button
              onClick={handleDeleteClick}
              startIcon={<Delete />}
              color="error"
              variant="outlined"
            >
              {t('common.delete', 'Delete')}
            </Button>

            <div className="flex-1" />

            {onManageRoadServices && (
              <Button
                onClick={handleManageRoadServicesClick}
                startIcon={<CarRepair />}
                variant="outlined"
              >
                {t('companies.manageRoadServices', 'Road Services')}
              </Button>
            )}

            {onConfigurePricing && (
              <Button
                onClick={handleConfigurePricingClick}
                startIcon={<AttachMoney />}
                variant="outlined"
              >
                {t('companies.configurePricing', 'Configure Pricing')}
              </Button>
            )}

            {onEdit && (
              <Button
                onClick={handleEditClick}
                startIcon={<Edit />}
                variant="contained"
                sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
              >
                {t('common.edit', 'Edit')}
              </Button>
            )}
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
};

export default EnhancedViewCompanyModal;
