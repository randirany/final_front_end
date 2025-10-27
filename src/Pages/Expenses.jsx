import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { Edit, Delete, Visibility, MoreVert, Add } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { expensesApi } from '../services/expensesApi';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import DataTable from '../components/shared/DataTable';

const Expenses = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesApi.getAll();
      setExpenses(response.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Swal.fire({
        title: t('expenses.error'),
        text: t('expenses.errorFetchingDetails'),
        icon: 'error',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
  const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
    handleMenuClose(expense._id);
  };

  const handleView = (expense) => {
    navigate(`/expenses/view/${expense._id}`);
    handleMenuClose(expense._id);
  };

  const handleDelete = async (expenseId, expenseTitle) => {
    handleMenuClose(expenseId);

    const result = await Swal.fire({
      title: t('expenses.delete_confirm', { title: expenseTitle }),
      text: t('expenses.delete_confirm_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('expenses.yes_delete'),
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
        await expensesApi.delete(expenseId);
        Swal.fire({
          title: t('expenses.successDelete'),
          icon: "success",
          timer: 2000,
          customClass: {
            popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
            title: 'dark:text-white'
          }
        });
        fetchExpenses();
      } catch (error) {
        Swal.fire({
          title: t('expenses.error'),
          text: error.response?.data?.message || t('expenses.saveError'),
          icon: 'error',
          customClass: {
            popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300'
          }
        });
      }
    }
  };

  const tableColumns = useMemo(() => [
    {
      header: t('expenses.receiptNumber'),
      accessor: 'receiptNumber',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value}
        </span>
      )
    },
    {
      header: t('expenses.title_label'),
      accessor: 'title',
      render: (value) => (
        <span className="text-gray-900 dark:text-gray-200">
          {value}
        </span>
      )
    },
    {
      header: t('expenses.amount'),
      accessor: 'amount',
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {value?.toLocaleString()} ₪
        </span>
      )
    },
    {
      header: t('expenses.paidBy'),
      accessor: 'paidBy',
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">
          {value}
        </span>
      )
    },
    {
      header: t('expenses.paymentMethod'),
      accessor: 'paymentMethod',
      render: (value) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {t(`expenses.paymentMethods.${value}`)}
        </span>
      )
    },
    {
      header: t('expenses.date'),
      accessor: 'date',
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">
          {toLocaleDateStringEN(value)}
        </span>
      )
    },
    {
      header: t('expenses.actions'),
      accessor: 'actions',
      render: (value, row) => (
        <div className={`flex items-center ${(language === 'ar' || language === 'he') ? 'justify-start' : 'justify-end'}`}>
          <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, row._id)}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEls[row._id]} open={Boolean(anchorEls[row._id])} onClose={() => handleMenuClose(row._id)}>
            <MenuItem onClick={() => handleView(row)}>
              <Visibility fontSize="small" className="mr-2" /> {t('common.view')}
            </MenuItem>
            <MenuItem onClick={() => handleEdit(row)}>
              <Edit fontSize="small" className="mr-2" /> {t('common.edit')}
            </MenuItem>
            <MenuItem onClick={() => handleDelete(row._id, row.title)} className="text-red-600 dark:text-red-400">
              <Delete fontSize="small" className="mr-2" /> {t('common.delete')}
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
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('expenses.firstTitle')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('expenses.secondeTitle')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-navbarBack shadow-sm hover:shadow-md"
          >
            <Add sx={{ fontSize: 20 }} />
            {t('expenses.add_button')}
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={expenses}
        columns={tableColumns}
        title={t('expenses.title', 'Expenses')}
        loading={loading}
        onRefresh={fetchExpenses}
        enableSearch={true}
        enableExport={true}
        enableCSV={true}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onExpenseAdded={fetchExpenses}
      />
      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        onExpenseUpdated={fetchExpenses}
        expense={selectedExpense}
      />
    </div>
  );
};

export default Expenses;
