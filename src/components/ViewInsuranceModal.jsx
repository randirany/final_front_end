import React, { useState, useEffect } from 'react';
import { X, Car, Building2, Calendar, DollarSign, FileText, CreditCard, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { documentSettingsApi } from '../services/documentSettingsApi';

const ViewInsuranceModal = ({ isOpen, onClose, insurance }) => {
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

  if (!isOpen || !insurance) return null;

  const isRTL = language === 'ar' || language === 'he';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
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
        <div className="px-6 py-3 bg-blue-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('customerInfo.insurances.viewTitle', 'Insurance Details')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Vehicle Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('customerInfo.insurances.vehicleInfo', 'Vehicle')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.plateNumber', 'Plate')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.plateNumber || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.model', 'Model')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.model || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Insurance Info */}
          <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('customerInfo.insurances.insuranceInfo', 'Insurance')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.company', 'Company')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.insuranceCompany || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.type', 'Type')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.insuranceType || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.policyNumber', 'Policy')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.policyNumber || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.status', 'Status')}:
                </span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded font-medium ${
                  insurance.insuranceStatus === 'active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {insurance.insuranceStatus || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('customerInfo.insurances.dates', 'Period')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.startDate', 'Start')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.insuranceStartDate ? toLocaleDateStringEN(insurance.insuranceStartDate) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('customerInfo.insurances.endDate', 'End')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {insurance.insuranceEndDate ? toLocaleDateStringEN(insurance.insuranceEndDate) : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('customerInfo.insurances.financialInfo', 'Financial')}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  {t('customerInfo.insurances.totalPrice', 'Total')}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {insurance.totalPrice?.toLocaleString() || '0'} ₪
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  {t('customerInfo.insurances.paidAmount', 'Paid')}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {insurance.paidAmount?.toLocaleString() || '0'} ₪
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  {t('customerInfo.insurances.remainingDebt', 'Remaining')}
                </p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {(insurance.remainingDebt ?? 0).toLocaleString()} ₪
                </p>
              </div>
            </div>
          </div>

          {/* Payments */}
          {insurance.payments?.length > 0 && (
            <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('customerInfo.insurances.payments', 'Payments')} ({insurance.payments.length})
                </h3>
              </div>
              <div className="space-y-2">
                {insurance.payments.map((payment, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {payment.amount?.toLocaleString()} ₪
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {payment.paymentMethod}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      {payment.paymentDate ? toLocaleDateStringEN(payment.paymentDate) : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {insurance.notes && (
            <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('customerInfo.insurances.notes', 'Notes')}
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{insurance.notes}</p>
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
          <div className="px-6 py-4 flex justify-between items-center bg-blue-50 dark:bg-gray-900">
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

export default ViewInsuranceModal;
