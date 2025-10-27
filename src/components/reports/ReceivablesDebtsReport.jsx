import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';
import { getAllDueItems } from '../../services/receivablesDebtsApi';

const ReceivablesDebtsReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalDueAmount: 0,
    insurances: {
      count: 0,
      totalAmount: 0,
      overdue: 0,
      upcoming: 0
    },
    cheques: {
      count: 0,
      totalAmount: 0,
      overdue: 0,
      upcoming: 0,
      pending: 0,
      returned: 0
    },
    byStatus: {
      overdue: {
        count: 0,
        amount: 0
      },
      upcoming: {
        count: 0,
        amount: 0
      }
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
    type: 'all',
    startDate: '',
    endDate: '',
    customerId: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const columns = [
    {
      header: t('reports.receivablesDebts.type'),
      accessor: 'type',
      render: (value) => {
        if (!value) return '-';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'insurance'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
              : 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
          }`}>
            {value === 'insurance' ? '📋' : '💰'} {t(`reports.receivablesDebts.types.${value}`, value)}
          </span>
        );
      }
    },
    {
      header: t('reports.receivablesDebts.customerName'),
      accessor: 'customer',
      render: (customer) => {
        if (!customer) return '-';
        return (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{customer?.name || '-'}</div>
            {customer?.phone && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</div>
            )}
          </div>
        );
      }
    },
    {
      header: t('reports.receivablesDebts.reference'),
      accessor: (row) => row,
      render: (row) => {
        if (!row || !row.type) return '-';
        if (row.type === 'insurance') {
          return (
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {row.vehicle?.plateNumber || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {row.insurance?.insuranceType || '-'}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {row.cheque?.chequeNumber || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {row.cheque?.bankName || '-'}
              </div>
            </div>
          );
        }
      }
    },
    {
      header: t('reports.receivablesDebts.dueDate'),
      accessor: 'dueDate',
      render: (value) => value ? toLocaleDateStringEN(value) : '-'
    },
    {
      header: t('reports.receivablesDebts.daysPastDue'),
      accessor: 'daysUntilDue',
      render: (value) => {
        if (value === null || value === undefined) return '-';
        return (
          <span className={`font-medium ${
            value < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {value < 0
              ? `${Math.abs(value)} ${t('reports.receivablesDebts.daysAgo')}`
              : `${t('reports.receivablesDebts.in')} ${value} ${t('reports.receivablesDebts.days')}`
            }
          </span>
        );
      }
    },
    {
      header: t('reports.receivablesDebts.status'),
      accessor: 'status',
      render: (value) => {
        if (!value) return '-';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'overdue'
              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
          }`}>
            {t(`reports.receivablesDebts.statusTypes.${value}`, value)}
          </span>
        );
      }
    },
    {
      header: t('reports.receivablesDebts.amount'),
      accessor: 'amount',
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {value !== null && value !== undefined ? value.toLocaleString() : '0'} {t('common.currency')}
        </span>
      )
    },
    {
      header: t('reports.receivablesDebts.description'),
      accessor: 'description',
      render: (value) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {value || '-'}
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        type: filters.type,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await getAllDueItems(params);

      if (response.success) {
        setData(response.data || []);
        setSummary(response.summary || {
          totalItems: 0,
          totalDueAmount: 0,
          insurances: { count: 0, totalAmount: 0, overdue: 0, upcoming: 0 },
          cheques: { count: 0, totalAmount: 0, overdue: 0, upcoming: 0, pending: 0, returned: 0 },
          byStatus: { overdue: { count: 0, amount: 0 }, upcoming: { count: 0, amount: 0 } }
        });
        setPagination(response.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Error fetching receivables/debts data:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized - please check your authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      startDate: '',
      endDate: '',
      customerId: '',
      sortBy: 'dueDate',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExportToCSV = async () => {
    try {
      const params = {
        type: filters.type,
        limit: 10000,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await getAllDueItems(params);

      if (response.success && response.data.length > 0) {
        const csv = [
          // Headers
          [
            t('reports.receivablesDebts.type'),
            t('reports.receivablesDebts.customerName'),
            t('reports.receivablesDebts.reference'),
            t('reports.receivablesDebts.dueDate'),
            t('reports.receivablesDebts.daysPastDue'),
            t('reports.receivablesDebts.status'),
            t('reports.receivablesDebts.amount'),
            t('reports.receivablesDebts.description')
          ],
          // Data
          ...response.data.map(item => [
            t(`reports.receivablesDebts.types.${item.type}`),
            item.customer?.name || '-',
            item.type === 'insurance'
              ? `${item.vehicle?.plateNumber || '-'} (${item.insurance?.insuranceType || '-'})`
              : `${item.cheque?.chequeNumber || '-'} (${item.cheque?.bankName || '-'})`,
            toLocaleDateStringEN(item.dueDate),
            item.daysUntilDue < 0
              ? `${Math.abs(item.daysUntilDue)} ${t('reports.receivablesDebts.daysAgo')}`
              : `${t('reports.receivablesDebts.in')} ${item.daysUntilDue} ${t('reports.receivablesDebts.days')}`,
            t(`reports.receivablesDebts.statusTypes.${item.status}`),
            item.amount,
            item.description || ''
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receivables-debts-report-${new Date().toISOString().split('T')[0]}.csv`;
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
            {t('reports.receivablesDebts.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.receivablesDebts.description')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <StatCard
            title={t('reports.receivablesDebts.totalDue')}
            value={summary.totalDueAmount?.toLocaleString() || 0}
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
            value={summary.byStatus?.overdue?.amount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />

          <StatCard
            title={t('reports.receivablesDebts.upcomingAmount')}
            value={summary.byStatus?.upcoming?.amount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="indigo"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />

          <StatCard
            title={t('reports.receivablesDebts.insuranceDebts')}
            value={summary.insurances?.totalAmount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          <StatCard
            title={t('reports.receivablesDebts.pendingCheques')}
            value={summary.cheques?.totalAmount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Insurance Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📋</span> {t('reports.receivablesDebts.insuranceBreakdown')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.receivablesDebts.totalInsurances')}
                </span>
                <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {summary.insurances?.count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.receivablesDebts.overdueInsurances')}
                </span>
                <span className="text-lg font-bold text-red-900 dark:text-red-100">
                  {summary.insurances?.overdue || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.receivablesDebts.upcomingInsurances')}
                </span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {summary.insurances?.upcoming || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Cheque Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>💰</span> {t('reports.receivablesDebts.chequeBreakdown')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.receivablesDebts.totalCheques')}
                </span>
                <span className="text-lg font-bold text-teal-900 dark:text-teal-100">
                  {summary.cheques?.count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.receivablesDebts.pendingCheques')}
                </span>
                <span className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                  {summary.cheques?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.receivablesDebts.returnedCheques')}
                </span>
                <span className="text-lg font-bold text-red-900 dark:text-red-100">
                  {summary.cheques?.returned || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              type="select"
              label={t('reports.receivablesDebts.itemType')}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              options={[
                { value: 'all', label: t('reports.receivablesDebts.allItems') },
                { value: 'insurances', label: t('reports.receivablesDebts.insurancesOnly') },
                { value: 'cheques', label: t('reports.receivablesDebts.chequesOnly') }
              ]}
            />

            <FormInput
              type="date"
              label={t('reports.receivablesDebts.dueDateFrom')}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.receivablesDebts.dueDateTo')}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.receivablesDebts.sortBy')}
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              options={[
                { value: 'dueDate', label: t('reports.receivablesDebts.sortByDueDate') },
                { value: 'amount', label: t('reports.receivablesDebts.sortByAmount') },
                { value: 'status', label: t('reports.receivablesDebts.sortByStatus') }
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
                {t('reports.receivablesDebts.showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('reports.receivablesDebts.of')} {pagination.total} {t('reports.receivablesDebts.results')}
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

        {/* Data Table */}
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