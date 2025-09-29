import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const OtherInsuranceReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    insuranceType: '',
    status: ''
  });


  // Mock data - replace with actual API call
  const mockData = [
    {
      id: 1,
      customerName: 'أحمد محمد علي',
      insuranceType: 'life',
      policyNumber: 'LIFE-2023-001',
      startDate: '2023-01-15',
      endDate: '2024-01-15',
      premium: 2400,
      coverageAmount: 100000,
      beneficiary: 'فاطمة أحمد',
      status: 'active'
    },
    {
      id: 2,
      customerName: 'فاطمة حسن',
      insuranceType: 'health',
      policyNumber: 'HEALTH-2023-002',
      startDate: '2023-03-22',
      endDate: '2024-03-22',
      premium: 1800,
      coverageAmount: 50000,
      beneficiary: 'محمد حسن',
      status: 'active'
    },
    {
      id: 3,
      customerName: 'خالد سعد',
      insuranceType: 'property',
      policyNumber: 'PROP-2023-003',
      startDate: '2023-06-10',
      endDate: '2024-06-10',
      premium: 3200,
      coverageAmount: 200000,
      beneficiary: 'سعاد خالد',
      status: 'expired'
    },
    {
      id: 4,
      customerName: 'مريم علي',
      insuranceType: 'travel',
      policyNumber: 'TRAVEL-2023-004',
      startDate: '2023-08-05',
      endDate: '2023-09-05',
      premium: 450,
      coverageAmount: 25000,
      beneficiary: 'علي مريم',
      status: 'completed'
    }
  ];

  const insuranceTypes = [
    { id: 'life', name: t('reports.otherInsurance.types.life') },
    { id: 'health', name: t('reports.otherInsurance.types.health') },
    { id: 'property', name: t('reports.otherInsurance.types.property') },
    { id: 'travel', name: t('reports.otherInsurance.types.travel') },
    { id: 'business', name: t('reports.otherInsurance.types.business') }
  ];

  const columns = [
    {
      header: t('reports.otherInsurance.customerName'),
      accessor: 'customerName'
    },
    {
      header: t('reports.otherInsurance.insuranceType'),
      accessor: 'insuranceType',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'life'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
            : value === 'health'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'property'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            : value === 'travel'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
        }`}>
          {t(`reports.otherInsurance.types.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.otherInsurance.policyNumber'),
      accessor: 'policyNumber'
    },
    {
      header: t('reports.otherInsurance.startDate'),
      accessor: 'startDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.otherInsurance.endDate'),
      accessor: 'endDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.otherInsurance.premium'),
      accessor: 'premium',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.otherInsurance.coverageAmount'),
      accessor: 'coverageAmount',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.otherInsurance.beneficiary'),
      accessor: 'beneficiary'
    },
    {
      header: t('reports.otherInsurance.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'expired'
            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            : value === 'completed'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
        }`}>
          {t(`common.${value}`)}
        </span>
      )
    }
  ];

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = mockData;

      // Apply filters
      if (filters.periodFrom) {
        filteredData = filteredData.filter(item =>
          new Date(item.startDate) >= new Date(filters.periodFrom)
        );
      }

      if (filters.periodTo) {
        filteredData = filteredData.filter(item =>
          new Date(item.endDate) <= new Date(filters.periodTo)
        );
      }

      if (filters.insuranceType) {
        filteredData = filteredData.filter(item =>
          item.insuranceType === filters.insuranceType
        );
      }

      if (filters.status) {
        filteredData = filteredData.filter(item =>
          item.status === filters.status
        );
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching other insurance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      periodFrom: '',
      periodTo: '',
      insuranceType: '',
      status: ''
    });
  };

  // Calculate statistics
  const totalPremium = data.reduce((sum, item) => sum + item.premium, 0);
  const totalCoverage = data.reduce((sum, item) => sum + item.coverageAmount, 0);
  const activeCount = data.filter(item => item.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.otherInsurance.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.otherInsurance.description')}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={t('reports.otherInsurance.totalPolicies')}
            value={data.length}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.otherInsurance.activePolicies')}
            value={activeCount}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.otherInsurance.totalPremium')}
            value={totalPremium.toLocaleString()}
            suffix={t('common.currency')}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.otherInsurance.totalCoverage')}
            value={totalCoverage.toLocaleString()}
            suffix={t('common.currency')}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              type="date"
              label={t('reports.otherInsurance.periodFrom')}
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.otherInsurance.periodTo')}
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.otherInsurance.insuranceType')}
              value={filters.insuranceType}
              onChange={(e) => handleFilterChange('insuranceType', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...insuranceTypes.map(type => ({ value: type.id, label: type.name }))
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.otherInsurance.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'active', label: t('common.active') },
                { value: 'expired', label: t('common.expired') },
                { value: 'completed', label: t('common.completed') },
                { value: 'pending', label: t('common.pending') }
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
          title={t('reports.otherInsurance.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default OtherInsuranceReport;