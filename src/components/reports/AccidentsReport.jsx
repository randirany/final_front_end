import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const AccidentsReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    severity: '',
    status: ''
  });


  // Mock data - replace with actual API call
  const mockData = [
    {
      id: 1,
      reportNumber: 'ACC-2023-001',
      customerName: 'أحمد محمد علي',
      plateNumber: 'ع ق م 123',
      accidentDate: '2023-02-15',
      location: 'شارع الملك فهد، الرياض',
      severity: 'minor',
      damageAmount: 3500,
      insuranceCompany: 'الأهلية',
      status: 'completed',
      reportDate: '2023-02-16'
    },
    {
      id: 2,
      reportNumber: 'ACC-2023-002',
      customerName: 'فاطمة حسن',
      plateNumber: 'ص ل م 456',
      accidentDate: '2023-04-10',
      location: 'طريق الخرج، الرياض',
      severity: 'major',
      damageAmount: 15000,
      insuranceCompany: 'المشرق',
      status: 'in_progress',
      reportDate: '2023-04-10'
    },
    {
      id: 3,
      reportNumber: 'ACC-2023-003',
      customerName: 'خالد سعد',
      plateNumber: 'ح ك ل 789',
      accidentDate: '2023-07-22',
      location: 'شارع العليا، الرياض',
      severity: 'moderate',
      damageAmount: 8500,
      insuranceCompany: 'تكافل',
      status: 'pending',
      reportDate: '2023-07-23'
    }
  ];

  const columns = [
    {
      header: t('reports.accidents.reportNumber'),
      accessor: 'reportNumber'
    },
    {
      header: t('reports.accidents.customerName'),
      accessor: 'customerName'
    },
    {
      header: t('reports.accidents.plateNumber'),
      accessor: 'plateNumber'
    },
    {
      header: t('reports.accidents.accidentDate'),
      accessor: 'accidentDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.accidents.location'),
      accessor: 'location'
    },
    {
      header: t('reports.accidents.severity'),
      accessor: 'severity',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'minor'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'moderate'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {t(`reports.accidents.severityTypes.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.accidents.damageAmount'),
      accessor: 'damageAmount',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.accidents.insuranceCompany'),
      accessor: 'insuranceCompany'
    },
    {
      header: t('reports.accidents.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'in_progress'
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      let filteredData = mockData;

      if (filters.periodFrom) {
        filteredData = filteredData.filter(item =>
          new Date(item.accidentDate) >= new Date(filters.periodFrom)
        );
      }
      if (filters.periodTo) {
        filteredData = filteredData.filter(item =>
          new Date(item.accidentDate) <= new Date(filters.periodTo)
        );
      }
      if (filters.severity) {
        filteredData = filteredData.filter(item => item.severity === filters.severity);
      }
      if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching accidents data:', error);
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
      severity: '',
      status: ''
    });
  };

  const totalDamage = data.reduce((sum, item) => sum + item.damageAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.accidents.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.accidents.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title={t('reports.accidents.totalAccidents')}
            value={data.length}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.accidents.totalDamage')}
            value={totalDamage.toLocaleString()}
            suffix={t('common.currency')}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.accidents.averageDamage')}
            value={data.length ? Math.round(totalDamage / data.length).toLocaleString() : '0'}
            suffix={t('common.currency')}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
              label={t('reports.accidents.periodFrom')}
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.accidents.periodTo')}
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.accidents.severity')}
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'minor', label: t('reports.accidents.severityTypes.minor') },
                { value: 'moderate', label: t('reports.accidents.severityTypes.moderate') },
                { value: 'major', label: t('reports.accidents.severityTypes.major') }
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.accidents.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'pending', label: t('common.pending') },
                { value: 'in_progress', label: t('common.in_progress') },
                { value: 'completed', label: t('common.completed') }
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
          title={t('reports.accidents.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default AccidentsReport;