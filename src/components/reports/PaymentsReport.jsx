import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';
import { API_BASE_URL } from '../../config/api';

const PaymentsReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPayments: 0,
    totalAmount: 0,
    byPaymentMethod: {
      cash: 0,
      card: 0,
      cheque: 0,
      bank_transfer: 0
    },
    paymentMethodCounts: {
      cash: 0,
      card: 0,
      cheque: 0,
      bank_transfer: 0
    }
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    paymentMethod: '',
    customerId: '',
    sortBy: 'paymentDate',
    sortOrder: 'desc'
  });



  const columns = [
    {
      header: t('reports.payments.paymentDate'),
      accessor: 'paymentDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.payments.customerName'),
      accessor: 'customer',
      render: (customer) => customer?.name || '-'
    },
    {
      header: t('reports.payments.vehiclePlate'),
      accessor: 'vehicle',
      render: (vehicle) => vehicle?.plateNumber || '-'
    },
    {
      header: t('reports.payments.insuranceCompany'),
      accessor: 'insurance',
      render: (insurance) => insurance?.insuranceCompany || '-'
    },
    {
      header: t('reports.payments.insuranceType'),
      accessor: 'insurance',
      render: (insurance) => insurance?.insuranceType || '-'
    },
    {
      header: t('reports.payments.paymentMethod'),
      accessor: 'paymentMethod',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'cash'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'card'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            : value === 'cheque'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
        }`}>
          {t(`reports.payments.paymentMethods.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.payments.amount'),
      accessor: 'amount',
      render: (value) => `${value?.toLocaleString()} ${t('common.currency')}`
    },
    {
      header: t('reports.payments.receiptNumber'),
      accessor: 'receiptNumber',
      render: (value) => value || '-'
    },
    {
      header: t('reports.payments.recordedBy'),
      accessor: 'recordedBy',
      render: (value) => value || '-'
    }
  ];

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = `islam__${localStorage.getItem('token')}`;
      if (!token || token === 'islam__null') {
        console.error('No authentication token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();

      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.periodFrom) params.append('startDate', filters.periodFrom);
      if (filters.periodTo) params.append('endDate', filters.periodTo);

      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(
        `${API_BASE_URL}/insured/payments/all?${params.toString()}`,
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        setData(response.data.data || []);
        setSummary(response.data.summary || {
          totalPayments: 0,
          totalAmount: 0,
          byPaymentMethod: { cash: 0, card: 0, cheque: 0, bank_transfer: 0 },
          paymentMethodCounts: { cash: 0, card: 0, cheque: 0, bank_transfer: 0 }
        });
        setPagination(response.data.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Error fetching payments data:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized - please check your authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  };

  const clearFilters = () => {
    setFilters({
      periodFrom: '',
      periodTo: '',
      paymentMethod: '',
      customerId: '',
      sortBy: 'paymentDate',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExportToCSV = async () => {
    try {
      const token = `islam__${localStorage.getItem('token')}`;
      const params = new URLSearchParams();

      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.periodFrom) params.append('startDate', filters.periodFrom);
      if (filters.periodTo) params.append('endDate', filters.periodTo);

      params.append('limit', '10000'); // Get all records for export

      const response = await axios.get(
        `${API_BASE_URL}/insured/payments/all?${params.toString()}`,
        {
          headers: { token }
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        const csv = [
          // Headers
          [
            t('reports.payments.paymentDate'),
            t('reports.payments.customerName'),
            t('reports.payments.vehiclePlate'),
            t('reports.payments.insuranceCompany'),
            t('reports.payments.insuranceType'),
            t('reports.payments.paymentMethod'),
            t('reports.payments.amount'),
            t('reports.payments.receiptNumber'),
            t('reports.payments.recordedBy')
          ],
          // Data
          ...response.data.data.map(p => [
            toLocaleDateStringEN(p.paymentDate),
            p.customer?.name || '-',
            p.vehicle?.plateNumber || '-',
            p.insurance?.insuranceCompany || '-',
            p.insurance?.insuranceType || '-',
            t(`reports.payments.paymentMethods.${p.paymentMethod}`),
            p.amount,
            p.receiptNumber || '',
            p.recordedBy || ''
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

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
            title={t('reports.payments.totalAmount')}
            value={summary.totalAmount.toLocaleString()}
            suffix={t('common.currency')}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.payments.cashPayments')}
            value={summary.byPaymentMethod.cash.toLocaleString()}
            suffix={t('common.currency')}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.payments.cardPayments')}
            value={summary.byPaymentMethod.card.toLocaleString()}
            suffix={t('common.currency')}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.payments.totalTransactions')}
            value={summary.totalPayments.toLocaleString()}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>

        {/* Additional Summary by Payment Method */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('reports.payments.paymentMethodBreakdown')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                {t('reports.payments.paymentMethods.cash')}
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {summary.byPaymentMethod.cash.toLocaleString()} {t('common.currency')}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {summary.paymentMethodCounts.cash} {t('reports.payments.transactions')}
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                {t('reports.payments.paymentMethods.card')}
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {summary.byPaymentMethod.card.toLocaleString()} {t('common.currency')}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {summary.paymentMethodCounts.card} {t('reports.payments.transactions')}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                {t('reports.payments.paymentMethods.cheque')}
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {summary.byPaymentMethod.cheque.toLocaleString()} {t('common.currency')}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {summary.paymentMethodCounts.cheque} {t('reports.payments.transactions')}
              </div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                {t('reports.payments.paymentMethods.bank_transfer')}
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {summary.byPaymentMethod.bank_transfer.toLocaleString()} {t('common.currency')}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {summary.paymentMethodCounts.bank_transfer} {t('reports.payments.transactions')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              label={t('reports.payments.paymentMethod')}
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'cash', label: t('reports.payments.paymentMethods.cash') },
                { value: 'card', label: t('reports.payments.paymentMethods.card') },
                { value: 'cheque', label: t('reports.payments.paymentMethods.cheque') },
                { value: 'bank_transfer', label: t('reports.payments.paymentMethods.bank_transfer') }
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
            <button
              onClick={handleExportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('common.exportCSV')}
            </button>
          </div>
        </div>

        {/* Pagination Controls */}
        {pagination.total > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {t('reports.payments.showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('reports.payments.of')} {pagination.total} {t('reports.payments.results')}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    pagination.hasPrevPage
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('common.previous')}
                </button>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    pagination.hasNextPage
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {t('common.next')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

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