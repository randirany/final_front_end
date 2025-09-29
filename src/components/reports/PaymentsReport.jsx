import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const PaymentsReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    paymentType: '',
    company: ''
  });


  const mockData = [
    {
      id: 1,
      paymentDate: '2023-01-25',
      insuranceCompany: 'الأهلية',
      paymentType: 'commission',
      amount: 2500,
      description: 'عمولة تأمين مركبات - يناير',
      referenceNumber: 'PAY-AHL-001',
      status: 'paid'
    },
    {
      id: 2,
      paymentDate: '2023-02-15',
      insuranceCompany: 'المشرق',
      paymentType: 'claim_settlement',
      amount: 15000,
      description: 'تسوية مطالبة حادث',
      referenceNumber: 'CLAIM-MSH-002',
      status: 'paid'
    },
    {
      id: 3,
      paymentDate: '2023-03-10',
      insuranceCompany: 'تكافل',
      paymentType: 'premium',
      amount: 8500,
      description: 'قسط تأمين - مارس',
      referenceNumber: 'PREM-TKF-003',
      status: 'pending'
    },
    {
      id: 4,
      paymentDate: '2023-04-20',
      insuranceCompany: 'فلسطين',
      paymentType: 'commission',
      amount: 1800,
      description: 'عمولة تأمين حياة',
      referenceNumber: 'PAY-PAL-004',
      status: 'paid'
    }
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
      header: t('reports.payments.paymentDate'),
      accessor: 'paymentDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.payments.insuranceCompany'),
      accessor: 'insuranceCompany'
    },
    {
      header: t('reports.payments.paymentType'),
      accessor: 'paymentType',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'commission'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'claim_settlement'
            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
        }`}>
          {t(`reports.payments.paymentTypes.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.payments.amount'),
      accessor: 'amount',
      render: (value) => `${value.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.payments.referenceNumber'),
      accessor: 'referenceNumber'
    },
    {
      header: t('reports.payments.description'),
      accessor: 'description'
    },
    {
      header: t('reports.payments.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'paid'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
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
      if (filters.paymentType) {
        filteredData = filteredData.filter(item => item.paymentType === filters.paymentType);
      }
      if (filters.company) {
        filteredData = filteredData.filter(item => item.insuranceCompany === filters.company);
      }

      setData(filteredData);
    } catch (error) {
      console.error('Error fetching payments data:', error);
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
      paymentType: '',
      company: ''
    });
  };

  const totalPayments = data.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = data.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = data.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.payments.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.payments.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={t('reports.payments.totalPayments')}
            value={totalPayments.toLocaleString()}
            suffix={t('common.currency')}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.payments.paidAmount')}
            value={paidAmount.toLocaleString()}
            suffix={t('common.currency')}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.payments.pendingAmount')}
            value={pendingAmount.toLocaleString()}
            suffix={t('common.currency')}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.payments.totalTransactions')}
            value={data.length}
            color="purple"
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
              label={t('reports.payments.periodFrom')}
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.payments.periodTo')}
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.payments.paymentType')}
              value={filters.paymentType}
              onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'commission', label: t('reports.payments.paymentTypes.commission') },
                { value: 'claim_settlement', label: t('reports.payments.paymentTypes.claim_settlement') },
                { value: 'premium', label: t('reports.payments.paymentTypes.premium') }
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.payments.company')}
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...companies.map(company => ({ value: company.name, label: company.name }))
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
          title={t('reports.payments.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default PaymentsReport;