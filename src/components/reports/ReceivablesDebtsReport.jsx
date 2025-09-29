import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const ReceivablesDebtsReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dueDateFrom: '',
    dueDateTo: ''
  });


  const mockData = [
    {
      id: 1,
      customerName: 'أحمد محمد علي',
      type: 'due_check',
      checkNumber: 'CHK-001-2023',
      amount: 1500,
      dueDate: '2023-12-15',
      status: 'overdue',
      daysPastDue: 45,
      description: 'شيك قسط تأمين - نوفمبر'
    },
    {
      id: 2,
      customerName: 'فاطمة حسن',
      type: 'unpaid_insurance',
      policyNumber: 'POL-002-2023',
      amount: 2400,
      dueDate: '2023-12-20',
      status: 'due',
      daysPastDue: 0,
      description: 'قسط تأمين مركبة - ديسمبر'
    },
    {
      id: 3,
      customerName: 'خالد سعد',
      type: 'due_check',
      checkNumber: 'CHK-003-2023',
      amount: 3200,
      dueDate: '2023-11-30',
      status: 'bounced',
      daysPastDue: 60,
      description: 'شيك مرتد - تأمين حياة'
    },
    {
      id: 4,
      customerName: 'مريم علي',
      type: 'unpaid_insurance',
      policyNumber: 'POL-004-2023',
      amount: 850,
      dueDate: '2024-01-10',
      status: 'pending',
      daysPastDue: 0,
      description: 'تجديد تأمين - يناير'
    }
  ];

  const columns = [
    {
      header: t('reports.receivablesDebts.customerName'),
      accessor: 'customerName'
    },
    {
      header: t('reports.receivablesDebts.type'),
      accessor: 'type',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'due_check'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
        }`}>
          {t(`reports.receivablesDebts.types.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.receivablesDebts.reference'),
      accessor: 'checkNumber',
      render: (value, row) => row.checkNumber || row.policyNumber || '-'
    },
    {
      header: t('reports.receivablesDebts.amount'),
      accessor: 'amount',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.receivablesDebts.dueDate'),
      accessor: 'dueDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.receivablesDebts.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'overdue'
            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            : value === 'due'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            : value === 'bounced'
            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
        }`}>
          {t(`reports.receivablesDebts.statusTypes.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.receivablesDebts.daysPastDue'),
      accessor: 'daysPastDue',
      render: (value) => (
        <span className={`font-medium ${
          value > 30
            ? 'text-red-600 dark:text-red-400'
            : value > 0
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-green-600 dark:text-green-400'
        }`}>
          {value} {t('common.days')}
        </span>
      )
    },
    {
      header: t('reports.receivablesDebts.description'),
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

      if (filters.type) {
        filteredData = filteredData.filter(item => item.type === filters.type);
      }
      if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }
      if (filters.dueDateFrom) {
        filteredData = filteredData.filter(item =>
          new Date(item.dueDate) >= new Date(filters.dueDateFrom)
        );
      }
      if (filters.dueDateTo) {
        filteredData = filteredData.filter(item =>
          new Date(item.dueDate) <= new Date(filters.dueDateTo)
        );
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching receivables and debts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      dueDateFrom: '',
      dueDateTo: ''
    });
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const overdueAmount = data.filter(item => item.status === 'overdue' || item.status === 'bounced').reduce((sum, item) => sum + item.amount, 0);
  const overdueCount = data.filter(item => item.status === 'overdue' || item.status === 'bounced').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.receivablesDebts.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.receivablesDebts.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={t('reports.receivablesDebts.totalAmount')}
            value={totalAmount.toLocaleString()}
            suffix={t('common.currency')}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.receivablesDebts.overdueAmount')}
            value={overdueAmount.toLocaleString()}
            suffix={t('common.currency')}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.receivablesDebts.totalItems')}
            value={data.length}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.receivablesDebts.overdueItems')}
            value={overdueCount}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              type="select"
              label={t('reports.receivablesDebts.type')}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'due_check', label: t('reports.receivablesDebts.types.due_check') },
                { value: 'unpaid_insurance', label: t('reports.receivablesDebts.types.unpaid_insurance') }
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.receivablesDebts.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'due', label: t('reports.receivablesDebts.statusTypes.due') },
                { value: 'overdue', label: t('reports.receivablesDebts.statusTypes.overdue') },
                { value: 'bounced', label: t('reports.receivablesDebts.statusTypes.bounced') },
                { value: 'pending', label: t('reports.receivablesDebts.statusTypes.pending') }
              ]}
            />

            <FormInput
              type="date"
              label={t('reports.receivablesDebts.dueDateFrom')}
              value={filters.dueDateFrom}
              onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.receivablesDebts.dueDateTo')}
              value={filters.dueDateTo}
              onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
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
          title={t('reports.receivablesDebts.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default ReceivablesDebtsReport;