import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, CloudUpload, Delete } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Swal from 'sweetalert2';

const EditCheque = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    chequeNumber: '',
    customerId: '',
    cheque_date: '',
    status: 'Pending',
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchChequeDetails();
  }, [id]);

  const fetchCustomers = async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const res = await axios.get(`http://localhost:3002/api/v1/insured/allInsured`, {
        headers: { token }
      });
      const formattedCustomers = res.data.insuredList.map(item => ({
        id: item._id,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        email: item.email || '',
        phone: item.phone_number || ''
      }));
      setCustomers(formattedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      // Sample customers data as fallback
      const sampleCustomers = [
        { id: 1, name: 'أحمد محمد علي', email: 'ahmed@example.com' },
        { id: 2, name: 'سارة أحمد', email: 'sara@example.com' },
        { id: 3, name: 'محمد حسن', email: 'mohamed@example.com' },
        { id: 4, name: 'فاطمة خالد', email: 'fatima@example.com' }
      ];
      setCustomers(sampleCustomers);
    }
  };

  const fetchChequeDetails = async () => {
    setPageLoading(true);
    try {
      // For now using sample data - replace with actual API call
      const sampleCheque = {
        id: id,
        chequeNumber: 'CHK001',
        customerId: '1',
        cheque_date: '2024-01-15',
        status: 'Pending',
        notes: 'شيك لدفعة أولى',
        image: '/assets/cheque1.jpg'
      };

      setFormData({
        chequeNumber: sampleCheque.chequeNumber,
        customerId: sampleCheque.customerId,
        cheque_date: sampleCheque.cheque_date,
        status: sampleCheque.status,
        notes: sampleCheque.notes || ''
      });

      setCurrentImage(sampleCheque.image);
      setImagePreview(sampleCheque.image);
    } catch (error) {
      console.error('Error fetching cheque details:', error);
      Swal.fire({
        title: t('cheques.error'),
        text: t('cheques.errorFetchingDetails'),
        icon: 'error'
      }).then(() => {
        navigate('/cheques');
      });
    } finally {
      setPageLoading(false);
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

      // Clear error when new image is uploaded
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  }, [errors.image]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.chequeNumber.trim()) {
      newErrors.chequeNumber = t('cheques.validation.chequeNumberRequired');
    }

    if (!formData.customerId) {
      newErrors.customerId = t('cheques.validation.customerRequired');
    }

    if (!formData.cheque_date) {
      newErrors.cheque_date = t('cheques.validation.chequeDateRequired');
    }

    if (!formData.status) {
      newErrors.status = t('cheques.validation.statusRequired');
    }

    if (!imagePreview && !currentImage) {
      newErrors.image = t('cheques.validation.imageRequired');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const chequeData = {
        ...formData,
        image: uploadedImage || currentImage
      };

      console.log('Updated cheque data:', chequeData);
      console.log('Selected customer:', customers.find(c => c.id == formData.customerId));

      Swal.fire({
        title: t('cheques.updateSuccess'),
        text: t('cheques.chequeUpdatedSuccessfully'),
        icon: 'success'
      }).then(() => {
        navigate('/cheques');
      });
    } catch (error) {
      console.error('Error updating cheque:', error);
      Swal.fire({
        title: t('cheques.error'),
        text: t('cheques.errorUpdatingCheque'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(currentImage);
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const removeCurrentImage = () => {
    setCurrentImage(null);
    setImagePreview(null);
    setUploadedImage(null);
  };

  if (pageLoading) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/cheques')}
              className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-dark3 dark:hover:bg-dark2 dark:hover:text-white"
            >
              <ArrowBack className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('cheques.editCheque')}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark3">
                {t('cheques.editChequeSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white shadow dark:bg-navbarBack">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Cheque Number */}
              <div>
                <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.chequeNumber')} *
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
                  placeholder={t('cheques.chequeNumberPlaceholder')}
                />
                {errors.chequeNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.chequeNumber}</p>
                )}
              </div>

              {/* Customer Selection */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.customer')} *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                    errors.customerId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                  }`}
                >
                  <option value="">{t('cheques.selectCustomer')}</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerId}</p>
                )}
              </div>

              {/* Cheque Date */}
              <div>
                <label htmlFor="cheque_date" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.cheque_date')} *
                </label>
                <input
                  type="date"
                  id="cheque_date"
                  name="cheque_date"
                  value={formData.cheque_date}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                    errors.cheque_date
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                  }`}
                />
                {errors.cheque_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cheque_date}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-white">
                  {t('cheques.status')} *
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
                  <option value="Pending">{t('cheques.status.pending')}</option>
                  <option value="Cleared">{t('cheques.status.cleared')}</option>
                  <option value="Bounced">{t('cheques.status.bounced')}</option>
                  <option value="Cancelled">{t('cheques.status.cancelled')}</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('cheques.chequeImage')} *
              </label>

              {!imagePreview ? (
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 py-10 transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : errors.image
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          {isDragActive ? t('cheques.dropImageHere') : t('cheques.uploadChequeImage')}
                        </span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-dark3">
                        {t('cheques.imageUploadHint')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cheque preview"
                      className="max-h-64 w-full object-contain rounded-md border border-gray-300 dark:border-gray-600"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {uploadedImage && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="rounded-full bg-yellow-500 p-1 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                          title={t('cheques.revertToOriginal')}
                        >
                          <ArrowBack className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={uploadedImage ? removeImage : removeCurrentImage}
                        className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title={t('common.remove')}
                      >
                        <Delete className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    {...getRootProps()}
                    className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-4 transition-colors hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                  >
                    <div className="text-center">
                      <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('cheques.replaceImage')}
                          </span>
                          <input {...getInputProps()} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.image && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-white">
                {t('cheques.notes')}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-dark2 dark:text-white dark:focus:border-blue-400"
                placeholder={t('cheques.notesPlaceholder')}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/cheques')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-navbarBack dark:text-dark3 dark:hover:bg-dark2"
              >
                {t('cheques.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-navbarBack"
              >
                {loading ? t('cheques.updating') : t('cheques.updateCheque')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCheque;