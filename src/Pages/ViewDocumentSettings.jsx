import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack, Edit, Image, Palette, FormatSize } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { toLocaleDateStringEN } from '../utils/dateFormatter';

const ViewDocumentSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';

  const [documentSettings, setDocumentSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentSettings();
  }, [id]);

  const fetchDocumentSettings = async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      // First try the specific endpoint for single item
      let response;
      try {
        response = await axios.get(`http://localhost:3002/api/v1/documentSettings/${id}`, {
          headers: { token }
        });
      } catch (error) {
        // If that fails, try fetching from the list and find the specific item
        console.log('Single item endpoint failed, trying list endpoint');
        const listResponse = await axios.get('http://localhost:3002/api/v1/documentSettings/', {
          headers: { token }
        });
        const foundItem = listResponse.data.data?.find(item => item._id === id);
        if (foundItem) {
          response = { data: { documentSettings: foundItem } };
        } else {
          throw new Error('Document settings not found');
        }
      }

      // Handle different possible response structures
      let settings = null;
      if (response.data.documentSettings) {
        settings = response.data.documentSettings;
      } else if (response.data.data) {
        settings = response.data.data;
      } else if (response.data) {
        settings = response.data;
      }

      if (settings) {
        setDocumentSettings(settings);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching document settings:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch document settings. Please try again.',
        icon: 'error'
      }).then(() => {
        navigate('/document-settings');
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!documentSettings) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">{t('documentSettings.documentSettingsNotFound')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/document-settings')}
              className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-dark3 dark:hover:bg-dark2 dark:hover:text-white"
            >
              <ArrowBack className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('documentSettings.viewDocumentSettings')}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark3">
                {t('documentSettings.previewSubtitle', { companyName: documentSettings.companyName })}
              </p>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="rounded-lg bg-white shadow dark:bg-navbarBack mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              {t('documentSettings.documentPreview')}
            </h3>

            {/* Document with margins applied */}
            <div
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
              style={{
                marginTop: `${documentSettings.documentTemplate?.marginTop || 20}px`,
                marginBottom: `${documentSettings.documentTemplate?.marginBottom || 20}px`,
                marginLeft: `${documentSettings.documentTemplate?.marginLeft || 20}px`,
                marginRight: `${documentSettings.documentTemplate?.marginRight || 20}px`,
                minHeight: '600px'
              }}
            >
              {/* Header */}
              <div
                className="p-6 border-b border-gray-200 dark:border-gray-600"
                style={{
                  backgroundColor: documentSettings.header?.backgroundColor || '#ffffff',
                  color: documentSettings.header?.textColor || '#000000',
                  fontSize: `${documentSettings.header?.fontSize || 16}px`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {documentSettings.header?.logo?.url && (
                      <div className="mb-4">
                        <img
                          src={documentSettings.header.logo.url}
                          alt="Header Logo"
                          className="max-h-16 w-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {documentSettings.header?.text && (
                      <h1 className="font-bold mb-2">{documentSettings.header.text}</h1>
                    )}

                    {documentSettings.header?.companyName && (
                      <h2 className="text-lg font-semibold mb-2">{documentSettings.header.companyName}</h2>
                    )}

                    <div className="space-y-1 text-sm">
                      {documentSettings.header?.companyAddress && (
                        <p>Address: {documentSettings.header.companyAddress}</p>
                      )}
                      {documentSettings.header?.companyEmail && (
                        <p>Email: {documentSettings.header.companyEmail}</p>
                      )}
                      {documentSettings.header?.companyPhone && (
                        <p>Phone: {documentSettings.header.companyPhone}</p>
                      )}
                      {documentSettings.header?.companyWebsite && (
                        <p>Website: {documentSettings.header.companyWebsite}</p>
                      )}
                    </div>
                  </div>

                  {documentSettings.logo && (
                    <div className="flex-shrink-0 ml-6">
                      <img
                        src={documentSettings.logo}
                        alt="Company Logo"
                        className="max-h-20 w-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1" style={{ minHeight: '400px' }}>
                <div className="text-center text-gray-500 dark:text-gray-400 py-20">
                  <p className="text-lg">{t('documentSettings.documentContentArea')}</p>
                  <p className="text-sm mt-2">{t('documentSettings.contentAreaDescription')}</p>
                  {documentSettings.documentType && (
                    <p className="text-sm mt-1">{t('documentSettings.documentType')}: <span className="font-medium">{documentSettings.documentType}</span></p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="p-6 border-t border-gray-200 dark:border-gray-600"
                style={{
                  backgroundColor: documentSettings.footer?.backgroundColor || '#ffffff',
                  color: documentSettings.footer?.textColor || '#000000',
                  fontSize: `${documentSettings.footer?.fontSize || 12}px`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {documentSettings.footer?.text && (
                      <p className="mb-2">{documentSettings.footer.text}</p>
                    )}

                    {documentSettings.footer?.footerText && (
                      <p className="mb-2">{documentSettings.footer.footerText}</p>
                    )}

                    {documentSettings.footer?.termsAndConditions && (
                      <div className="mt-3">
                        <p className="font-medium mb-1">{t('documentSettings.termsAndConditions')}:</p>
                        <p className="text-xs">{documentSettings.footer.termsAndConditions}</p>
                      </div>
                    )}
                  </div>

                  {documentSettings.footer?.logo?.url && (
                    <div className="flex-shrink-0 ml-6">
                      <img
                        src={documentSettings.footer.logo.url}
                        alt="Footer Logo"
                        className="max-h-12 w-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Details */}
        <div className="rounded-lg bg-white shadow dark:bg-navbarBack">
          <div className="p-6 space-y-8">

            {/* Company Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                <div className="flex items-center">
                  <Image className="mr-2" />
                  {t('documentSettings.companyInformation')}
                </div>
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.companyName')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.companyName || t('documentSettings.notSpecified')}
                  </div>
                </div>

                {documentSettings.documentType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.documentType')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.documentType}
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.status')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      documentSettings.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {documentSettings.isActive ? t('documentSettings.active') : t('documentSettings.inactive')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                <div className="flex items-center">
                  <Palette className="mr-2" />
                  {t('documentSettings.headerSettings')}
                </div>
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {documentSettings.header?.text && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.headerText')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.header.text}
                    </div>
                  </div>
                )}

                {documentSettings.header?.companyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.headerCompanyName')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.header.companyName}
                    </div>
                  </div>
                )}

                {documentSettings.header?.companyAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.companyAddress')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.header.companyAddress}
                    </div>
                  </div>
                )}

                {documentSettings.header?.companyEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.email')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.header.companyEmail}
                    </div>
                  </div>
                )}

                {documentSettings.header?.companyPhone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.phoneNumber')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.header.companyPhone}
                    </div>
                  </div>
                )}

                {documentSettings.header?.companyWebsite && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.companyWebsite')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.header.companyWebsite}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerBackgroundColor')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center">
                    <div
                      className="w-6 h-6 rounded border border-gray-300 mr-3"
                      style={{ backgroundColor: documentSettings.header?.backgroundColor || '#ffffff' }}
                    ></div>
                    {documentSettings.header?.backgroundColor || '#ffffff'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerTextColor')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center">
                    <div
                      className="w-6 h-6 rounded border border-gray-300 mr-3"
                      style={{ backgroundColor: documentSettings.header?.textColor || '#000000' }}
                    ></div>
                    {documentSettings.header?.textColor || '#000000'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerFontSize')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.header?.fontSize || 16}px
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                <div className="flex items-center">
                  <FormatSize className="mr-2" />
                  {t('documentSettings.footerSettings')}
                </div>
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {documentSettings.footer?.text && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.footerText')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.footer.text}
                    </div>
                  </div>
                )}

                {documentSettings.footer?.footerText && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.additionalFooterText')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.footer.footerText}
                    </div>
                  </div>
                )}

                {documentSettings.footer?.termsAndConditions && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.termsAndConditions')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.footer.termsAndConditions}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerBackgroundColor')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center">
                    <div
                      className="w-6 h-6 rounded border border-gray-300 mr-3"
                      style={{ backgroundColor: documentSettings.footer?.backgroundColor || '#ffffff' }}
                    ></div>
                    {documentSettings.footer?.backgroundColor || '#ffffff'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerTextColor')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center">
                    <div
                      className="w-6 h-6 rounded border border-gray-300 mr-3"
                      style={{ backgroundColor: documentSettings.footer?.textColor || '#000000' }}
                    ></div>
                    {documentSettings.footer?.textColor || '#000000'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerFontSize')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.footer?.fontSize || 12}px
                  </div>
                </div>
              </div>
            </div>

            {/* Document Template Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {t('documentSettings.documentMargins')}
              </h3>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.topMargin')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.documentTemplate?.marginTop || 20}mm
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.bottomMargin')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.documentTemplate?.marginBottom || 20}mm
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.leftMargin')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.documentTemplate?.marginLeft || 20}mm
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.rightMargin')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.documentTemplate?.marginRight || 20}mm
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {t('documentSettings.metadata')}
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.createdBy')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {documentSettings.createdBy?.name || documentSettings.createdBy || t('common.unknown')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.createdAt')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {toLocaleDateStringEN(documentSettings.createdAt)}
                  </div>
                </div>

                {documentSettings.updatedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                      {t('documentSettings.updatedBy')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      {documentSettings.updatedBy?.name || documentSettings.updatedBy}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.updatedAt')}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                    {toLocaleDateStringEN(documentSettings.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/document-settings')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-navbarBack dark:text-dark3 dark:hover:bg-dark2"
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/document-settings/edit/${documentSettings._id}`)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-navbarBack"
              >
                {t('common.edit')} {t('documentSettings.settings')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentSettings;