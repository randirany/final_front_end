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
  CarRepair
} from '@mui/icons-material';
import { Tabs, Tab, Box, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import DataTable from '../components/shared/DataTable';
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

  const handleView = (companyId) => {
    setSelectedCompanyId(companyId);
    setViewModalOpen(true);
  };

  const handleEdit = (companyId) => {
    setSelectedCompanyId(companyId);
    setEditModalOpen(true);
  };

  const handleConfigurePricing = (company) => {
    setSelectedCompany(company);
    setPricingModalOpen(true);
  };

  const handleManageRoadServices = (company) => {
    setSelectedCompany(company);
    setRoadServicesModalOpen(true);
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

  // Calculate statistics
  const calculateStats = () => {
    const totalCompanies = companies.length;
    const fullyConfigured = Object.values(pricingStatus).filter(s => s.percentage === 100).length;
    const partiallyConfigured = Object.values(pricingStatus).filter(s => s.percentage > 0 && s.percentage < 100).length;
    const notConfigured = Object.values(pricingStatus).filter(s => s.percentage === 0).length;

    return { totalCompanies, fullyConfigured, partiallyConfigured, notConfigured };
  };

  const stats = calculateStats();

  // DataTable columns definition
  const columns = [
    {
      header: t('companies.columns.name', 'Company Name'),
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Business className="text-white" sx={{ fontSize: 20 }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{value}</p>
            {row.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.description}</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('companies.columns.insuranceTypes', 'Insurance Types'),
      accessor: 'insuranceTypes',
      render: (value) => (
        <div className="flex flex-wrap gap-1.5">
          {value && value.length > 0 ? (
            <>
              {value.slice(0, 2).map((type) => (
                <span
                  key={type._id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50"
                >
                  {type.name}
                </span>
              ))}
              {value.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  +{value.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
              {t('common.none', 'None')}
            </span>
          )}
        </div>
      ),
      sortable: false
    },
    {
      header: t('companies.pricingStatus', 'Pricing Config'),
      accessor: '_id',
      render: (value) => {
        const status = pricingStatus[value] || { configured: 0, total: 5, percentage: 0 };
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {status.percentage === 100 ? (
                <CheckCircle sx={{ fontSize: 16 }} className="text-green-500" />
              ) : (
                <Warning sx={{ fontSize: 16 }} className="text-yellow-500" />
              )}
              <span className={`text-sm font-semibold ${getStatusColor(status.percentage)}`}>
                {status.configured}/{status.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status.percentage === 100 ? 'bg-green-500' :
                  status.percentage >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>
        );
      },
      sortable: false
    },
    {
      header: t('companies.columns.roadServices', 'Road Services'),
      accessor: 'roadServices',
      render: (value) => (
        <div className="flex items-center gap-2">
          <CarRepair sx={{ fontSize: 16 }} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {value?.length || 0}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value?.length > 0 ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
          </span>
        </div>
      )
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: '_id',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <IconButton
            size="small"
            onClick={() => handleView(value)}
            className="text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t('common.view', 'View')}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(value)}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t('common.edit', 'Edit')}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(value, row.name)}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            title={t('common.delete', 'Delete')}
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
      sortable: false
    }
  ];

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('companies.title', 'Insurance Companies')}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('companies.subtitle', 'Manage insurance companies and their configurations')}
              </p>
            </div>
            {activeTab === 0 && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-dark2 shadow-sm hover:shadow-md"
              >
                <Add sx={{ fontSize: 20 }} />
                {t('companies.addNew', 'Add Company')}
              </button>
            )}
          </div>

</div> 
               
 
      {/* Tabs */}
      <Box className="mb-6 bg-white dark:bg-navbarBack rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: '48px',
            borderBottom: '1px solid',
            borderColor: 'rgb(229 231 235)',
            '.dark &': {
              borderColor: 'rgb(55 65 81)',
            },
            '& .MuiTab-root': {
              color: 'rgb(107 114 128)',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              minHeight: '48px',
              padding: '12px 20px',
              transition: 'all 0.2s',
              '&:hover': {
                color: 'rgb(59 130 246)',
                backgroundColor: 'rgb(239 246 255)',
              },
              '.dark &': {
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }
              },
              '&.Mui-selected': {
                color: 'rgb(37 99 235)',
                fontWeight: 600,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'rgb(37 99 235)',
              height: '3px',
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab
            label={
              <span className="flex items-center gap-2">
                <Business sx={{ fontSize: 18 }} />
                <span>{t('companies.tabs.companies', 'Companies')}</span>
                <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                  {companies.length}
                </span>
              </span>
            }
          />
          <Tab
            label={
              <span className="flex items-center gap-2">
                <Settings sx={{ fontSize: 18 }} />
                {t('companies.tabs.insuranceTypes', 'Insurance Types')}
              </span>
            }
          />
          <Tab
            label={
              <span className="flex items-center gap-2">
                <CheckCircle sx={{ fontSize: 18 }} />
                {t('companies.tabs.systemSetup', 'System Setup')}
              </span>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {/* Tab 1: Companies */}
        {activeTab === 0 && (
          <DataTable
            data={companies}
            columns={columns}
            loading={loading}
            onRefresh={fetchCompanies}
            enableSearch={true}
            enableExport={true}
          />
        )}

        {/* Tab 2: Insurance Types */}
        {activeTab === 1 && <EnhancedInsuranceTypesTab />}

        {/* Tab 3: System Setup */}
        {activeTab === 2 && <SystemSetupTab />}
      </Box>

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
    </div>
  );
};

export default InsuranceCompanies;
