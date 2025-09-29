import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const CustomerReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    joiningDateFrom: '',
    joiningDateTo: '',
    agent: '',
    status: ''
  });


  // Mock data - replace with actual API call
  const mockData = [
    {
      id: 1,
      name: 'أحمد محمد علي',
      idNumber: '123456789',
      phone: '0599123456',
      email: 'ahmed@example.com',
      joiningDate: '2023-01-15',
      agent: 'سالم أحمد',
      vehicleCount: 2,
      totalInsurances: 3,
      status: 'active'
    },
    {
      id: 2,
      name: 'فاطمة حسن',
      idNumber: '987654321',
      phone: '0597654321',
      email: 'fatima@example.com',
      joiningDate: '2023-03-22',
      agent: 'محمد علي',
      vehicleCount: 1,
      totalInsurances: 2,
      status: 'active'
    },
    {
      id: 3,
      name: 'خالد سعد',
      idNumber: '456789123',
      phone: '0598789123',
      email: 'khalid@example.com',
      joiningDate: '2023-06-10',
      agent: 'سالم أحمد',
      vehicleCount: 3,
      totalInsurances: 4,
      status: 'inactive'
    }
  ];

  const agents = [
    { id: 1, name: 'سالم أحمد' },
    { id: 2, name: 'محمد علي' },
    { id: 3, name: 'علي حسن' }
  ];

  const columns = [
    {
      header: t('reports.customer.name'),
      accessor: 'name'
    },
    {
      header: t('reports.customer.idNumber'),
      accessor: 'idNumber'
    },
    {
      header: t('reports.customer.phone'),
      accessor: 'phone'
    },
    {
      header: t('reports.customer.email'),
      accessor: 'email'
    },
    {
      header: t('reports.customer.joiningDate'),
      accessor: 'joiningDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.customer.agent'),
      accessor: 'agent'
    },
    {
      header: t('reports.customer.vehicleCount'),
      accessor: 'vehicleCount'
    },
    {
      header: t('reports.customer.totalInsurances'),
      accessor: 'totalInsurances'
    },
    {
      header: t('reports.customer.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
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
      if (filters.joiningDateFrom) {
        filteredData = filteredData.filter(item =>
          new Date(item.joiningDate) >= new Date(filters.joiningDateFrom)
        );
      }

      if (filters.joiningDateTo) {
        filteredData = filteredData.filter(item =>
          new Date(item.joiningDate) <= new Date(filters.joiningDateTo)
        );
      }

      if (filters.agent) {
        filteredData = filteredData.filter(item =>
          item.agent === filters.agent
        );
      }

      if (filters.status) {
        filteredData = filteredData.filter(item =>
          item.status === filters.status
        );
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      joiningDateFrom: '',
      joiningDateTo: '',
      agent: '',
      status: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.customer.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.customer.description')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              type="date"
              label={t('reports.customer.joiningDateFrom')}
              value={filters.joiningDateFrom}
              onChange={(e) => handleFilterChange('joiningDateFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.customer.joiningDateTo')}
              value={filters.joiningDateTo}
              onChange={(e) => handleFilterChange('joiningDateTo', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.customer.agent')}
              value={filters.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...agents.map(agent => ({ value: agent.name, label: agent.name }))
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.customer.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'active', label: t('common.active') },
                { value: 'inactive', label: t('common.inactive') }
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
          title={t('reports.customer.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default CustomerReport;