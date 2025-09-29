import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Add, Edit, Delete, Visibility, MoreVert, CheckCircle } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';

const ROWS_PER_PAGE = 10;

const DocumentSettings = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();

  const [documentSettings, setDocumentSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [activeSettings, setActiveSettings] = useState(null);

  const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
  const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));


  useEffect(() => {
    fetchDocumentSettings();
    fetchActiveSettings();
  }, []);

  const fetchDocumentSettings = async () => {
    setLoading(true);
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get('http://localhost:3002/api/v1/documentSettings/', {
        headers: { token }
      });
      setDocumentSettings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching document settings:', error);
      // Fallback sample data for development
      const sampleData = [
        {
          _id: '1',
          companyName: 'شركة التأمين الفلسطينية',
          headerText: 'تقرير الشركة الرسمي',
          headerBgColor: '#2563eb',
          headerTextColor: '#ffffff',
          headerFontSize: 24,
          footerText: 'جميع الحقوق محفوظة © 2024',
          footerBgColor: '#374151',
          footerTextColor: '#ffffff',
          footerFontSize: 12,
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 15,
          marginRight: 15,
          logoUrl: '/assets/logo.png',
          isActive: true,
          createdBy: 'Admin',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          _id: '2',
          companyName: 'شركة التأمين العربي',
          headerText: 'تقرير الأعمال الشهري',
          headerBgColor: '#059669',
          headerTextColor: '#ffffff',
          headerFontSize: 22,
          footerText: 'شركة التأمين العربي - فلسطين',
          footerBgColor: '#1f2937',
          footerTextColor: '#ffffff',
          footerFontSize: 10,
          marginTop: 25,
          marginBottom: 25,
          marginLeft: 20,
          marginRight: 20,
          logoUrl: '/assets/logo2.png',
          isActive: false,
          createdBy: 'Manager',
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-05T09:00:00Z'
        }
      ];
      setDocumentSettings(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSettings = async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get('http://localhost:3002/api/v1/documentSettings/active', {
        headers: { token }
      });
      setActiveSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching active settings:', error);
    }
  };

  const handleEdit = (setting) => {
    navigate(`/document-settings/edit/${setting._id}`);
    handleMenuClose(setting._id);
  };

  const handleView = (setting) => {
    navigate(`/document-settings/view/${setting._id}`);
    handleMenuClose(setting._id);
  };

  const handleActivate = async (settingId, settingName) => {
    handleMenuClose(settingId);
    Swal.fire({
      title: t('documentSettings.activate_confirm', `هل تريد تفعيل إعدادات ${settingName}؟`),
      text: t('documentSettings.activate_confirm_text', "سيتم إلغاء تفعيل الإعدادات الحالية"),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('documentSettings.yes_activate'),
      cancelButtonText: t('common.cancel', 'إلغاء'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = `islam__${localStorage.getItem("token")}`;
          await axios.patch(`http://localhost:3002/api/v1/documentSettings/activate/${settingId}`, {}, {
            headers: { token }
          });
          Swal.fire({
            title: t('documentSettings.activateSuccess'),
            icon: "success"
          });
          fetchDocumentSettings();
          fetchActiveSettings();
        } catch (error) {
          Swal.fire({
            title: t('documentSettings.error'),
            text: error.response?.data?.message || t('documentSettings.activateError'),
            icon: 'error'
          });
        }
      }
    });
  };

  const handleDelete = (settingId, settingName, isActive) => {
    if (isActive) {
      Swal.fire({
        title: t('documentSettings.error'),
        text: t('documentSettings.cannotDeleteActive'),
        icon: 'error'
      });
      return;
    }

    handleMenuClose(settingId);
    Swal.fire({
      title: t('documentSettings.delete_confirm', `هل أنت متأكد من حذف إعدادات ${settingName}؟`),
      text: t('documentSettings.delete_confirm_text', "لا يمكن التراجع عن هذا الإجراء!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('documentSettings.yes_delete'),
      cancelButtonText: t('common.cancel', 'إلغاء'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = `islam__${localStorage.getItem("token")}`;
          await axios.delete(`http://localhost:3002/api/v1/documentSettings/delete/${settingId}`, {
            headers: { token }
          });
          Swal.fire({
            title: t('documentSettings.successDelete'),
            icon: "success"
          });
          fetchDocumentSettings();
        } catch (error) {
          Swal.fire({
            title: t('documentSettings.error'),
            text: error.response?.data?.message || t('documentSettings.deleteError'),
            icon: 'error'
          });
        }
      }
    });
  };



  const getActiveIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <div className="h-5 w-5"></div>
    );
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('documentSettings.firstTitle', 'Dashboard')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('documentSettings.secondeTitle', 'Document Settings')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="contained" size="small" onClick={() => navigate('/document-settings/add')} sx={{ background: '#6C5FFC', color: '#fff' }}>
            {t('documentSettings.add_button', 'Add Settings')}
          </Button>
        </div>
      </div>


      {loading && documentSettings.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : documentSettings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentSettings.map((setting) => (
            <div key={setting._id} className="bg-white dark:bg-navbarBack rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {setting.companyName}
                    </h3>
                    <div className="flex items-center mb-2">
                      {getActiveIcon(setting.isActive)}
                      <span className={`ml-2 text-sm font-medium ${
                        setting.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {setting.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </div>
                    {setting.documentType && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {setting.documentType}
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <IconButton
                      aria-label="Actions"
                      size="small"
                      onClick={(event) => handleMenuOpen(event, setting._id)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu anchorEl={anchorEls[setting._id]} open={Boolean(anchorEls[setting._id])} onClose={() => handleMenuClose(setting._id)}>
                      <MenuItem onClick={() => handleView(setting)}>
                        <Visibility size={16} className="mr-2" /> {t('common.view')}
                      </MenuItem>
                      <MenuItem onClick={() => handleEdit(setting)}>
                        <Edit size={16} className="mr-2" /> {t('common.edit')}
                      </MenuItem>
                      {!setting.isActive && (
                        <MenuItem onClick={() => handleActivate(setting._id, setting.companyName)}>
                          <CheckCircle size={16} className="mr-2" /> {t('documentSettings.activate')}
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={() => handleDelete(setting._id, setting.companyName, setting.isActive)}
                        className="text-red-600 dark:text-red-400"
                        disabled={setting.isActive}
                      >
                        <Delete size={16} className="mr-2" /> {t('common.delete')}
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Logo Display */}
                  {(setting.logo || setting.header?.logo?.url) && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={setting.logo || setting.header?.logo?.url}
                        alt="Company Logo"
                        className="max-h-16 w-auto rounded border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Header Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Header Settings</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {setting.header?.text && (
                        <p><span className="font-medium">Text:</span> {setting.header.text}</p>
                      )}
                      {setting.header?.companyName && (
                        <p><span className="font-medium">Company:</span> {setting.header.companyName}</p>
                      )}
                      {setting.header?.companyEmail && (
                        <p><span className="font-medium">Email:</span> {setting.header.companyEmail}</p>
                      )}
                      {setting.header?.companyPhone && (
                        <p><span className="font-medium">Phone:</span> {setting.header.companyPhone}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Colors:</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: setting.header?.backgroundColor || '#ffffff' }}
                            title="Background Color"
                          ></div>
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: setting.header?.textColor || '#000000' }}
                            title="Text Color"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Footer Settings</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {setting.footer?.text && (
                        <p><span className="font-medium">Text:</span> {setting.footer.text}</p>
                      )}
                      {setting.footer?.footerText && (
                        <p><span className="font-medium">Footer Text:</span> {setting.footer.footerText}</p>
                      )}
                      {setting.footer?.termsAndConditions && (
                        <p><span className="font-medium">Terms:</span> {setting.footer.termsAndConditions.substring(0, 50)}...</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Colors:</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: setting.footer?.backgroundColor || '#ffffff' }}
                            title="Background Color"
                          ></div>
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: setting.footer?.textColor || '#000000' }}
                            title="Text Color"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Template Information */}
                  {setting.documentTemplate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Margins</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          T: {setting.documentTemplate.marginTop}mm,
                          B: {setting.documentTemplate.marginBottom}mm,
                          L: {setting.documentTemplate.marginLeft}mm,
                          R: {setting.documentTemplate.marginRight}mm
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <p><span className="font-medium">Created by:</span> {setting.createdBy?.name || setting.createdBy || 'Unknown'}</p>
                  </div>
                  <div>
                    <p>{new Date(setting.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">{t('documentSettings.no_results', 'No document settings found')}</p>
            <p className="text-sm">Try adjusting your search criteria or create a new document setting.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSettings;