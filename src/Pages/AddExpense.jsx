import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, NavLink } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import Swal from 'sweetalert2';
import { expensesApi } from '../services/expensesApi';

const AddExpense = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    paidBy: '',
    paymentMethod: 'cash',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = ['cash', 'card', 'cheque', 'bank_transfer'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('expenses.validation.titleRequired');
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('expenses.validation.amountRequired');
    }

    if (!formData.paidBy.trim()) {
      newErrors.paidBy = t('expenses.validation.paidByRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        paymentMethod: formData.paymentMethod,
        description: formData.description || undefined
      };

      const response = await expensesApi.create(expenseData);

      Swal.fire({
        title: t('expenses.updateSuccess'),
        text: t('expenses.expenseCreatedSuccessfully'),
        icon: 'success',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      }).then(() => {
        navigate('/expenses');
      });
    } catch (error) {
      console.error('Error saving expense:', error);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('expenses.firstTitle')}</NavLink>
          <span className="text-gray-400">/</span>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/expenses">{t('expenses.secondeTitle')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('expenses.addExpense')}</span>
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

      {/* Form */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2 dark:text-white">{t('expenses.addExpense')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('expenses.addExpenseSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <TextField
              fullWidth
              label={t('expenses.title_label')}
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={!!errors.title}
              helperText={errors.title}
              placeholder={t('expenses.titlePlaceholder')}
              required
              className="dark:bg-gray-700"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.title ? '#f44336' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
              }}
            />
          </div>

          {/* Amount and Paid By Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              fullWidth
              label={t('expenses.amount')}
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              error={!!errors.amount}
              helperText={errors.amount}
              placeholder={t('expenses.amountPlaceholder')}
              required
              inputProps={{ min: 0, step: "0.01" }}
              className="dark:bg-gray-700"
            />

            <TextField
              fullWidth
              label={t('expenses.paidBy')}
              name="paidBy"
              value={formData.paidBy}
              onChange={handleInputChange}
              error={!!errors.paidBy}
              helperText={errors.paidBy}
              placeholder={t('expenses.paidByPlaceholder')}
              required
              className="dark:bg-gray-700"
            />
          </div>

          {/* Payment Method */}
          <div>
            <FormControl fullWidth>
              <InputLabel id="payment-method-label">{t('expenses.paymentMethod')}</InputLabel>
              <Select
                labelId="payment-method-label"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                label={t('expenses.paymentMethod')}
                className="dark:bg-gray-700"
              >
                {paymentMethods.map(method => (
                  <MenuItem key={method} value={method}>
                    {t(`expenses.paymentMethods.${method}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Description */}
          <div>
            <TextField
              fullWidth
              label={t('expenses.description')}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('expenses.descriptionPlaceholder')}
              multiline
              rows={4}
              className="dark:bg-gray-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              variant="outlined"
              onClick={() => navigate('/expenses')}
              disabled={loading}
              sx={{
                borderColor: '#6e7881',
                color: '#6e7881',
                '&:hover': { borderColor: '#5a6169', backgroundColor: 'rgba(110, 120, 129, 0.04)' }
              }}
            >
              {t('expenses.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: '#6C5FFC',
                color: '#fff',
                '&:hover': { background: '#5a4fd8' },
                '&:disabled': { background: '#9e96fc', color: '#fff' }
              }}
            >
              {loading ? t('expenses.saving') : t('expenses.saveExpense')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
