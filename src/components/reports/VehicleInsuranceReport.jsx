import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const VehicleInsuranceReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    agent: '',
    company: '',
    status: '',
    insuranceType: ''
  });


  // Mock data - replace with actual API call
  const mockData = [
    {
      id: 1,
      customerName: 'أحمد محمد علي',
      plateNumber: 'ع ق م 123',
      vehicleModel: 'تويوتا كورولا 2020',
      insuranceCompany: 'الأهلية',
      policyNumber: 'AHL-2023-001',
      startDate: '2023-01-15',
      endDate: '2024-01-15',
      premium: 1200,
      agent: 'سالم أحمد',
      status: 'active',
      insuranceType: 'comprehensive'
    },
    {
      id: 2,
      customerName: 'فاطمة حسن',
      plateNumber: 'ص ل م 456',
      vehicleModel: 'نيسان صني 2019',
      insuranceCompany: 'المشرق',
      policyNumber: 'MSH-2023-002',
      startDate: '2023-03-22',
      endDate: '2024-03-22',
      premium: 950,
      agent: 'محمد علي',
      status: 'active',
      insuranceType: 'third_party'
    },
    {
      id: 3,
      customerName: 'خالد سعد',
      plateNumber: 'ح ك ل 789',
      vehicleModel: 'هونداي إلنترا 2021',
      insuranceCompany: 'تكافل',
      policyNumber: 'TKF-2023-003',
      startDate: '2023-06-10',
      endDate: '2024-06-10',
      premium: 1350,
      agent: 'سالم أحمد',
      status: 'expired',
      insuranceType: 'comprehensive'
    }
  ];

  const agents = [
    { id: 1, name: 'سالم أحمد' },
    { id: 2, name: 'محمد علي' },
    { id: 3, name: 'علي حسن' }
  ];

  const companies = [
    { id: 1, name: 'الأهلية' },
    { id: 2, name: 'المشرق' },
    { id: 3, name: 'تكافل' },
    { id: 4, name: 'فلسطين' },
    { id: 5, name: 'الثقة' }
  ];

  const columns = [
    {
      header: t('reports.vehicleInsurance.customerName'),
      accessor: 'customerName'
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
      header: t('reports.vehicleInsurance.policyNumber'),
      accessor: 'policyNumber'
    },
    {
      header: t('reports.vehicleInsurance.startDate'),
      accessor: 'startDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.vehicleInsurance.endDate'),
      accessor: 'endDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.vehicleInsurance.premium'),
      accessor: 'premium',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
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
          {t(`reports.vehicleInsurance.type.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.vehicleInsurance.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'expired'
            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
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

      if (filters.agent) {
        filteredData = filteredData.filter(item =>
          item.agent === filters.agent
        );
      }

      if (filters.company) {
        filteredData = filteredData.filter(item =>
          item.insuranceCompany === filters.company
        );
      }

      if (filters.status) {
        filteredData = filteredData.filter(item =>
          item.status === filters.status
        );
      }

      if (filters.insuranceType) {
        filteredData = filteredData.filter(item =>
          item.insuranceType === filters.insuranceType
        );
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching vehicle insurance data:', error);
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
      agent: '',
      company: '',
      status: '',
      insuranceType: ''
    });
  };

  // Calculate statistics
  const totalPremium = data.reduce((sum, item) => sum + item.premium, 0);
  const activeCount = data.filter(item => item.status === 'active').length;
  const expiredCount = data.filter(item => item.status === 'expired').length;

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={t('reports.vehicleInsurance.totalPolicies')}
            value={data.length}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.activePolicies')}
            value={activeCount}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.expiredPolicies')}
            value={expiredCount}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.vehicleInsurance.totalPremium')}
            value={totalPremium.toLocaleString()}
            suffix={t('common.currency')}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.vehicleInsurance.periodTo')}
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
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
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
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
                { value: 'comprehensive', label: t('reports.vehicleInsurance.type.comprehensive') },
                { value: 'third_party', label: t('reports.vehicleInsurance.type.third_party') }
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.vehicleInsurance.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'active', label: t('common.active') },
                { value: 'expired', label: t('common.expired') },
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
          title={t('reports.vehicleInsurance.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default VehicleInsuranceReport;