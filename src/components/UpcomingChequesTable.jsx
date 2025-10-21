import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Visibility, ArrowForward } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import DataTable from './shared/DataTable';
import { getAllCheques } from '../services/chequeApi';
import { toLocaleDateStringEN } from '../utils/dateFormatter';

const UpcomingChequesTable = ({ onViewCheque }) => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingCheques();
  }, []);

  const fetchUpcomingCheques = async () => {
    setLoading(true);
    try {
      // Calculate date range: today to today + 7 days
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const startDate = today.toISOString().split('T')[0];
      const endDate = nextWeek.toISOString().split('T')[0];

      const response = await getAllCheques({
        page: 1,
        limit: 20,
        startDate,
        endDate,
        status: 'pending' // Only show pending cheques
      });

      setCheques(response.data || []);
    } catch (error) {
      console.error('Error fetching upcoming cheques:', error);
      setCheques([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate('/cheques');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'cleared': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'returned': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || statusClasses['pending']}`}>
        {t(`cheques.status.${status?.toLowerCase()}`, status)}
      </span>
    );
  };

  // Calculate days until cheque date
  const getDaysUntil = (chequeDate) => {
    const today = new Date();
    const targetDate = new Date(chequeDate);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('cheques.today', 'Today');
    if (diffDays === 1) return t('cheques.tomorrow', 'Tomorrow');
    return `${diffDays} ${t('cheques.days', 'days')}`;
  };

  const columns = [
    {
      header: t('cheques.chequeNumber', 'Cheque Number'),
      accessor: 'chequeNumber',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      header: t('cheques.customer', 'Customer'),
      accessor: 'customer',
      render: (value) => value?.name || 'N/A'
    },
    {
      header: t('cheques.amount', 'Amount'),
      accessor: 'amount',
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {value?.toLocaleString()} ₪
        </span>
      )
    },
    {
      header: t('cheques.dueDate', 'Due Date'),
      accessor: 'chequeDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('cheques.dueIn', 'Due In'),
      accessor: 'chequeDate',
      render: (value) => (
        <span className="text-orange-600 dark:text-orange-400 font-medium">
          {getDaysUntil(value)}
        </span>
      ),
      sortable: false
    },
    {
      header: t('cheques.statusHeader', 'Status'),
      accessor: 'status',
      render: (value) => getStatusBadge(value),
      sortable: false
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: '_id',
      render: (value) => (
        <IconButton
          size="small"
          onClick={() => onViewCheque && onViewCheque(value)}
          className="dark:text-gray-300"
        >
          <Visibility fontSize="small" />
        </IconButton>
      ),
      sortable: false
    }
  ];

  return (
    <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('cheques.upcomingCheques', 'Upcoming Cheques')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('cheques.nextSevenDays', 'Due in the next 7 days')}
          </p>
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('common.viewAll', 'View All')}
          <ArrowForward fontSize="small" />
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        data={cheques}
        columns={columns}
        loading={loading}
        onRefresh={fetchUpcomingCheques}
        enableSearch={false}
        enableExport={false}
        className="!p-0 !shadow-none !bg-transparent"
      />

      {/* Summary */}
      {cheques.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('cheques.totalUpcoming', 'Total Upcoming')}:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {cheques.reduce((sum, cheque) => sum + (cheque.amount || 0), 0).toLocaleString()} ₪
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingChequesTable;
