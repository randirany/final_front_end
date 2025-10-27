import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';
import { expensesApi } from '../../services/expensesApi';

const ExpensesReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    pendingExpenses: 0,
    paidExpenses: 0,
    cancelledExpenses: 0,
    byPaymentMethod: {
      cash: 0,
      card: 0,
      cheque: 0,
      bank_transfer: 0
    }
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
    status: 'all',
    paymentMethod: '',
    paidBy: '',
    page: 1,
    limit: 10
  });

  const columns = [
    {
      header: t('reports.expenses.receiptNumber'),
      accessor: 'receiptNumber'
    },
    {
      header: t('reports.expenses.title'),
      accessor: 'title'
    },
    {
      header: t('reports.expenses.amount'),
      accessor: 'amount',
      render: (value) => `${value?.toLocaleString() || 0} ${t('common.currency')}`
    },
    {
      header: t('reports.expenses.paidBy'),
      accessor: 'paidBy'
    },
    {
      header: t('reports.expenses.paymentMethod'),
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
          {t(`expenses.paymentMethods.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.expenses.status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'paid'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : value === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {t(`reports.expenses.statusValues.${value}`)}
        </span>
      )
    },
    {
      header: t('reports.expenses.date'),
      accessor: 'date',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('reports.expenses.description'),
      accessor: 'description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchData();
  }, [filters.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await expensesApi.getAllWithFilters(filters);

      const { expenses, summary: apiSummary, pagination: apiPagination } = response;

      setData(expenses || []);
      setSummary(apiSummary || {
        totalExpenses: 0,
        totalAmount: 0,
        pendingExpenses: 0,
        paidExpenses: 0,
        cancelledExpenses: 0,
        byPaymentMethod: {
          cash: 0,
          card: 0,
          cheque: 0,
          bank_transfer: 0
        }
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
      console.error('Error fetching expense data:', error);
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
      status: 'all',
      paymentMethod: '',
      paidBy: '',
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
            {t('reports.expenses.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.expenses.description')}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
          <StatCard
            title={t('reports.expenses.totalExpenses')}
            value={summary.totalExpenses}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.expenses.totalAmount')}
            value={summary.totalAmount?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.expenses.paidExpenses')}
            value={summary.paidExpenses}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.expenses.pendingExpenses')}
            value={summary.pendingExpenses}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.expenses.cashTotal')}
            value={summary.byPaymentMethod?.cash?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.expenses.cardTotal')}
            value={summary.byPaymentMethod?.card?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
          <StatCard
            title={t('reports.expenses.chequeTotal')}
            value={summary.byPaymentMethod?.cheque?.toLocaleString() || 0}
            suffix={t('common.currency')}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              label={t('reports.expenses.startDate')}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.expenses.endDate')}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('reports.expenses.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'paid', label: t('reports.expenses.statusValues.paid') },
                { value: 'pending', label: t('reports.expenses.statusValues.pending') },
                { value: 'cancelled', label: t('reports.expenses.statusValues.cancelled') }
              ]}
            />

            <FormInput
              type="select"
              label={t('reports.expenses.paymentMethod')}
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'cash', label: t('expenses.paymentMethods.cash') },
                { value: 'card', label: t('expenses.paymentMethods.card') },
                { value: 'cheque', label: t('expenses.paymentMethods.cheque') },
                { value: 'bank_transfer', label: t('expenses.paymentMethods.bank_transfer') }
              ]}
            />

            <FormInput
              type="text"
              label={t('reports.expenses.paidBy')}
              value={filters.paidBy}
              onChange={(e) => handleFilterChange('paidBy', e.target.value)}
              placeholder={t('reports.expenses.paidByPlaceholder')}
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
          title={t('reports.expenses.title')}
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

export default ExpensesReport;
