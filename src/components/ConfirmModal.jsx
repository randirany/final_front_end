// src/components/ConfirmModal.jsx

import { useTranslation } from "react-i18next";
import { X, AlertTriangle } from "lucide-react";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isConfirming = false, // حالة للتحميل أثناء تنفيذ عملية الحذف
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    // الخلفية المعتمة
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* صندوق المودال نفسه */}
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-navbarBack flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس المودال */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title || t("confirmModal.defaultTitle", "تأكيد الإجراء")}
          </h3>
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم المودال */}
        <div className="p-6 flex items-start space-x-4 rtl:space-x-reverse">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message || t("confirmModal.defaultMessage", "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.")}
            </p>
          </div>
        </div>

        {/* ذيل المودال (الأزرار) */}
        <div className="flex flex-row-reverse gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:bg-red-400 flex items-center justify-center w-28"
          >
            {isConfirming ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              t("confirmModal.confirmDelete", "نعم, احذف")
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {t("common.cancel", "إلغاء")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;