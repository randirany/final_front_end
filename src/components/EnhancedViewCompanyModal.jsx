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

const EnhancedViewCompanyModal = ({ open, onClose, companyId, onEdit, onDelete, onConfigurePricing, onManageRoadServices }) => {
  const { t, i18n: { language } } = useTranslation();

  const [company, setCompany] = useState(null);
  const [pricingConfigs, setPricingConfigs] = useState([]);
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
    if (!company || !company.insuranceTypes) return { configured: 0, total: 0, percentage: 0 };

    // Get unique pricing types from insurance types
    const uniquePricingTypes = new Set();
    company.insuranceTypes.forEach(insuranceType => {
      const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
        ? insuranceType.pricing_type_id
        : insuranceType.pricing_type_id?._id;
      if (pricingTypeId && pricingTypeId !== 'compulsory' && pricingTypeId !== 'road_service') {
        uniquePricingTypes.add(pricingTypeId);
      }
    });

    const total = uniquePricingTypes.size;
    const configured = pricingConfigs.length;
    const percentage = total > 0 ? (configured / total) * 100 : 0;

    return { configured, total, percentage };
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
    return (
      <div className="space-y-4 mt-4">
        {company.insuranceTypes && company.insuranceTypes.length > 0 ? (
          company.insuranceTypes.map((insuranceType) => {
            const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
              ? insuranceType.pricing_type_id
              : insuranceType.pricing_type_id?._id;
            const pricingTypeName = typeof insuranceType.pricing_type_id === 'object'
              ? insuranceType.pricing_type_id?.name
              : pricingTypeId;
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
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {insuranceType.name}
                      </h4>
                      {isConfigured ? (
                        <CheckCircle className="text-green-600 dark:text-green-400" fontSize="small" />
                      ) : pricingTypeId !== 'compulsory' && pricingTypeId !== 'road_service' ? (
                        <Warning className="text-yellow-600 dark:text-yellow-400" fontSize="small" />
                      ) : null}
                    </div>

                    {insuranceType.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {insuranceType.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Chip
                        label={pricingTypeName || pricingTypeId}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {isConfigured && (
                        <Chip
                          label={t('companies.configured', 'Configured')}
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                        />
                      )}
                      {!isConfigured && pricingTypeId !== 'compulsory' && pricingTypeId !== 'road_service' && (
                        <Chip
                          label={t('companies.notConfigured', 'Not Configured')}
                          size="small"
                          color="warning"
                          icon={<Warning />}
                        />
                      )}
                    </div>

                    {isConfigured && config.rules && (
                      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                        {config.rules.fixedAmount && (
                          <span>{t('companyPricing.fixedAmount', 'Fixed Amount')}: ₪{config.rules.fixedAmount}</span>
                        )}
                        {config.rules.matrix && (
                          <span>{config.rules.matrix.length} {t('companyPricing.pricingRules', 'pricing rule(s)')}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('companies.noInsuranceTypes', 'No insurance types')}
          </p>
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
                    {t('roadService.service', 'Service')} #{index + 1}
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
              <Tab label={t('companies.tabs.roadServices', 'Road Services')} />
            </Tabs>
          </div>

          <DialogContent className="dark:bg-navbarBack dark:text-white">
            {activeTab === 0 && renderOverviewTab()}
            {activeTab === 1 && renderInsuranceTypesTab()}
            {activeTab === 2 && renderRoadServicesTab()}
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
