import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { updateChequeStatus, getChequeById } from '../services/chequeApi';

const EditChequeModal = ({ open, onClose, onSuccess, chequeId }) => {
  const { t, i18n: { language } } = useTranslation();

  const [formData, setFormData] = useState({
    status: 'pending',
    notes: '',
    returnedReason: ''
  });

  const [chequeDetails, setChequeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && chequeId) {
      fetchChequeDetails();
    }
  }, [open, chequeId]);

  const fetchChequeDetails = async () => {
    setFetchingDetails(true);
    try {
      const response = await getChequeById(chequeId);
      setChequeDetails(response.cheque);
      setFormData({
        status: response.cheque.status || 'pending',
        notes: '',
        returnedReason: ''
      });
    } catch (error) {
      console.error('Error fetching cheque details:', error);
      Swal.fire({
        title: t('cheques.error', 'Error'),
        text: t('cheques.errorFetchingDetails', 'Error fetching cheque details'),
        icon: 'error'
      });
      onClose();
    } finally {
      setFetchingDetails(false);
    }
  };

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

    if (!formData.status) {
      newErrors.status = t('cheques.validation.statusRequired', 'Status is required');
    }

    if (formData.status === 'returned' && !formData.returnedReason.trim()) {
      newErrors.returnedReason = t('cheques.validation.returnedReasonRequired', 'Reason for return is required');
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
      const statusData = {
        status: formData.status,
        ...(formData.notes.trim() && { notes: formData.notes }),
        ...(formData.status === 'returned' && formData.returnedReason && {
          returnedReason: formData.returnedReason
        })
      };

      await updateChequeStatus(chequeId, statusData);

      Swal.fire({
        title: t('cheques.updateSuccess', 'Success!'),
        text: t('cheques.chequeUpdatedSuccessfully', 'Cheque status updated successfully'),
        icon: 'success',
        timer: 2000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating cheque:', error);
      Swal.fire({
        title: t('cheques.error', 'Error'),
        text: error.message || t('cheques.errorUpdatingCheque', 'Error updating cheque'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      status: 'pending',
      notes: '',
      returnedReason: ''
    });
    setChequeDetails(null);
    setErrors({});
    onClose();
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': t('cheques.status.pending', 'Pending'),
      'cleared': t('cheques.status.cleared', 'Cleared'),
      'returned': t('cheques.status.returned', 'Returned'),
      'cancelled': t('cheques.status.cancelled', 'Cancelled')
    };
    return statusMap[status] || status;
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
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span>{t('cheques.updateStatus', 'Update Cheque Status')}</span>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      {fetchingDetails ? (
        <DialogContent className="dark:bg-navbarBack dark:text-white">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent className="dark:bg-navbarBack dark:text-white">
            <div className="space-y-4 mt-2">
              {/* Cheque Information */}
              {chequeDetails && (
                <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.chequeNumber', 'Cheque Number')}</p>
                      <p className="text-base font-semibold dark:text-white">{chequeDetails.chequeNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.currentStatus', 'Current Status')}</p>
                      <div className="mt-1">{getStatusBadge(chequeDetails.status)}</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.customer', 'Customer')}</p>
                    <p className="text-sm dark:text-white">{chequeDetails.customer?.name || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.amount', 'Amount')}</p>
                      <p className="text-sm font-semibold dark:text-white">{chequeDetails.amount?.toLocaleString()} ₪</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.cheque_date', 'Date')}</p>
                      <p className="text-sm dark:text-white">{new Date(chequeDetails.chequeDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Selection */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.newStatus', 'New Status')} *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                    errors.status
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                  }`}
                >
                  <option value="pending">{t('cheques.status.pending', 'Pending')}</option>
                  <option value="cleared">{t('cheques.status.cleared', 'Cleared')}</option>
                  <option value="returned">{t('cheques.status.returned', 'Returned')}</option>
                  <option value="cancelled">{t('cheques.status.cancelled', 'Cancelled')}</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                )}
              </div>

              {/* Returned Reason - Only show when status is 'returned' */}
              {formData.status === 'returned' && (
                <div>
                  <label htmlFor="returnedReason" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('cheques.returnedReason', 'Reason for Return')} *
                  </label>
                  <input
                    type="text"
                    id="returnedReason"
                    name="returnedReason"
                    value={formData.returnedReason}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.returnedReason
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                    placeholder={t('cheques.returnedReasonPlaceholder', 'e.g., Insufficient funds')}
                  />
                  {errors.returnedReason && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.returnedReason}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.notes', 'Notes')}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-dark2 dark:text-white dark:focus:border-blue-400"
                  placeholder={t('cheques.notesPlaceholder', 'Enter additional notes')}
                />
              </div>
            </div>
          </DialogContent>

          <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
            <Button
              onClick={handleClose}
              disabled={loading}
              className="dark:text-gray-300"
            >
              {t('cheques.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
            >
              {loading ? t('cheques.updating', 'Updating...') : t('cheques.updateCheque', 'Update Status')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default EditChequeModal;
