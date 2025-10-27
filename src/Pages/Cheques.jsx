import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Add, Edit, Delete, Visibility, MoreVert } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { getAllCheques, deleteCheque } from '../services/chequeApi';
import AddChequeModal from '../components/AddChequeModal';
import EditChequeModal from '../components/EditChequeModal';
import ViewChequeModal from '../components/ViewChequeModal';
import DataTable from '../components/shared/DataTable';

const ROWS_PER_PAGE = 20;

const Cheques = () => {
  const { t, i18n: { language } } = useTranslation();
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [anchorEls, setAnchorEls] = useState({});

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch cheques on mount and when filters change
  useEffect(() => {
    fetchCheques();
  }, [statusFilter, startDate, endDate]);

  const fetchCheques = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const response = await getAllCheques(filters);
      setCheques(response.data || []);
      setSummary(response.summary);
    } catch (error) {
      console.error('Error fetching cheques:', error);
      Swal.fire({
        title: t('cheques.error', 'Error'),
        text: t('cheques.errorFetchingCheques', 'Error fetching cheques'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
  const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));

  const handleView = (cheque) => {
    setSelectedChequeId(cheque._id);
    setViewModalOpen(true);
    handleMenuClose(cheque._id);
  };

  const handleEdit = (cheque) => {
    setSelectedChequeId(cheque._id);
    setEditModalOpen(true);
    handleMenuClose(cheque._id);
  };

  const handleDelete = async (chequeId, chequeNumber) => {
    handleMenuClose(chequeId);

    const result = await Swal.fire({
      title: t('cheques.delete_confirm', `Are you sure you want to delete cheque ${chequeNumber}?`),
      text: t('cheques.delete_confirm_text', "This action cannot be undone!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('cheques.yes_delete', 'Yes, delete it!'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteCheque(chequeId);
        Swal.fire({
          title: t('cheques.successDelete', 'Deleted!'),
          text: t('cheques.chequeDeleted', 'Cheque has been deleted'),
          icon: 'success',
          timer: 2000
        });
        fetchCheques(1, false);
      } catch (error) {
        console.error('Error deleting cheque:', error);
        Swal.fire({
          title: t('cheques.error', 'Error'),
          text: error.message || t('cheques.errorDeletingCheque', 'Error deleting cheque'),
          icon: 'error'
        });
      }
    }
  };

  const handleModalSuccess = () => {
    fetchCheques();
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

  const tableColumns = useMemo(() => [
    {
      header: t('cheques.chequeNumber', 'Cheque Number'),
      accessor: 'chequeNumber',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value}
        </span>
      )
    },
    {
      header: t('cheques.customer', 'Customer'),
      accessor: 'customer',
      render: (value, row) => (
        <span className="text-gray-900 dark:text-gray-200">
          {row.customer?.name || 'N/A'}
        </span>
      )
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
      header: t('cheques.cheque_date', 'Cheque Date'),
      accessor: 'chequeDate',
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">
          {toLocaleDateStringEN(value)}
        </span>
      )
    },
    {
      header: t('cheques.statusHeader', 'Status'),
      accessor: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: t('cheques.actions', 'Actions'),
      accessor: 'actions',
      render: (value, row) => (
        <div className={`flex items-center ${(language === 'ar' || language === 'he') ? 'justify-start' : 'justify-end'}`}>
          <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, row._id)}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEls[row._id]} open={Boolean(anchorEls[row._id])} onClose={() => handleMenuClose(row._id)}>
            <MenuItem onClick={() => handleView(row)}>
              <Visibility fontSize="small" className="mr-2" /> {t('common.view', 'View')}
            </MenuItem>
            <MenuItem onClick={() => handleEdit(row)}>
              <Edit fontSize="small" className="mr-2" /> {t('common.edit', 'Edit Status')}
            </MenuItem>
            <MenuItem onClick={() => handleDelete(row._id, row.chequeNumber)} className="text-red-600 dark:text-red-400">
              <Delete fontSize="small" className="mr-2" /> {t('common.delete', 'Delete')}
            </MenuItem>
          </Menu>
        </div>
      )
    }
  ], [t, language, anchorEls]);

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('cheques.firstTitle', 'Dashboard')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('cheques.secondeTitle', 'Cheques')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-navbarBack shadow-sm hover:shadow-md"
          >
            <Add sx={{ fontSize: 20 }} />
            {t('cheques.add_button', 'Add Cheque')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.totalCheques', 'Total Cheques')}</p>
            <p className="text-2xl font-bold dark:text-white">{summary.totalCheques}</p>
          </div>
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.totalAmount', 'Total Amount')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.totalAmount?.toLocaleString()} ₪</p>
          </div>
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.pendingCount', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.pendingCount}</p>
          </div>
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.returnedCount', 'Returned')}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.returnedCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='flex rounded-md justify-start items-start flex-wrap mb-4 gap-4'>
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm"
          >
            <option value="all">{t('cheques.allStatus', 'All Status')}</option>
            <option value="pending">{t('cheques.status.pending', 'Pending')}</option>
            <option value="cleared">{t('cheques.status.cleared', 'Cleared')}</option>
            <option value="returned">{t('cheques.status.returned', 'Returned')}</option>
            <option value="cancelled">{t('cheques.status.cancelled', 'Cancelled')}</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm"
            placeholder={t('cheques.startDate', 'Start Date')}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm"
            placeholder={t('cheques.endDate', 'End Date')}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={cheques}
        columns={tableColumns}
        title={t('cheques.title', 'Cheques')}
        loading={loading}
        onRefresh={fetchCheques}
        enableSearch={true}
        enableExport={true}
        enableCSV={true}
      />

      {/* Modals */}
      <AddChequeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditChequeModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleModalSuccess}
        chequeId={selectedChequeId}
      />

      <ViewChequeModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onEdit={(id) => {
          setSelectedChequeId(id);
          setEditModalOpen(true);
        }}
        onSuccess={handleModalSuccess}
        chequeId={selectedChequeId}
      />
    </div>
  );
};

export default Cheques;
