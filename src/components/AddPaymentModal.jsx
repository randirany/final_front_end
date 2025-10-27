import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, DollarSign, CreditCard, Building, FileText, Calendar, Hash, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AddPaymentModal = ({ isOpen, onClose, insurance, insuredId, vehicleId, onPaymentAdded, vehicles = [] }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';

  const [loading, setLoading] = useState(false);
  const [loadingInsurances, setLoadingInsurances] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [availableInsurances, setAvailableInsurances] = useState([]);

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    method: 'cash', // Used in form
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    paidBy: '',
    receiptNumber: '',
    chequeNumber: '',
    chequeDate: '',
    chequeStatus: 'pending'
  });

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVehicle('');
      setSelectedInsurance('');
      setAvailableInsurances([]);
    } else if (vehicleId && insurance) {
      // If vehicle and insurance are pre-selected
      setSelectedVehicle(vehicleId);
      setSelectedInsurance(insurance._id);
    }
  }, [isOpen, vehicleId, insurance]);

  // Fetch insurances when vehicle is selected
  useEffect(() => {
    const fetchInsurances = async () => {
      if (!selectedVehicle || !insuredId) {
        setAvailableInsurances([]);
        return;
      }

      setLoadingInsurances(true);
      try {
        const token = `islam__${localStorage.getItem('token')}`;
        const response = await axios.get(
          `${API_BASE_URL}/insured/get/${insuredId}/${selectedVehicle}?status=unpaid`,
          {
            headers: { token }
          }
        );

        if (response.data.success) {
          setAvailableInsurances(response.data.insurances || []);
        } else {
          setAvailableInsurances([]);
          toast.error(response.data.message || t('addPayment.errors.fetchInsurancesFailed', 'Failed to fetch insurances'));
        }
      } catch (error) {
        console.error('Error fetching insurances:', error);
        setAvailableInsurances([]);
        if (error.response?.status !== 404) {
          toast.error(t('addPayment.errors.network', 'Network error. Please try again.'));
        }
      } finally {
        setLoadingInsurances(false);
      }
    };

    fetchInsurances();
  }, [selectedVehicle, insuredId, t]);

  // Get the selected insurance object
  const currentInsurance = useMemo(() => {
    if (insurance) return insurance; // Use provided insurance if available
    if (!selectedInsurance) return null;
    return availableInsurances.find(ins => ins._id === selectedInsurance);
  }, [insurance, selectedInsurance, availableInsurances]);

  // Get current vehicle ID
  const currentVehicleId = vehicleId || selectedVehicle;

  if (!isOpen) return null;

  const remainingDebt = currentInsurance?.remainingDebt || 0;
  const insuranceAmount = currentInsurance?.insuranceAmount || 0;
  const paidAmount = currentInsurance?.paidAmount || 0;

  const paymentMethods = [
    { value: 'cash', label: t('addPayment.methods.cash', 'Cash'), icon: DollarSign },
    { value: 'card', label: t('addPayment.methods.card', 'Card'), icon: CreditCard },
    { value: 'bank_transfer', label: t('addPayment.methods.bankTransfer', 'Bank Transfer'), icon: Building },
    { value: 'cheque', label: t('addPayment.methods.cheque', 'Cheque'), icon: FileText }
  ];

  const chequeStatuses = [
    { value: 'pending', label: t('addPayment.chequeStatus.pending', 'Pending') },
    { value: 'cleared', label: t('addPayment.chequeStatus.cleared', 'Cleared') },
    { value: 'returned', label: t('addPayment.chequeStatus.returned', 'Returned') },
    { value: 'cancelled', label: t('addPayment.chequeStatus.cancelled', 'Cancelled') }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('addPayment.errors.amountRequired', 'Amount is required and must be greater than 0');
    } else if (parseFloat(formData.amount) > remainingDebt) {
      newErrors.amount = t('addPayment.errors.amountExceedsDebt', 'Payment amount exceeds remaining debt of {{debt}}', { debt: remainingDebt });
    }

    if (formData.paymentMethod === 'cheque') {
      if (!formData.chequeNumber) {
        newErrors.chequeNumber = t('addPayment.errors.chequeNumberRequired', 'Cheque number is required');
      }
      if (!formData.chequeDate) {
        newErrors.chequeDate = t('addPayment.errors.chequeDateRequired', 'Cheque date is required');
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = t('addPayment.errors.notesTooLong', 'Notes cannot exceed 500 characters');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('addPayment.errors.fixErrors', 'Please fix the errors in the form'));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        receiptNumber: formData.receiptNumber
      };

      if (formData.paymentMethod === 'cheque') {
        payload.chequeNumber = formData.chequeNumber;
        payload.chequeDate = formData.chequeDate;
        payload.chequeStatus = formData.chequeStatus;
      }

      if (!currentVehicleId || !currentInsurance) {
        toast.error(t('addPayment.errors.selectInsurance', 'Please select a vehicle and insurance'));
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:3002/api/v1/insured/addPayment/${insuredId}/${currentVehicleId}/${currentInsurance._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: `islam__${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(t('addPayment.success', 'Payment added successfully!'));
        onPaymentAdded(result.data);
        handleClose();
      } else {
        toast.error(result.message || t('addPayment.errors.failed', 'Failed to add payment'));
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error(t('addPayment.errors.network', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      paymentMethod: 'cash',
      method: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
      paidBy: '',
      receiptNumber: '',
      chequeNumber: '',
      chequeDate: '',
      chequeStatus: 'pending'
    });
    setErrors({});
    setSelectedVehicle('');
    setSelectedInsurance('');
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-navbarBack rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('customerInfo.payments.addPayment', 'Add Payment')}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Vehicle & Insurance Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.selectVehicle', 'Select Vehicle')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  required
                  disabled={loading}
                >
                  <option value="">{t('customerInfo.payments.chooseVehicle', 'Choose vehicle...')}</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.model} - {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Insurance Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.selectInsurance', 'Select Insurance')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedInsurance}
                  onChange={(e) => setSelectedInsurance(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  required
                  disabled={!selectedVehicle || loadingInsurances || loading}
                >
                  <option value="">
                    {!selectedVehicle
                      ? t('customerInfo.payments.selectVehicleFirst', 'Select vehicle first...')
                      : loadingInsurances
                      ? t('customerInfo.payments.loadingInsurances', 'Loading insurances...')
                      : availableInsurances.length === 0
                      ? t('customerInfo.payments.noActiveInsurance', 'No active insurance with debt')
                      : t('customerInfo.payments.chooseInsurance', 'Choose insurance...')
                    }
                  </option>
                  {availableInsurances.map((ins) => (
                    <option key={ins._id} value={ins._id}>
                      {ins.insuranceCompany} - {ins.insuranceType} ({t('common.currency')} {ins.remainingDebt || 0})
                    </option>
                  ))}
                </select>
                {loadingInsurances && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                    {t('customerInfo.payments.fetchingInsurances', 'Fetching unpaid insurances...')}
                  </p>
                )}
              </div>
            </div>

            {/* Insurance Info Display */}
            {currentInsurance && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm">
                      {t('addPayment.insuranceDetails', 'Insurance Details')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{t('addPayment.totalAmount', 'Total Amount')}</p>
                        <p className="font-bold text-blue-900 dark:text-blue-100">{insuranceAmount} {t('common.currency')}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{t('addPayment.paidAmount', 'Paid Amount')}</p>
                        <p className="font-bold text-green-700 dark:text-green-400">{paidAmount} {t('common.currency')}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{t('addPayment.remainingDebt', 'Remaining Debt')}</p>
                        <p className="font-bold text-red-600 dark:text-red-400">{remainingDebt} {t('common.currency')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amount & Payment Method Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.amount', 'Amount')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border ${errors.amount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors`}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.method', 'Payment Method')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  disabled={loading}
                >
                  <option value="cash">{t('customerInfo.payments.cash', 'Cash')}</option>
                  <option value="card">{t('customerInfo.payments.credit', 'Credit Card')}</option>
                  <option value="cheque">{t('customerInfo.payments.cheque', 'Cheque')}</option>
                  <option value="bank_transfer">{t('customerInfo.payments.bankTransfer', 'Bank Transfer')}</option>
                </select>
              </div>
            </div>

            {/* Cheque Fields - Show when method is cheque */}
            {formData.paymentMethod === 'cheque' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
                {/* Cheque Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addPayment.chequeNumber', 'Cheque Number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => handleChange('chequeNumber', e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border ${errors.chequeNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors`}
                    placeholder={t('addPayment.chequeNumberPlaceholder', 'Enter cheque number')}
                    required
                    disabled={loading}
                  />
                  {errors.chequeNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.chequeNumber}</p>
                  )}
                </div>

                {/* Cheque Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addPayment.chequeDate', 'Cheque Date')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => handleChange('chequeDate', e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border ${errors.chequeDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors dark:[color-scheme:dark]`}
                    required
                    disabled={loading}
                  />
                  {errors.chequeDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.chequeDate}</p>
                  )}
                </div>

                {/* Cheque Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addPayment.chequeStatus.label', 'Cheque Status')}
                  </label>
                  <select
                    value={formData.chequeStatus}
                    onChange={(e) => handleChange('chequeStatus', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    disabled={loading}
                  >
                    {chequeStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Paid By, Payment Date & Receipt Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Paid By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.paidBy', 'Paid By')}
                </label>
                <input
                  type="text"
                  value={formData.paidBy}
                  onChange={(e) => handleChange('paidBy', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  placeholder={t('customerInfo.payments.paidByPlaceholder', 'Person or entity name')}
                  disabled={loading}
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.date', 'Payment Date')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors dark:[color-scheme:dark]"
                  required
                  disabled={loading}
                />
              </div>

              {/* Receipt Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customerInfo.payments.receiptNumber', 'Receipt Number')}
                </label>
                <input
                  type="text"
                  value={formData.receiptNumber}
                  onChange={(e) => handleChange('receiptNumber', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  placeholder={t('customerInfo.payments.receiptPlaceholder', 'Auto-generated if empty')}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('customerInfo.payments.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border ${errors.notes ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-colors`}
                rows="3"
                placeholder={t('customerInfo.payments.notesPlaceholder', 'Additional notes...')}
                disabled={loading}
              />
              {errors.notes && (
                <p className="mt-1 text-xs text-red-500">{errors.notes}</p>
              )}
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !currentInsurance}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {t('customerInfo.payments.adding', 'Adding...')}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  {t('customerInfo.payments.addPayment', 'Add Payment')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
