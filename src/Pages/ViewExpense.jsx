import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { Button, Card, CardContent, Divider, Chip } from '@mui/material';
import Swal from 'sweetalert2';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { expensesApi } from '../services/expensesApi';

const ViewExpense = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const response = await expensesApi.getAll();
      const foundExpense = response.expenses.find(e => e._id === id);

      if (foundExpense) {
        setExpense(foundExpense);
      } else {
        Swal.fire({
          title: t('expenses.notFound'),
          text: t('expenses.expenseNotFoundDescription'),
          icon: 'error',
          customClass: {
            popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300'
          }
        }).then(() => {
          navigate('/expenses');
        });
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
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

  const handleEdit = () => {
    navigate(`/expenses/edit/${id}`);
  };

  const handleDelete = async () => {
    Swal.fire({
      title: t('expenses.delete_confirm', { title: expense.title }),
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await expensesApi.delete(id);
          Swal.fire({
            title: t('expenses.successDelete'),
            icon: "success",
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white'
            }
          }).then(() => {
            navigate('/expenses');
          });
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
    });
  };

  if (loading) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('expenses.firstTitle')}</NavLink>
          <span className="text-gray-400">/</span>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/expenses">{t('expenses.secondeTitle')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('expenses.viewExpense')}</span>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/expenses')}
          sx={{
            borderColor: '#6C5FFC',
            color: '#6C5FFC',
            '&:hover': { borderColor: '#5a4fd8', backgroundColor: 'rgba(108, 95, 252, 0.04)' }
          }}
        >
          {t('expenses.backToList')}
        </Button>
      </div>

      {/* Expense Details Card */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold dark:text-white">{t('expenses.viewExpense')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('expenses.viewExpenseSubtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{
                borderColor: '#6C5FFC',
                color: '#6C5FFC',
                '&:hover': { borderColor: '#5a4fd8', backgroundColor: 'rgba(108, 95, 252, 0.04)' }
              }}
            >
              {t('common.edit', 'Edit')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleDelete}
              sx={{
                borderColor: '#d33',
                color: '#d33',
                '&:hover': { borderColor: '#b82828', backgroundColor: 'rgba(211, 51, 51, 0.04)' }
              }}
            >
              {t('common.delete', 'Delete')}
            </Button>
          </div>
        </div>

        <Divider className="my-4 dark:bg-gray-700" />

        {/* Expense Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Receipt Number */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.receiptNumber')}</p>
            <p className="text-base font-medium dark:text-white">{expense.receiptNumber}</p>
          </div>

          {/* Title */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.title_label')}</p>
            <p className="text-base font-medium dark:text-white">{expense.title}</p>
          </div>

          {/* Amount */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.amount')}</p>
            <p className="text-base font-medium dark:text-white text-green-600 dark:text-green-400">{expense.amount}</p>
          </div>

          {/* Paid By */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.paidBy')}</p>
            <p className="text-base font-medium dark:text-white">{expense.paidBy}</p>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.paymentMethod')}</p>
            <Chip
              label={t(`expenses.paymentMethods.${expense.paymentMethod}`)}
              sx={{
                backgroundColor: '#6C5FFC',
                color: '#fff',
                fontWeight: 500
              }}
              size="small"
            />
          </div>

          {/* Date */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.date')}</p>
            <p className="text-base font-medium dark:text-white">{toLocaleDateStringEN(expense.date)}</p>
          </div>
        </div>

        {/* Description */}
        {expense.description && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.description')}</p>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-base dark:text-white whitespace-pre-wrap">{expense.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Card */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('expenses.metadata')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.createdAt')}</p>
            <p className="text-base dark:text-white">{toLocaleDateStringEN(expense.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('expenses.lastUpdated')}</p>
            <p className="text-base dark:text-white">{toLocaleDateStringEN(expense.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpense;
