import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close, Download, Print, Edit, Delete } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import { getChequeById, deleteCheque } from '../services/chequeApi';

const ViewChequeModal = ({ open, onClose, onEdit, onDelete, onSuccess, chequeId }) => {
  const { t, i18n: { language } } = useTranslation();

  const [chequeDetails, setChequeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && chequeId) {
      fetchChequeDetails();
    }
  }, [open, chequeId]);

  const fetchChequeDetails = async () => {
    setLoading(true);
    try {
      const response = await getChequeById(chequeId);
      setChequeDetails(response.cheque);
    } catch (error) {
      console.error('Error fetching cheque details:', error);
      Swal.fire({
        title: t('cheques.error', 'Error'),
        text: t('cheques.errorFetchingDetails', 'Error fetching cheque details'),
        icon: 'error'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: t('cheques.delete_confirm', `Are you sure you want to delete cheque ${chequeDetails?.chequeNumber}?`),
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
        onClose();
        if (onSuccess) onSuccess();
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

  const handleEdit = () => {
    onClose();
    if (onEdit) onEdit(chequeId);
  };

  const handlePrint = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow && chequeDetails) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cheque ${chequeDetails.chequeNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin: 20px 0; }
              .detail-row { display: flex; margin: 10px 0; }
              .detail-label { font-weight: bold; width: 150px; }
              .detail-value { flex: 1; }
              img { max-width: 100%; margin: 20px 0; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Cheque Details</h1>
              <p>Cheque Number: ${chequeDetails.chequeNumber}</p>
            </div>
            <div class="details">
              <div class="detail-row">
                <div class="detail-label">Customer:</div>
                <div class="detail-value">${chequeDetails.customer?.name || 'N/A'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Amount:</div>
                <div class="detail-value">${chequeDetails.amount?.toLocaleString()} ₪</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${new Date(chequeDetails.chequeDate).toLocaleDateString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">${chequeDetails.status}</div>
              </div>
              ${chequeDetails.notes ? `
                <div class="detail-row">
                  <div class="detail-label">Notes:</div>
                  <div class="detail-value">${chequeDetails.notes}</div>
                </div>
              ` : ''}
            </div>
            ${chequeDetails.chequeImage ? `
              <div>
                <h3>Cheque Image</h3>
                <img src="${chequeDetails.chequeImage}" alt="Cheque Image" />
              </div>
            ` : ''}
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadImage = () => {
    if (chequeDetails?.chequeImage) {
      const link = document.createElement('a');
      link.href = chequeDetails.chequeImage;
      link.download = `cheque_${chequeDetails.chequeNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'cleared': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'returned': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    const statusLabels = {
      'pending': t('cheques.status.pending', 'Pending'),
      'cleared': t('cheques.status.cleared', 'Cleared'),
      'returned': t('cheques.status.returned', 'Returned'),
      'cancelled': t('cheques.status.cancelled', 'Cancelled')
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status] || statusClasses['pending']}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span>{t('cheques.viewCheque', 'Cheque Details')}</span>
          <div className="flex gap-2">
            <IconButton onClick={handlePrint} size="small" className="dark:text-gray-300">
              <Print />
            </IconButton>
            <IconButton onClick={onClose} size="small" className="dark:text-gray-300">
              <Close />
            </IconButton>
          </div>
        </div>
      </DialogTitle>

      <DialogContent className="dark:bg-navbarBack dark:text-white">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : chequeDetails ? (
          <div className="space-y-6 mt-4">
            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.chequeNumber', 'Cheque Number')}</p>
                  <p className="text-lg font-semibold dark:text-white font-mono">{chequeDetails.chequeNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.customer', 'Customer')}</p>
                  <p className="text-base dark:text-white">{chequeDetails.customer?.name || 'N/A'}</p>
                  {chequeDetails.customer?.phoneNumber && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{chequeDetails.customer.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.amount', 'Amount')}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {chequeDetails.amount?.toLocaleString()} ₪
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.cheque_date', 'Cheque Date')}</p>
                  <p className="text-base dark:text-white">
                    {new Date(chequeDetails.chequeDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.statusHeader', 'Status')}</p>
                  <div className="mt-1">{getStatusBadge(chequeDetails.status)}</div>
                </div>

                {chequeDetails.returnedReason && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.returnedReason', 'Returned Reason')}</p>
                    <p className="text-base text-red-600 dark:text-red-400">{chequeDetails.returnedReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {chequeDetails.notes && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.notes', 'Notes')}</p>
                <p className="text-base dark:text-white mt-1">{chequeDetails.notes}</p>
              </div>
            )}

            {/* Cheque Image */}
            {chequeDetails.chequeImage && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-white">{t('cheques.chequeImage', 'Cheque Image')}</p>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={handleDownloadImage}
                    sx={{ color: '#6C5FFC' }}
                  >
                    {t('common.download', 'Download')}
                  </Button>
                </div>
                <img
                  src={chequeDetails.chequeImage}
                  alt={`Cheque ${chequeDetails.chequeNumber}`}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoZXF1ZSBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
            )}

            {/* Insurance Details */}
            {chequeDetails.insuranceDetails && (
              <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-white mb-3">{t('cheques.insuranceDetails', 'Insurance Details')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {chequeDetails.insuranceDetails.insuranceCompany && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('insurance.company', 'Company')}</p>
                      <p className="dark:text-white">{chequeDetails.insuranceDetails.insuranceCompany}</p>
                    </div>
                  )}
                  {chequeDetails.insuranceDetails.vehiclePlateNumber && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('vehicle.plateNumber', 'Plate Number')}</p>
                      <p className="dark:text-white">{chequeDetails.insuranceDetails.vehiclePlateNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t dark:border-gray-700 pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t('cheques.createdAt', 'Created At')}</p>
                <p className="dark:text-white">{new Date(chequeDetails.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t('cheques.lastUpdated', 'Last Updated')}</p>
                <p className="dark:text-white">{new Date(chequeDetails.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('cheques.notFound', 'Cheque not found')}</p>
          </div>
        )}
      </DialogContent>

      {!loading && chequeDetails && (
        <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
          <Button
            onClick={onClose}
            className="dark:text-gray-300"
          >
            {t('common.close', 'Close')}
          </Button>
          <Button
            startIcon={<Edit />}
            onClick={handleEdit}
            variant="outlined"
            sx={{ borderColor: '#6C5FFC', color: '#6C5FFC' }}
          >
            {t('common.edit', 'Edit')}
          </Button>
          <Button
            startIcon={<Delete />}
            onClick={handleDelete}
            variant="outlined"
            sx={{ borderColor: '#dc2626', color: '#dc2626' }}
          >
            {t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ViewChequeModal;
