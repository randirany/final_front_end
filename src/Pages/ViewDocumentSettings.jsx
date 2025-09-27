import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack, Edit, Print, Download } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';

const ViewDocumentSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [documentSettings, setDocumentSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentSettings();
  }, [id]);

  const fetchDocumentSettings = async () => {
    try {
      const response = await axios.get(`/api/document-settings/${id}`);
      setDocumentSettings(response.data);
    } catch (error) {
      console.error('Error fetching document settings:', error);
      Swal.fire({
        title: t('error'),
        text: t('errorFetchingDocumentSettings'),
        icon: 'error',
        confirmButtonText: t('ok')
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `document-settings-${id}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!documentSettings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('documentSettingsNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none">
        {/* Header Actions - Hidden in print */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/document-settings')}
              className={`flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <ArrowBack className={isRTL ? 'rotate-180' : ''} />
              {t('back')}
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('viewDocumentSettings')}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/document-settings/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Edit />
              {t('edit')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Print />
              {t('print')}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Download />
              {t('download')}
            </button>
          </div>
        </div>

        {/* Document Settings Details */}
        <div className="space-y-8">
          {/* Company Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {t('companyInformation')}
              {documentSettings.isActive && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {t('active')}
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('companyName')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.companyName || t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('companyAddress')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.companyAddress || t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phoneNumber')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.phoneNumber || t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.email || t('notSpecified')}
                </p>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          {documentSettings.logoUrl && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t('companyLogo')}
              </h2>
              <div className="flex justify-center">
                <img
                  src={documentSettings.logoUrl}
                  alt={t('companyLogo')}
                  className="max-w-xs max-h-32 object-contain border rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Header Settings Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('headerSettings')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('headerText')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.headerText || t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('headerFontSize')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.headerFontSize ? `${documentSettings.headerFontSize}px` : t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('headerBackgroundColor')}
                </label>
                <div className="flex items-center gap-3">
                  {documentSettings.headerBackgroundColor && (
                    <div
                      className="w-8 h-8 rounded border shadow-sm"
                      style={{ backgroundColor: documentSettings.headerBackgroundColor }}
                    ></div>
                  )}
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                    {documentSettings.headerBackgroundColor || t('notSpecified')}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('headerTextColor')}
                </label>
                <div className="flex items-center gap-3">
                  {documentSettings.headerTextColor && (
                    <div
                      className="w-8 h-8 rounded border shadow-sm"
                      style={{ backgroundColor: documentSettings.headerTextColor }}
                    ></div>
                  )}
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                    {documentSettings.headerTextColor || t('notSpecified')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Settings Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('footerSettings')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('footerText')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.footerText || t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('footerFontSize')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.footerFontSize ? `${documentSettings.footerFontSize}px` : t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('footerBackgroundColor')}
                </label>
                <div className="flex items-center gap-3">
                  {documentSettings.footerBackgroundColor && (
                    <div
                      className="w-8 h-8 rounded border shadow-sm"
                      style={{ backgroundColor: documentSettings.footerBackgroundColor }}
                    ></div>
                  )}
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                    {documentSettings.footerBackgroundColor || t('notSpecified')}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('footerTextColor')}
                </label>
                <div className="flex items-center gap-3">
                  {documentSettings.footerTextColor && (
                    <div
                      className="w-8 h-8 rounded border shadow-sm"
                      style={{ backgroundColor: documentSettings.footerTextColor }}
                    ></div>
                  )}
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                    {documentSettings.footerTextColor || t('notSpecified')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Margins Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('documentMargins')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('topMargin')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.marginTop ? `${documentSettings.marginTop}mm` : t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bottomMargin')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.marginBottom ? `${documentSettings.marginBottom}mm` : t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('leftMargin')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.marginLeft ? `${documentSettings.marginLeft}mm` : t('notSpecified')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('rightMargin')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.marginRight ? `${documentSettings.marginRight}mm` : t('notSpecified')}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('metadata')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createdAt')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.createdAt ? new Date(documentSettings.createdAt).toLocaleString() : t('notAvailable')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('updatedAt')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.updatedAt ? new Date(documentSettings.updatedAt).toLocaleString() : t('notAvailable')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createdBy')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.createdBy || t('notAvailable')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('updatedBy')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {documentSettings.updatedBy || t('notAvailable')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentSettings;