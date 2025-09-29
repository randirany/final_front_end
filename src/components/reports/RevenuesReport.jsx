import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const RevenuesReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    paymentMethod: '',
    agent: ''
  });


  const mockData = [
    {
      id: 1,
      customerName: 'أحمد محمد علي',
      policyNumber: 'AHL-2023-001',
      paymentDate: '2023-01-20',
      amount: 1200,
      paymentMethod: 'cash',
      agent: 'سالم أحمد',
      insuranceType: 'vehicle',
      description: 'دفعة تأمين مركبة - شهر يناير'
    },
    {
      id: 2,
      customerName: 'فاطمة حسن',
      policyNumber: 'MSH-2023-002',
      paymentDate: '2023-03-25',
      amount: 950,
      paymentMethod: 'card',
      agent: 'محمد علي',
      insuranceType: 'vehicle',
      description: 'دفعة تأمين مركبة - شهر مارس'
    },
    {
      id: 3,
      customerName: 'خالد سعد',
      policyNumber: 'LIFE-2023-003',
      paymentDate: '2023-06-15',
      amount: 2400,
      paymentMethod: 'bank_transfer',
      agent: 'سالم أحمد',
      insuranceType: 'life',
      description: 'دفعة تأمين حياة - نصف سنوي'
    }
  ];

  const agents = [
    { id: 1, name: 'سالم أحمد' },
    { id: 2, name: 'محمد علي' },
    { id: 3, name: 'علي حسن' }
  ];

  const columns = [
    {
      header: t('reports.revenues.customerName'),
      accessor: 'customerName'
    },
    {
      header: t('reports.revenues.policyNumber'),
      accessor: 'policyNumber'
    },
    {
      header: t('reports.revenues.paymentDate'),
      accessor: 'paymentDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.revenues.amount'),
      accessor: 'amount',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.revenues.paymentMethod'),
      accessor: 'paymentMethod',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'cash'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'card'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
        }`}>
          {t(`common.paymentMethods.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.revenues.agent'),
      accessor: 'agent'
    },
    {
      header: t('reports.revenues.insuranceType'),
      accessor: 'insuranceType',
      render: (value) => t(`reports.revenues.insuranceTypes.${value}`)
    },
    {
      header: t('reports.revenues.description'),
      accessor: 'description'
    }
  ];

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let filteredData = mockData;

      if (filters.periodFrom) {
        filteredData = filteredData.filter(item =>
          new Date(item.paymentDate) >= new Date(filters.periodFrom)
        );
      }
      if (filters.periodTo) {
        filteredData = filteredData.filter(item =>
          new Date(item.paymentDate) <= new Date(filters.periodTo)
        );
      }
      if (filters.paymentMethod) {
        filteredData = filteredData.filter(item => item.paymentMethod === filters.paymentMethod);
      }
      if (filters.agent) {
        filteredData = filteredData.filter(item => item.agent === filters.agent);
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching revenues data:', error);
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
      paymentMethod: '',
      agent: ''
    });
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);
  const averagePayment = data.length ? totalRevenue / data.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.revenues.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.revenues.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title={t('reports.revenues.totalRevenue')}
            value={totalRevenue.toLocaleString()}
            suffix={t('common.currency')}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.revenues.totalPayments')}
            value={data.length}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.revenues.averagePayment')}
            value={Math.round(averagePayment).toLocaleString()}
            suffix={t('common.currency')}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              type="date"
              label={t('reports.revenues.periodFrom')}
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.revenues.periodTo')}
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.revenues.paymentMethod')}
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'cash', label: t('common.paymentMethods.cash') },
                { value: 'card', label: t('common.paymentMethods.card') },
                { value: 'bank_transfer', label: t('common.paymentMethods.bank_transfer') }
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.revenues.agent')}
              value={filters.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...agents.map(agent => ({ value: agent.name, label: agent.name }))
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

        <DataTable
          data={data}
          columns={columns}
          title={t('reports.revenues.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default RevenuesReport;