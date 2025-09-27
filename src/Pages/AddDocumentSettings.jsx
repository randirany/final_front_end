import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, CloudUpload, Delete, Palette, FormatSize, Image } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ChromePicker } from 'react-color';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddDocumentSettings = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    headerText: '',
    headerBgColor: '#2563eb',
    headerTextColor: '#ffffff',
    headerFontSize: 24,
    footerText: '',
    footerBgColor: '#374151',
    footerTextColor: '#ffffff',
    footerFontSize: 12,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 15,
    marginRight: 15
  });

  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showColorPickers, setShowColorPickers] = useState({
    headerBg: false,
    headerText: false,
    footerBg: false,
    footerText: false
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedLogo(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error when new logo is uploaded
      if (errors.logo) {
        setErrors(prev => ({
          ...prev,
          logo: ''
        }));
      }
    }
  }, [errors.logo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
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

  const handleColorChange = (color, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: color.hex
    }));
  };

  const toggleColorPicker = (picker) => {
    setShowColorPickers(prev => ({
      ...prev,
      [picker]: !prev[picker]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = t('documentSettings.validation.companyNameRequired');
    }

    if (!formData.headerText.trim()) {
      newErrors.headerText = t('documentSettings.validation.headerTextRequired');
    }

    if (!formData.footerText.trim()) {
      newErrors.footerText = t('documentSettings.validation.footerTextRequired');
    }

    if (formData.headerFontSize < 8 || formData.headerFontSize > 72) {
      newErrors.headerFontSize = t('documentSettings.validation.headerFontSizeRange');
    }

    if (formData.footerFontSize < 6 || formData.footerFontSize > 48) {
      newErrors.footerFontSize = t('documentSettings.validation.footerFontSizeRange');
    }

    if (formData.marginTop < 0 || formData.marginTop > 100) {
      newErrors.marginTop = t('documentSettings.validation.marginRange');
    }

    if (formData.marginBottom < 0 || formData.marginBottom > 100) {
      newErrors.marginBottom = t('documentSettings.validation.marginRange');
    }

    if (formData.marginLeft < 0 || formData.marginLeft > 100) {
      newErrors.marginLeft = t('documentSettings.validation.marginRange');
    }

    if (formData.marginRight < 0 || formData.marginRight > 100) {
      newErrors.marginRight = t('documentSettings.validation.marginRange');
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
      const token = `islam__${localStorage.getItem("token")}`;

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append logo file if selected
      if (uploadedLogo) {
        formDataToSend.append('logo', uploadedLogo);
      }

      const response = await axios.post('http://localhost:3002/api/v1/documentSettings/create', formDataToSend, {
        headers: {
          token,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Document settings created:', response.data);

      Swal.fire({
        title: t('documentSettings.createSuccess'),
        text: t('documentSettings.settingsCreatedSuccessfully'),
        icon: 'success'
      }).then(() => {
        navigate('/document-settings');
      });
    } catch (error) {
      console.error('Error creating document settings:', error);
      Swal.fire({
        title: t('documentSettings.error'),
        text: error.response?.data?.message || t('documentSettings.errorCreatingSettings'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeLogo = () => {
    setUploadedLogo(null);
    setLogoPreview(null);
    if (errors.logo) {
      setErrors(prev => ({
        ...prev,
        logo: ''
      }));
    }
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
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
                {t('documentSettings.addSettings')}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark3">
                {t('documentSettings.addSettingsSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white shadow dark:bg-navbarBack">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* Company Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                <div className="flex items-center">
                  <Image className="mr-2" />
                  {t('documentSettings.companyInformation')}
                </div>
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Company Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.companyName')} *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.companyName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                    placeholder={t('documentSettings.companyNamePlaceholder')}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
                  )}
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
                {/* Header Text */}
                <div className="sm:col-span-2">
                  <label htmlFor="headerText" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerText')} *
                  </label>
                  <input
                    type="text"
                    id="headerText"
                    name="headerText"
                    value={formData.headerText}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.headerText
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                    placeholder={t('documentSettings.headerTextPlaceholder')}
                  />
                  {errors.headerText && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.headerText}</p>
                  )}
                </div>

                {/* Header Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerBgColor')}
                  </label>
                  <div className="mt-1 relative">
                    <button
                      type="button"
                      onClick={() => toggleColorPicker('headerBg')}
                      className="flex items-center w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-dark2 dark:hover:bg-gray-600"
                    >
                      <div
                        className="w-6 h-6 rounded border border-gray-300 mr-3"
                        style={{ backgroundColor: formData.headerBgColor }}
                      ></div>
                      {formData.headerBgColor}
                    </button>
                    {showColorPickers.headerBg && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => toggleColorPicker('headerBg')}
                        />
                        <ChromePicker
                          color={formData.headerBgColor}
                          onChange={(color) => handleColorChange(color, 'headerBgColor')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Header Text Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerTextColor')}
                  </label>
                  <div className="mt-1 relative">
                    <button
                      type="button"
                      onClick={() => toggleColorPicker('headerText')}
                      className="flex items-center w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-dark2 dark:hover:bg-gray-600"
                    >
                      <div
                        className="w-6 h-6 rounded border border-gray-300 mr-3"
                        style={{ backgroundColor: formData.headerTextColor }}
                      ></div>
                      {formData.headerTextColor}
                    </button>
                    {showColorPickers.headerText && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => toggleColorPicker('headerText')}
                        />
                        <ChromePicker
                          color={formData.headerTextColor}
                          onChange={(color) => handleColorChange(color, 'headerTextColor')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Header Font Size */}
                <div>
                  <label htmlFor="headerFontSize" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.headerFontSize')} (8-72px)
                  </label>
                  <input
                    type="number"
                    id="headerFontSize"
                    name="headerFontSize"
                    min="8"
                    max="72"
                    value={formData.headerFontSize}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.headerFontSize
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                  />
                  {errors.headerFontSize && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.headerFontSize}</p>
                  )}
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
                {/* Footer Text */}
                <div className="sm:col-span-2">
                  <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerText')} *
                  </label>
                  <input
                    type="text"
                    id="footerText"
                    name="footerText"
                    value={formData.footerText}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.footerText
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                    placeholder={t('documentSettings.footerTextPlaceholder')}
                  />
                  {errors.footerText && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.footerText}</p>
                  )}
                </div>

                {/* Footer Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerBgColor')}
                  </label>
                  <div className="mt-1 relative">
                    <button
                      type="button"
                      onClick={() => toggleColorPicker('footerBg')}
                      className="flex items-center w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-dark2 dark:hover:bg-gray-600"
                    >
                      <div
                        className="w-6 h-6 rounded border border-gray-300 mr-3"
                        style={{ backgroundColor: formData.footerBgColor }}
                      ></div>
                      {formData.footerBgColor}
                    </button>
                    {showColorPickers.footerBg && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => toggleColorPicker('footerBg')}
                        />
                        <ChromePicker
                          color={formData.footerBgColor}
                          onChange={(color) => handleColorChange(color, 'footerBgColor')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Text Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerTextColor')}
                  </label>
                  <div className="mt-1 relative">
                    <button
                      type="button"
                      onClick={() => toggleColorPicker('footerText')}
                      className="flex items-center w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-dark2 dark:hover:bg-gray-600"
                    >
                      <div
                        className="w-6 h-6 rounded border border-gray-300 mr-3"
                        style={{ backgroundColor: formData.footerTextColor }}
                      ></div>
                      {formData.footerTextColor}
                    </button>
                    {showColorPickers.footerText && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => toggleColorPicker('footerText')}
                        />
                        <ChromePicker
                          color={formData.footerTextColor}
                          onChange={(color) => handleColorChange(color, 'footerTextColor')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Font Size */}
                <div>
                  <label htmlFor="footerFontSize" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.footerFontSize')} (6-48px)
                  </label>
                  <input
                    type="number"
                    id="footerFontSize"
                    name="footerFontSize"
                    min="6"
                    max="48"
                    value={formData.footerFontSize}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.footerFontSize
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                  />
                  {errors.footerFontSize && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.footerFontSize}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Margins Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {t('documentSettings.marginsSettings')}
              </h3>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {/* Margin Top */}
                <div>
                  <label htmlFor="marginTop" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.marginTop')} (mm)
                  </label>
                  <input
                    type="number"
                    id="marginTop"
                    name="marginTop"
                    min="0"
                    max="100"
                    value={formData.marginTop}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.marginTop
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                  />
                  {errors.marginTop && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.marginTop}</p>
                  )}
                </div>

                {/* Margin Bottom */}
                <div>
                  <label htmlFor="marginBottom" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.marginBottom')} (mm)
                  </label>
                  <input
                    type="number"
                    id="marginBottom"
                    name="marginBottom"
                    min="0"
                    max="100"
                    value={formData.marginBottom}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.marginBottom
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                  />
                  {errors.marginBottom && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.marginBottom}</p>
                  )}
                </div>

                {/* Margin Left */}
                <div>
                  <label htmlFor="marginLeft" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.marginLeft')} (mm)
                  </label>
                  <input
                    type="number"
                    id="marginLeft"
                    name="marginLeft"
                    min="0"
                    max="100"
                    value={formData.marginLeft}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.marginLeft
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                  />
                  {errors.marginLeft && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.marginLeft}</p>
                  )}
                </div>

                {/* Margin Right */}
                <div>
                  <label htmlFor="marginRight" className="block text-sm font-medium text-gray-700 dark:text-white">
                    {t('documentSettings.marginRight')} (mm)
                  </label>
                  <input
                    type="number"
                    id="marginRight"
                    name="marginRight"
                    min="0"
                    max="100"
                    value={formData.marginRight}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-dark2 dark:text-white ${
                      errors.marginRight
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400'
                    }`}
                  />
                  {errors.marginRight && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.marginRight}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {t('documentSettings.logoUpload')}
              </h3>

              {!logoPreview ? (
                <div
                  {...getRootProps()}
                  className={`flex justify-center rounded-md border-2 border-dashed px-6 py-10 transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : errors.logo
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          {isDragActive ? t('documentSettings.dropLogoHere') : t('documentSettings.uploadLogo')}
                        </span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-dark3">
                        {t('documentSettings.logoUploadHint')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 w-auto mx-auto rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Delete className="h-4 w-4" />
                  </button>
                </div>
              )}

              {errors.logo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/document-settings')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-navbarBack dark:text-dark3 dark:hover:bg-dark2"
              >
                {t('documentSettings.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-navbarBack"
              >
                {loading ? t('documentSettings.creating') : t('documentSettings.createSettings')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentSettings;