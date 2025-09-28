import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Edit, Delete, Print, Download } from '@mui/icons-material';
import { Button } from '@mui/material';
import Swal from 'sweetalert2';

const ViewCheque = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [cheque, setCheque] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChequeDetails();
  }, [id]);

  const fetchChequeDetails = async () => {
    setLoading(true);
    try {
      // For now using sample data - replace with actual API call
      const sampleCheque = {
        id: id,
        chequeNumber: 'CHK001',
        customerName: 'أحمد محمد علي',
        customerId: '1',
        cheque_date: '2024-01-15',
        status: 'Pending',
        notes: 'شيك لدفعة أولى',
        image: '/assets/cheque1.jpg',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      };

      const sampleCustomer = {
        id: '1',
        name: 'أحمد محمد علي',
        email: 'ahmed@example.com',
        phone: '+970591234567',
        address: 'غزة، فلسطين'
      };

      setCheque(sampleCheque);
      setCustomer(sampleCustomer);
    } catch (error) {
      console.error('Error fetching cheque details:', error);
      Swal.fire({
        title: t('cheques.error'),
        text: t('cheques.errorFetchingDetails'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/cheques/edit/${id}`);
  };

  const handleDelete = () => {
    Swal.fire({
      title: t('cheques.delete_confirm', `هل أنت متأكد من حذف الشيك رقم ${cheque.chequeNumber}؟`),
      text: t('cheques.delete_confirm_text', "لا يمكن التراجع عن هذا الإجراء!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('cheques.yes_delete'),
      cancelButtonText: t('common.cancel', 'إلغاء'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Delete logic here - replace with actual API call
        Swal.fire({
          title: t('cheques.successDelete'),
          icon: "success"
        }).then(() => {
          navigate('/cheques');
        });
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Cleared': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Bounced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status] || statusClasses['Pending']}`}>
        {t(`cheques.status.${status.toLowerCase()}`)}
      </span>
    );
  };

  if (loading) {
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

  if (!cheque) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('cheques.notFound')}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('cheques.chequeNotFoundDescription')}
            </p>
            <Button
              variant="contained"
              onClick={() => navigate('/cheques')}
              sx={{ mt: 2, background: '#6C5FFC', color: '#fff' }}
            >
              {t('cheques.backToList')}
            </Button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/cheques')}
                className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-dark3 dark:hover:bg-dark2 dark:hover:text-white"
              >
                <ArrowBack className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('cheques.viewCheque')} - {cheque.chequeNumber}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark3">
                  {t('cheques.viewChequeSubtitle')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
                className="no-print"
                sx={{ borderColor: '#6C5FFC', color: '#6C5FFC' }}
              >
                {t('common.print')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                className="no-print"
                sx={{ borderColor: '#6C5FFC', color: '#6C5FFC' }}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={handleDelete}
                className="no-print"
                sx={{ borderColor: '#dc2626', color: '#dc2626' }}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>

        {/* Cheque Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('cheques.chequeDetails')}
                </h3>
              </div>

              <div className="px-6 py-6">
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('cheques.chequeNumber')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                      {cheque.chequeNumber}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('cheques.status')}
                    </dt>
                    <dd className="mt-1">
                      {getStatusBadge(cheque.status)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('cheques.cheque_date')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(cheque.cheque_date).toLocaleDateString((language === 'ar' || language === 'he') ? 'ar-EG' : 'en-US')}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('cheques.customer')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {cheque.customerName}
                    </dd>
                  </div>

                  {cheque.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('cheques.notes')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {cheque.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Customer Details */}
            {customer && (
              <div className="mt-6 bg-white dark:bg-navbarBack rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('cheques.customerDetails')}
                  </h3>
                </div>

                <div className="px-6 py-6">
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('customers.table.name')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {customer.name}
                      </dd>
                    </div>

                    {customer.email && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('customers.table.email')}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {customer.email}
                        </dd>
                      </div>
                    )}

                    {customer.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('customers.table.mobile')}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {customer.phone}
                        </dd>
                      </div>
                    )}

                    {customer.address && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('customers.table.address')}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {customer.address}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Cheque Image */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('cheques.chequeImage')}
                </h3>
              </div>

              <div className="px-6 py-6">
                {cheque.image ? (
                  <div className="space-y-4">
                    <img
                      src={cheque.image}
                      alt={`Cheque ${cheque.chequeNumber}`}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoZXF1ZSBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      fullWidth
                      className="no-print"
                      sx={{ borderColor: '#6C5FFC', color: '#6C5FFC' }}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = cheque.image;
                        link.download = `cheque_${cheque.chequeNumber}.jpg`;
                        link.click();
                      }}
                    >
                      {t('common.download')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <div className="text-4xl mb-2">📄</div>
                    <p>{t('cheques.noImageAvailable')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-6 bg-white dark:bg-navbarBack rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('cheques.metadata')}
                </h3>
              </div>

              <div className="px-6 py-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('cheques.createdAt')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(cheque.createdAt).toLocaleDateString((language === 'ar' || language === 'he') ? 'ar-EG' : 'en-US')}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('cheques.lastUpdated')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(cheque.updatedAt).toLocaleDateString((language === 'ar' || language === 'he') ? 'ar-EG' : 'en-US')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewCheque;