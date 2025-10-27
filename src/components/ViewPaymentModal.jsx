import React, { useState, useEffect } from 'react';
import { X, CreditCard, Car, Calendar, DollarSign, FileText, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { documentSettingsApi } from '../services/documentSettingsApi';

const ViewPaymentModal = ({ isOpen, onClose, payment }) => {
  const { t, i18n: { language } } = useTranslation();
  const [documentSettings, setDocumentSettings] = useState(null);

  useEffect(() => {
    const fetchDocumentSettings = async () => {
      if (isOpen) {
        try {
          const response = await documentSettingsApi.getActive();
          setDocumentSettings(response.data);
        } catch (error) {
          console.error('Error fetching document settings:', error);
        }
      }
    };
    fetchDocumentSettings();
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  const isRTL = language === 'ar' || language === 'he';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with Company Branding */}
        {documentSettings && (
          <div
            className="px-6 py-4 flex items-center justify-between border-b"
            style={{
              backgroundColor: documentSettings.header?.backgroundColor || '#ffffff',
              color: documentSettings.header?.textColor || '#000000'
            }}
          >
            {documentSettings.logo && (
              <img
                src={documentSettings.logo}
                alt={documentSettings.companyName}
                className="h-12 w-auto object-contain"
              />
            )}
            <div className="flex-1 text-center">
              <h1
                className="font-bold"
                style={{ fontSize: `${documentSettings.header?.fontSize || 20}px` }}
              >
                {documentSettings.companyName}
              </h1>
              {documentSettings.header?.text && (
                <p className="text-sm mt-1">{documentSettings.header.text}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100/20 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Title */}
        <div className="px-6 py-3 bg-green-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('customerInfo.payments.viewTitle', 'Payment Receipt')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Payment Amount */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('customerInfo.payments.totalAmount', 'Payment Amount')}
            </p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              {payment.amount?.toLocaleString() || '0'} ₪
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('customerInfo.payments.paymentInfo', 'Payment')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.payments.method', 'Method')}:
                </span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {payment.paymentMethod || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.payments.date', 'Date')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {payment.paymentDate ? toLocaleDateStringEN(payment.paymentDate) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.payments.paidBy', 'Recorded By')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {payment.recordedBy || '-'}
                </span>
              </div>
              {payment.paymentId && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="ml-2 font-medium font-mono text-xs text-gray-900 dark:text-white">
                    {payment.paymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle & Insurance */}
          {(payment.plateNumber || payment.insuranceCompany || payment.insuranceType) && (
            <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('customerInfo.payments.vehicleInfo', 'Vehicle & Insurance')}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {payment.plateNumber && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('customerInfo.payments.plate', 'Plate')}:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {payment.plateNumber}
                    </span>
                  </div>
                )}
                {payment.insuranceCompany && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('customerInfo.payments.company', 'Company')}:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {payment.insuranceCompany}
                    </span>
                  </div>
                )}
                {payment.insuranceType && (
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('customerInfo.payments.type', 'Type')}:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {payment.insuranceType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cheque Details */}
          {payment.paymentMethod === 'cheque' && (payment.chequeNumber || payment.chequeDate) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('customerInfo.payments.chequeDetails', 'Cheque Details')}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {payment.chequeNumber && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('customerInfo.payments.chequeNumber', 'Number')}:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {payment.chequeNumber}
                    </span>
                  </div>
                )}
                {payment.chequeDate && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('customerInfo.payments.chequeDate', 'Date')}:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {toLocaleDateStringEN(payment.chequeDate)}
                    </span>
                  </div>
                )}
                {payment.chequeStatus && (
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('customerInfo.payments.chequeStatus', 'Status')}:
                    </span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded font-medium ${
                      payment.chequeStatus === 'cleared'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : payment.chequeStatus === 'bounced'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {payment.chequeStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('customerInfo.payments.notes', 'Notes')}
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{payment.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t">
          {documentSettings?.footer?.text && (
            <div
              className="px-6 py-3 text-center border-b"
              style={{
                backgroundColor: documentSettings.footer.backgroundColor || '#ffffff',
                color: documentSettings.footer.textColor || '#000000',
                fontSize: `${documentSettings.footer.fontSize || 12}px`
              }}
            >
              {documentSettings.footer.text}
            </div>
          )}
          <div className="px-6 py-4 flex justify-between items-center bg-green-50 dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {toLocaleDateStringEN(new Date())}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 print:hidden"
              >
                <Printer className="w-4 h-4" />
                {t('common.print', 'Print')}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium print:hidden"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPaymentModal;
