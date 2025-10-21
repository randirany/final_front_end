import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudUpload, Delete, Close } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import { createCustomerCheque, createInsuranceCheque, createChequeFormData } from '../services/chequeApi';
import axios from 'axios';

const AddChequeModal = ({ open, onClose, onSuccess, selectedCustomerId }) => {
  const { t, i18n: { language } } = useTranslation();

  const [formData, setFormData] = useState({
    chequeNumber: '',
    amount: '',
    chequeDate: '',
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(selectedCustomerId || '');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch customers on component mount
  useEffect(() => {
    if (open) {
      fetchCustomers();
      if (selectedCustomerId) {
        setSelectedCustomer(selectedCustomerId);
      }
    }
  }, [open, selectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const res = await axios.get(`http://localhost:3002/api/v1/insured/allInsured`, {
        headers: { token }
      });
      const formattedCustomers = res.data.data?.map(item => ({
        id: item._id,
        firstName: item.first_name || '',
        lastName: item.last_name || '',
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        idNumber: item.id_Number || '',
        phoneNumber: item.phone_number || '',
        displayText: `${item.first_name || ''} ${item.last_name || ''} - ${item.phone_number || ''}`
      })) || [];
      setCustomers(formattedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.chequeImage) {
        setErrors(prev => ({ ...prev, chequeImage: '' }));
      }
    }
  }, [errors.chequeImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

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

  const handleCustomerChange = (e) => {
    setSelectedCustomer(e.target.value);
    if (errors.customer) {
      setErrors(prev => ({ ...prev, customer: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.chequeNumber.trim()) {
      newErrors.chequeNumber = t('cheques.validation.chequeNumberRequired', 'Cheque number is required');
    }

    if (!selectedCustomer) {
      newErrors.customer = t('cheques.validation.customerRequired', 'Customer is required');
    }

    if (!formData.chequeDate) {
      newErrors.chequeDate = t('cheques.validation.chequeDateRequired', 'Cheque date is required');
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('cheques.validation.amountRequired', 'Valid amount is required');
    }

    if (!uploadedImage) {
      newErrors.chequeImage = t('cheques.validation.imageRequired', 'Cheque image is required');
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
      const chequeData = createChequeFormData({
        chequeNumber: formData.chequeNumber,
        amount: parseFloat(formData.amount),
        chequeDate: formData.chequeDate,
        notes: formData.notes,
        chequeImage: uploadedImage
      });

      // Always create customer cheque (general payment)
      await createCustomerCheque(selectedCustomer, chequeData);

      Swal.fire({
        title: t('cheques.addSuccess', 'Success!'),
        text: t('cheques.chequeAddedSuccessfully', 'Cheque added successfully'),
        icon: 'success',
        timer: 2000
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving cheque:', error);
      Swal.fire({
        title: t('cheques.error', 'Error'),
        text: error.message || t('cheques.errorAddingCheque', 'Error adding cheque'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      chequeNumber: '',
      amount: '',
      chequeDate: '',
      notes: ''
    });
    setSelectedCustomer(selectedCustomerId || '');
    setUploadedImage(null);
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (errors.chequeImage) {
      setErrors(prev => ({ ...prev, chequeImage: '' }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span>{t('cheques.addCheque', 'Add Cheque')}</span>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="dark:bg-navbarBack dark:text-white">
          <div className="space-y-4 mt-2">
            {/* Customer Selection */}
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('cheques.customer', 'Customer')} *
              </label>
              <select
                id="customer"
                value={selectedCustomer}
                onChange={handleCustomerChange}
                disabled={!!selectedCustomerId}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                  errors.customer
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                }`}
              >
                <option value="">{t('cheques.selectCustomer', 'Select customer')}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.displayText}
                  </option>
                ))}
              </select>
              {errors.customer && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customer}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cheque Number */}
              <div>
                <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.chequeNumber', 'Cheque Number')} *
                </label>
                <input
                  type="text"
                  id="chequeNumber"
                  name="chequeNumber"
                  value={formData.chequeNumber}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                    errors.chequeNumber
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                  }`}
                  placeholder={t('cheques.chequeNumberPlaceholder', 'Enter cheque number')}
                />
                {errors.chequeNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.chequeNumber}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.amount', 'Amount')} *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                    errors.amount
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                  }`}
                  placeholder={t('cheques.amountPlaceholder', 'Enter amount')}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
                )}
              </div>
            </div>

            {/* Cheque Date */}
            <div>
              <label htmlFor="chequeDate" className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('cheques.cheque_date', 'Cheque Date')} *
              </label>
              <input
                type="date"
                id="chequeDate"
                name="chequeDate"
                value={formData.chequeDate}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                  errors.chequeDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                }`}
              />
              {errors.chequeDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.chequeDate}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('cheques.chequeImage', 'Cheque Image')} *
              </label>

              {!imagePreview ? (
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 py-10 transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : errors.chequeImage
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          {isDragActive ? t('cheques.dropImageHere', 'Drop image here') : t('cheques.uploadChequeImage', 'Upload cheque image')}
                        </span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-dark3">
                        {t('cheques.imageUploadHint', 'PNG, JPG, GIF up to 5MB')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 relative">
                  <img
                    src={imagePreview}
                    alt="Cheque preview"
                    className="max-h-48 w-full object-contain rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Delete className="h-4 w-4" />
                  </button>
                </div>
              )}

              {errors.chequeImage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.chequeImage}</p>
              )}
            </div>

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
            {loading ? t('cheques.saving', 'Saving...') : t('cheques.saveCheque', 'Save Cheque')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddChequeModal;
