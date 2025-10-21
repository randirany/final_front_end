import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close, Add, Edit, Delete, CarRepair } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import { getRoadServicesByCompany, createRoadService, updateRoadService, deleteRoadService } from '../services/roadServiceApi';

const ManageRoadServicesModal = ({ open, onClose, company, onSuccess }) => {
  const { t, i18n: { language } } = useTranslation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    normal_price: '',
    old_car_price: '',
    cutoff_year: 2007,
    description: ''
  });

  useEffect(() => {
    if (open && company) {
      fetchServices();
    }
  }, [open, company]);

  const fetchServices = async () => {
    if (!company) return;

    setLoading(true);
    try {
      const response = await getRoadServicesByCompany(company._id);
      setServices(response.roadServices || response.data || []);
    } catch (error) {
      console.error('Error fetching road services:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      normal_price: '',
      old_car_price: '',
      cutoff_year: 2007,
      description: ''
    });
    setEditingService(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      normal_price: service.normal_price,
      old_car_price: service.old_car_price,
      cutoff_year: service.cutoff_year || 2007,
      description: service.description || ''
    });
  };

  const handleDelete = async (serviceId, serviceName) => {
    const result = await Swal.fire({
      title: t('common.areYouSure'),
      text: t('roadService.deleteConfirm', { name: serviceName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await deleteRoadService(serviceId);
        Swal.fire({
          icon: 'success',
          title: t('common.deleted'),
          text: t('roadService.deleteSuccess'),
          timer: 2000
        });
        fetchServices();
        if (onSuccess) onSuccess();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: error.response?.data?.message || t('roadService.deleteError')
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.service_name || !formData.normal_price || !formData.old_car_price) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: t('roadService.validation.requiredFields', 'Please fill all required fields')
      });
      return;
    }

    setLoading(true);

    try {
      const serviceData = {
        service_name: formData.service_name,
        normal_price: parseFloat(formData.normal_price),
        old_car_price: parseFloat(formData.old_car_price),
        cutoff_year: parseInt(formData.cutoff_year),
        description: formData.description
      };

      if (editingService) {
        await updateRoadService(editingService._id, serviceData);
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: t('roadService.updateSuccess'),
          timer: 2000
        });
      } else {
        await createRoadService(company._id, serviceData);
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: t('roadService.createSuccess'),
          timer: 2000
        });
      }

      resetForm();
      fetchServices();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving road service:', error);
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: error.response?.data?.message || t('roadService.saveError')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!company) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <CarRepair className="text-green-600 dark:text-green-400" />
              <span>{t('roadService.manage', 'Manage Road Services')}</span>
            </div>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
              {company.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="dark:bg-navbarBack dark:text-white">
        <div className="mt-4 space-y-6">
          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingService ? t('roadService.edit', 'Edit Service') : t('roadService.addNew', 'Add New Service')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Name */}
              <div className="md:col-span-2">
                <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t('roadService.labels.serviceName', 'Service Name')} *
                </label>
                <input
                  type="text"
                  id="service_name"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white dark:focus:border-blue-400"
                  placeholder={t('roadService.placeholders.serviceName', 'e.g., Towing Service')}
                />
              </div>

              {/* Normal Price */}
              <div>
                <label htmlFor="normal_price" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t('roadService.labels.normalPrice', 'Normal Price')} (₪) *
                </label>
                <input
                  type="number"
                  id="normal_price"
                  name="normal_price"
                  value={formData.normal_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white dark:focus:border-blue-400"
                  placeholder="300"
                />
              </div>

              {/* Old Car Price */}
              <div>
                <label htmlFor="old_car_price" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t('roadService.labels.oldCarPrice', 'Old Car Price')} (₪) *
                </label>
                <input
                  type="number"
                  id="old_car_price"
                  name="old_car_price"
                  value={formData.old_car_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white dark:focus:border-blue-400"
                  placeholder="450"
                />
              </div>

              {/* Cutoff Year */}
              <div className="md:col-span-2">
                <label htmlFor="cutoff_year" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t('roadService.labels.cutoffYear', 'Cutoff Year')}
                </label>
                <input
                  type="number"
                  id="cutoff_year"
                  name="cutoff_year"
                  value={formData.cutoff_year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white dark:focus:border-blue-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('roadService.hints.cutoffYear', 'Vehicles before this year will use the old car price')}
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  {t('roadService.labels.description', 'Description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-navbarBack dark:text-white dark:focus:border-blue-400"
                  placeholder={t('roadService.placeholders.description', 'Service description...')}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
                startIcon={editingService ? <Edit /> : <Add />}
              >
                {editingService ? t('common.update', 'Update') : t('common.add', 'Add')}
              </Button>
              {editingService && (
                <Button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="dark:text-gray-300"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              )}
            </div>
          </form>

          {/* Services List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('roadService.existingServices', 'Existing Services')} ({services.length})
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CarRepair className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>{t('roadService.noServices', 'No road services configured yet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service._id}
                    className="bg-white dark:bg-navbarBack rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {service.service_name}
                        </h4>
                        {service.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            💰 {t('roadService.labels.normalPrice')}: <strong>{service.normal_price} ₪</strong>
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            🚗 {t('roadService.labels.oldCarPrice')}: <strong>{service.old_car_price} ₪</strong>
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            📅 {t('roadService.labels.cutoffYear')}: <strong>{service.cutoff_year}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 dark:text-blue-400"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(service._id, service.service_name)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
        >
          {t('common.done', 'Done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageRoadServicesModal;
