import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Business,
  Add,
  Settings,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  CarRepair,
  MoreVert
} from '@mui/icons-material';
import { Tabs, Tab, Box, IconButton, Menu, MenuItem, LinearProgress } from '@mui/material';
import Swal from 'sweetalert2';
import AddCompanyWizard from '../components/AddCompanyWizard';
import EnhancedEditCompanyModal from '../components/EnhancedEditCompanyModal';
import EnhancedViewCompanyModal from '../components/EnhancedViewCompanyModal';
import ImprovedCompanyPricingModal from '../components/ImprovedCompanyPricingModal';
import ManageRoadServicesModal from '../components/ManageRoadServicesModal';
import EnhancedInsuranceTypesTab from '../components/EnhancedInsuranceTypesTab';
import SystemSetupTab from '../components/SystemSetupTab';
import { getAllCompanies, deleteCompany } from '../services/insuranceCompanyApi';
import { getPricingByCompany } from '../services/companyPricingApi';

const InsuranceCompanies = () => {
  const { t } = useTranslation();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingStatus, setPricingStatus] = useState({});

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [roadServicesModalOpen, setRoadServicesModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Menu state for company actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCompanyId, setMenuCompanyId] = useState(null);

  useEffect(() => {
    if (activeTab === 0) {
      fetchCompanies();
    }
  }, [activeTab]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await getAllCompanies({ page: 1, limit: 1000 });
      const companiesData = Array.isArray(response) ? response : (response.data || []);
      setCompanies(companiesData);

      // Fetch pricing status for each company
      fetchPricingStatus(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: t('companies.fetchError', 'Failed to fetch insurance companies')
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingStatus = async (companiesData) => {
    const statusMap = {};

    for (const company of companiesData) {
      try {
        const response = await getPricingByCompany(company._id);
        const pricings = response.pricing || [];

        // Count configured pricing types
        const totalPricingTypes = 5; // compulsory, third_party, comprehensive, road_service, accident_fee_waiver
        const configured = pricings.length;

        statusMap[company._id] = {
          configured,
          total: totalPricingTypes,
          percentage: (configured / totalPricingTypes) * 100,
          pricings
        };
      } catch (error) {
        statusMap[company._id] = {
          configured: 0,
          total: 5,
          percentage: 0,
          pricings: []
        };
      }
    }

    setPricingStatus(statusMap);
  };

  const handleDelete = async (companyId, companyName) => {
    const result = await Swal.fire({
      title: t('common.areYouSure'),
      text: t('companies.deleteConfirm', { name: companyName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await deleteCompany(companyId);
        Swal.fire({
          icon: 'success',
          title: t('common.deleted'),
          text: t('companies.deleteSuccess'),
          timer: 2000
        });
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: error.response?.data?.message || t('companies.deleteError')
        });
      }
    }
  };

  const handleMenuOpen = (event, companyId) => {
    setAnchorEl(event.currentTarget);
    setMenuCompanyId(companyId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCompanyId(null);
  };

  const handleView = (company) => {
    setSelectedCompanyId(company._id);
    setViewModalOpen(true);
    handleMenuClose();
  };

  const handleEdit = (company) => {
    setSelectedCompanyId(company._id);
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleConfigurePricing = (company) => {
    setSelectedCompany(company);
    setPricingModalOpen(true);
    handleMenuClose();
  };

  const handleManageRoadServices = (company) => {
    setSelectedCompany(company);
    setRoadServicesModalOpen(true);
    handleMenuClose();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (percentage) => {
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = (percentage) => {
    if (percentage === 100) return <CheckCircle className="text-green-600 dark:text-green-400" fontSize="small" />;
    return <Warning className="text-yellow-600 dark:text-yellow-400" fontSize="small" />;
  };

  // Company Card Component
  const CompanyCard = ({ company }) => {
    const status = pricingStatus[company._id] || { configured: 0, total: 5, percentage: 0 };

    return (
      <div className="bg-white dark:bg-navbarBack rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Business className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h3>
                {company.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {company.description}
                  </p>
                )}
              </div>
            </div>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, company._id)}
              className="text-gray-600 dark:text-gray-400"
            >
              <MoreVert />
            </IconButton>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Insurance Types */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📋 {t('companies.labels.insuranceTypes', 'Insurance Types')}
            </p>
            <div className="flex flex-wrap gap-2">
              {company.insuranceTypes && company.insuranceTypes.length > 0 ? (
                company.insuranceTypes.map((type) => (
                  <span
                    key={type._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {type.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.none', 'None')}
                </span>
              )}
            </div>
          </div>

          {/* Pricing Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                💰 {t('companies.pricingStatus', 'Pricing Configuration')}
              </p>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.percentage)}
                <span className={`text-sm font-semibold ${getStatusColor(status.percentage)}`}>
                  {status.configured}/{status.total}
                </span>
              </div>
            </div>
            <LinearProgress
              variant="determinate"
              value={status.percentage}
              className="h-2 rounded-full"
              sx={{
                backgroundColor: 'rgba(156, 163, 175, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: status.percentage === 100 ? '#10b981' : status.percentage >= 50 ? '#f59e0b' : '#ef4444',
                  borderRadius: '9999px'
                }
              }}
            />
          </div>

          {/* Road Services */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🛣️ {t('companies.labels.roadServices', 'Road Services')}
            </p>
            <div className="flex flex-wrap gap-2">
              {company.roadServices && company.roadServices.length > 0 ? (
                company.roadServices.map((service, index) => (
                  <span
                    key={service._id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      service.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    {service.service_name || `Service ${index + 1}`}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('companies.noRoadServices', 'No road services')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer - Actions */}
        <div className="p-4 bg-gray-50 dark:bg-dark2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            onClick={() => handleView(company)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-navbarBack border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <Visibility fontSize="small" />
            <span className="text-sm font-medium">{t('common.view', 'View')}</span>
          </button>
          <button
            onClick={() => handleConfigurePricing(company)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Settings fontSize="small" />
            <span className="text-sm font-medium">{t('companyPricing.configure', 'Configure Pricing')}</span>
          </button>
          <button
            onClick={() => handleManageRoadServices(company)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <CarRepair fontSize="small" />
            <span className="text-sm font-medium">{t('roadService.manage', 'Road Services')}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Business className="text-blue-600 dark:text-blue-400" />
            {t('companies.managementTitle', 'Insurance Company Management')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('companies.managementSubtitle', 'Manage companies, insurance types, and system configuration')}
          </p>
        </div>
        {activeTab === 0 && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Add />
            {t('companies.addNew', 'Add Company')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <Box className="mb-6 bg-white dark:bg-navbarBack rounded-lg shadow-sm">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
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
                <Business fontSize="small" />
                {t('companies.tabs.companies', 'Companies')} ({companies.length})
              </div>
            }
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <Settings fontSize="small" />
                {t('companies.tabs.insuranceTypes', 'Insurance Types')}
              </div>
            }
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <CheckCircle fontSize="small" />
                {t('companies.tabs.systemSetup', 'System Setup')}
              </div>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {/* Tab 1: Companies */}
        {activeTab === 0 && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-12 text-center">
                <Business className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('companies.noCompanies', 'No Companies Yet')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('companies.addFirstCompany', 'Get started by adding your first insurance company')}
                </p>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Add />
                  {t('companies.addNew', 'Add Company')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard key={company._id} company={company} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Insurance Types */}
        {activeTab === 1 && <EnhancedInsuranceTypesTab />}

        {/* Tab 3: System Setup */}
        {activeTab === 2 && <SystemSetupTab />}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const company = companies.find(c => c._id === menuCompanyId);
          if (company) handleView(company);
        }}>
          <Visibility fontSize="small" className="mr-2" />
          {t('common.view', 'View')}
        </MenuItem>
        <MenuItem onClick={() => {
          const company = companies.find(c => c._id === menuCompanyId);
          if (company) handleEdit(company);
        }}>
          <Edit fontSize="small" className="mr-2" />
          {t('common.edit', 'Edit')}
        </MenuItem>
        <MenuItem onClick={() => {
          const company = companies.find(c => c._id === menuCompanyId);
          if (company) handleDelete(company._id, company.name);
        }}>
          <Delete fontSize="small" className="mr-2 text-red-600" />
          <span className="text-red-600">{t('common.delete', 'Delete')}</span>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <AddCompanyWizard
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCompanies}
      />

      <EnhancedEditCompanyModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCompanyId(null);
        }}
        companyId={selectedCompanyId}
        onSuccess={fetchCompanies}
      />

      <EnhancedViewCompanyModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCompanyId(null);
        }}
        companyId={selectedCompanyId}
        onEdit={(company) => {
          setViewModalOpen(false);
          handleEdit(company);
        }}
        onDelete={fetchCompanies}
        onConfigurePricing={(company) => {
          setViewModalOpen(false);
          handleConfigurePricing(company);
        }}
        onManageRoadServices={(company) => {
          setViewModalOpen(false);
          handleManageRoadServices(company);
        }}
      />

      <ImprovedCompanyPricingModal
        open={pricingModalOpen}
        onClose={() => {
          setPricingModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />

      <ManageRoadServicesModal
        open={roadServicesModalOpen}
        onClose={() => {
          setRoadServicesModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />
    </div>
  );
};

export default InsuranceCompanies;
