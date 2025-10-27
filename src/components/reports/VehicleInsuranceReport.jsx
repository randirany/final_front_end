import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';
import { getAllAgents } from '../../services/insuranceApi';
import { getAllCompanies } from '../../services/insuranceCompanyApi';
import { insuranceTypeApi } from '../../services/insuranceTypeApi';

const API_BASE_URL = 'http://localhost:3002/api/v1';

const VehicleInsuranceReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalInsurances: 0,
    activeInsurances: 0,
    expiredInsurances: 0,
    totalInsuranceAmount: 0,
    totalPaidAmount: 0,
    totalRemainingDebt: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    agent: '',
    insuranceCompany: '',
    status: 'all',
    insuranceType: '',
    page: 1,
    limit: 10
  });


  const [agents, setAgents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [insuranceTypes, setInsuranceTypes] = useState([]);

  const columns = [
    {
      header: t('reports.vehicleInsurance.customerName'),
      accessor: 'insuredName'
    },
    {
      header: t('reports.vehicleInsurance.customerPhone'),
      accessor: 'insuredPhone'
    },
    {
      header: t('reports.vehicleInsurance.plateNumber'),
      accessor: 'plateNumber'
    },
    {
      header: t('reports.vehicleInsurance.vehicleModel'),
      accessor: 'vehicleModel'
    },
    {
      header: t('reports.vehicleInsurance.insuranceCompany'),
      accessor: 'insuranceCompany'
    },
    {
      header: t('reports.vehicleInsurance.startDate'),
      accessor: 'insuranceStartDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.vehicleInsurance.endDate'),
      accessor: 'insuranceEndDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.vehicleInsurance.insuranceAmount'),
      accessor: 'insuranceAmount',
      render: (value) => `${value?.toLocaleString() || 0} ${t('common.currency')}`
    },
    {
      header: t('reports.vehicleInsurance.paidAmount'),
      accessor: 'paidAmount',
      render: (value) => `${value?.toLocaleString() || 0} ${t('common.currency')}`
    },
    {
      header: t('reports.vehicleInsurance.remainingDebt'),
      accessor: 'remainingDebt',
      render: (value) => `${value?.toLocaleString() || 0} ${t('common.currency')}`
    },
    {
      header: t('reports.vehicleInsurance.agent'),
      accessor: 'agent'
    },
    {
      header: t('reports.vehicleInsurance.insuranceType'),
      accessor: 'insuranceType',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'comprehensive'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
        }`}>
          {value || '-'}
        </span>
      )
    },
    {
      header: t('reports.vehicleInsurance.status'),
      accessor: 'insuranceStatus',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'expired'
            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
        }`}>
          {value || '-'}
        </span>
      )
    }
  ];

  useEffect(() => {
    fetchData();
  }, [filters.page]);

  useEffect(() => {
    fetchAgentsAndCompanies();
  }, []);

  const fetchAgentsAndCompanies = async () => {
    try {
      // Fetch agents using the correct API function
      const agentsResponse = await getAllAgents();
      // Response structure: { message: "Agents ", getAll: [...] }
      setAgents(agentsResponse.getAll || []);

      // Fetch insurance companies using the correct API function
      const companiesResponse = await getAllCompanies({ page: 1, limit: 1000 });
      // Response structure: Direct array or nested object - handle both
      const companiesArray = Array.isArray(companiesResponse)
        ? companiesResponse
        : (companiesResponse.companies || []);
      setCompanies(companiesArray);

      // Fetch insurance types using the correct API function
      const insuranceTypesResponse = await insuranceTypeApi.getAll();
      // Response structure: Direct array or nested object - handle both
      const insuranceTypesArray = Array.isArray(insuranceTypesResponse)
        ? insuranceTypesResponse
        : (insuranceTypesResponse.insuranceTypes || insuranceTypesResponse.data || []);
      setInsuranceTypes(insuranceTypesArray);
    } catch (error) {
      console.error('Error fetching agents and companies:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem("token");
      if (!rawToken) {
        setLoading(false);
        return;
      }
      const token = `islam__${rawToken}`;

      // Build query parameters
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.agent) params.agent = filters.agent;
      if (filters.insuranceCompany) params.insuranceCompany = filters.insuranceCompany;
      if (filters.insuranceType) params.insuranceType = filters.insuranceType;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await axios.get(`${API_BASE_URL}/insured/insurances/all`, {
        headers: { token },
        params
      });

      const { insurances, summary: apiSummary, pagination: apiPagination } = response.data;

      setData(insurances || []);
      setSummary(apiSummary || {
        totalInsurances: 0,
        activeInsurances: 0,
        expiredInsurances: 0,
        totalInsuranceAmount: 0,
        totalPaidAmount: 0,
        totalRemainingDebt: 0
      });
      setPagination(apiPagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } catch (error) {
      console.error('Error fetching vehicle insurance data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      agent: '',
      insuranceCompany: '',
      status: 'all',
      insuranceType: '',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.vehicleInsurance.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.vehicleInsurance.description')}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            title={t('reports.vehicleInsurance.totalPolicies')}
            value={summary.totalInsurances}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.activePolicies')}
            value={summary.activeInsurances}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.expiredPolicies')}
            value={summary.expiredInsurances}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.totalInsuranceAmount')}
            value={summary.totalInsuranceAmount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.totalPaidAmount')}
            value={summary.totalPaidAmount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.totalRemainingDebt')}
            value={summary.totalRemainingDebt?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              type="date"
              label={t('reports.vehicleInsurance.periodFrom')}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.vehicleInsurance.periodTo')}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.vehicleInsurance.agent')}
              value={filters.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...agents.map(agent => ({ value: agent.name, label: agent.name }))
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.vehicleInsurance.company')}
              value={filters.insuranceCompany}
              onChange={(e) => handleFilterChange('insuranceCompany', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...companies.map(company => ({ value: company.name, label: company.name }))
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.vehicleInsurance.insuranceType')}
              value={filters.insuranceType}
              onChange={(e) => handleFilterChange('insuranceType', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...insuranceTypes.map(type => ({ value: type.name, label: type.name }))
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.vehicleInsurance.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'active', label: t('common.active') },
                { value: 'expired', label: t('common.expired') }
              ]}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('common.search')}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('common.clear')}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={data}
          columns={columns}
          title={t('reports.vehicleInsurance.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {t('common.showingResults', {
                  from: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                  to: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
                  total: pagination.totalItems
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.previous')}
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                            pageNumber === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === pagination.currentPage - 2 ||
                      pageNumber === pagination.currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleInsuranceReport;