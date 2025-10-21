import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Visibility, ArrowForward, ErrorOutline } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import DataTable from './shared/DataTable';
import { getAllCheques } from '../services/chequeApi';
import { toLocaleDateStringEN } from '../utils/dateFormatter';

const ReturnedChequesTable = ({ onViewCheque }) => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchReturnedCheques();
  }, []);

  const fetchReturnedCheques = async () => {
    setLoading(true);
    try {
      const response = await getAllCheques({
        page: 1,
        limit: 20,
        status: 'returned'
      });

      setCheques(response.data || []);

      // Calculate total amount
      const total = (response.data || []).reduce((sum, cheque) => sum + (cheque.amount || 0), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching returned cheques:', error);
      setCheques([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate('/cheques?status=returned');
  };

  const getStatusBadge = (status) => {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
        {t(`cheques.status.${status?.toLowerCase()}`, status)}
      </span>
    );
  };

  // Calculate days since returned
  const getDaysSince = (returnedDate) => {
    if (!returnedDate) return '-';

    const today = new Date();
    const targetDate = new Date(returnedDate);
    const diffTime = today - targetDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('cheques.today', 'Today');
    if (diffDays === 1) return t('cheques.yesterday', 'Yesterday');
    return `${diffDays} ${t('cheques.daysAgo', 'days ago')}`;
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
        <span className="font-semibold text-red-600 dark:text-red-400">
          {value?.toLocaleString()} ₪
        </span>
      )
    },
    {
      header: t('cheques.chequeDate', 'Cheque Date'),
      accessor: 'chequeDate',
      render: (value) => toLocaleDateStringEN(value)
    },
    {
      header: t('cheques.returnedReason', 'Reason'),
      accessor: 'returnedReason',
      render: (value) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 italic">
          {value || t('cheques.noReason', 'No reason provided')}
        </span>
      ),
      sortable: false
    },
    {
      header: t('cheques.returnedDate', 'Returned'),
      accessor: 'returnedDate',
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-xs">
            {value ? toLocaleDateStringEN(value) : '-'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getDaysSince(value)}
          </span>
        </div>
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
          <div className="flex items-center gap-2">
            <ErrorOutline className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('cheques.returnedCheques', 'Returned Cheques')}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('cheques.chequesRequiringAttention', 'Cheques requiring attention')}
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

      {/* Summary Alert */}
      {cheques.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ErrorOutline className="text-red-600 dark:text-red-400" fontSize="small" />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                {cheques.length} {t('cheques.returnedChequesCount', 'returned cheque(s)')}
              </span>
            </div>
            <span className="text-sm font-semibold text-red-900 dark:text-red-200">
              {totalAmount.toLocaleString()} ₪
            </span>
          </div>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        data={cheques}
        columns={columns}
        loading={loading}
        onRefresh={fetchReturnedCheques}
        enableSearch={false}
        enableExport={false}
        className="!p-0 !shadow-none !bg-transparent"
      />
    </div>
  );
};

export default ReturnedChequesTable;
