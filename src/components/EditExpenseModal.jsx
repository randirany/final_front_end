import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { expensesApi } from '../services/expensesApi';

const EditExpenseModal = ({ isOpen, onClose, onExpenseUpdated, expense }) => {
  const { t } = useTranslation();

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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen, loading]);

  useEffect(() => {
    if (isOpen && expense) {
      setFormData({
        title: expense.title || '',
        amount: expense.amount || '',
        paidBy: expense.paidBy || '',
        paymentMethod: expense.paymentMethod || 'cash',
        description: expense.description || ''
      });
      setErrors({});
    }
  }, [isOpen, expense]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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

      await expensesApi.update(expense._id, expenseData);

      toast.success(t('expenses.expenseUpdatedSuccessfully'));
      if (onExpenseUpdated) onExpenseUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error(error.response?.data?.message || t('expenses.errorUpdatingExpense'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleBackdropClick}>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-semibold dark:text-white">{t('expenses.editExpense')}</h2>
          <button
            onClick={handleCloseClick}
            disabled={loading}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Receipt Number Info */}
            {expense && expense.receiptNumber && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('expenses.receiptNumber')}:</strong> {expense.receiptNumber}
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('expenses.title_label')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('expenses.titlePlaceholder')}
                className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Amount and Paid By Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium dark:text-gray-300 mb-1">
                  {t('expenses.amount')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder={t('expenses.amountPlaceholder')}
                  min="0"
                  step="0.01"
                  className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.amount ? 'border-red-500' : ''}`}
                />
                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="paidBy" className="block text-sm font-medium dark:text-gray-300 mb-1">
                  {t('expenses.paidBy')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="paidBy"
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  placeholder={t('expenses.paidByPlaceholder')}
                  className={`w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.paidBy ? 'border-red-500' : ''}`}
                />
                {errors.paidBy && <p className="mt-1 text-sm text-red-500">{errors.paidBy}</p>}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('expenses.paymentMethod')} <span className="text-red-500">*</span>
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {t(`expenses.paymentMethods.${method}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium dark:text-gray-300 mb-1">
                {t('expenses.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('expenses.descriptionPlaceholder')}
                rows={4}
                className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={handleCloseClick}
              disabled={loading}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('expenses.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? t('expenses.updating') : t('expenses.updateExpense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
