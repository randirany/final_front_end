import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createAccidentTicket } from '../services/accidentApi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const AddAccidentModal = ({ isOpen, onClose, onSuccess, preSelectedInsuredId, preSelectedVehicleId }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [insuredList, setInsuredList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [allCustomersData, setAllCustomersData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedVehicleInfo, setSelectedVehicleInfo] = useState(null);

  const [formData, setFormData] = useState({
    insuredId: '',
    vehicleId: '',
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (isOpen) {
      loadInsuredList();
      // Reset form when modal opens
      setFormData({
        insuredId: preSelectedInsuredId || '',
        vehicleId: preSelectedVehicleId || '',
        title: '',
        description: '',
        priority: 'medium'
      });
      setSelectedImages([]);
      setImagePreviews([]);
      setSelectedVehicleInfo(null);
      setVehicleList([]);
    }
  }, [isOpen, preSelectedInsuredId, preSelectedVehicleId]);

  useEffect(() => {
    if (formData.insuredId) {
      loadVehiclesForInsured(formData.insuredId);
    } else {
      setVehicleList([]);
      setSelectedVehicleInfo(null);
      setFormData(prev => ({ ...prev, vehicleId: '' }));
    }
  }, [formData.insuredId]);

  const loadInsuredList = async () => {
    try {
      const token = `islam__${localStorage.getItem('token')}`;
      const response = await axios.get(
        'http://localhost:3002/api/v1/insured/customers-with-active-insurance',
        {
          headers: { token },
          params: {
            limit: 1000 // Get all customers with active insurance
          }
        }
      );

      const customersData = response.data.customers || response.data.data || [];
      setAllCustomersData(customersData);
      setInsuredList(customersData);
    } catch (error) {
      console.error('Error loading insured list:', error);
      toast.error(t('accidents.loadInsuredError', 'Failed to load customers with active insurance'));
    }
  };

  const loadVehiclesForInsured = (insuredId) => {
    // Find the selected customer from the loaded data
    const selectedCustomer = allCustomersData.find(customer => customer._id === insuredId);

    if (selectedCustomer && selectedCustomer.vehicles) {
      // Filter vehicles to only show those with active insurance
      const vehiclesWithActiveInsurance = selectedCustomer.vehicles.filter(
        vehicle => vehicle.insurance && vehicle.insurance.insuranceStatus === 'active'
      );
      setVehicleList(vehiclesWithActiveInsurance);
    } else {
      setVehicleList([]);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedImages.length > 10) {
      toast.error(t('accidents.maxImagesError', 'Maximum 10 images allowed'));
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.insuredId || !formData.vehicleId) {
      toast.error(t('accidents.selectInsuredVehicle', 'Please select insured person and vehicle'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('accidents.descriptionRequired', 'Description is required'));
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title || t('accidents.defaultTitle', 'Vehicle Accident Report'));
      data.append('description', formData.description);
      data.append('priority', formData.priority);

      selectedImages.forEach(image => {
        data.append('image', image);
      });

      const response = await createAccidentTicket(
        formData.insuredId,
        formData.vehicleId,
        data
      );

      toast.success(
        t('accidents.createSuccess', `Ticket created: ${response.accident.ticketNumber}`)
      );

      if (onSuccess) {
        onSuccess(response.accident);
      }

      onClose();
    } catch (error) {
      console.error('Error creating accident:', error);
      toast.error(
        error.response?.data?.message ||
        t('accidents.createError', 'Failed to create accident ticket')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('accidents.createNew', 'Create Accident Ticket')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Insured Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('accidents.selectInsured', 'Select Insured Person')} *
              </label>
              <select
                value={formData.insuredId}
                onChange={(e) => setFormData({ ...formData, insuredId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              >
                <option value="">{t('accidents.chooseInsured', 'Choose insured person...')}</option>
                {insuredList.map((insured) => (
                  <option key={insured._id} value={insured._id}>
                    {insured.first_name} {insured.last_name} - {insured.id_Number}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('accidents.selectVehicle', 'Select Vehicle')} *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => {
                  const vehicleId = e.target.value;
                  setFormData({ ...formData, vehicleId });

                  // Find and set selected vehicle info
                  const vehicle = vehicleList.find(v => v._id === vehicleId);
                  setSelectedVehicleInfo(vehicle || null);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
                required
                disabled={!formData.insuredId}
              >
                <option value="">
                  {!formData.insuredId
                    ? t('accidents.selectCustomerFirst', 'Select customer first...')
                    : vehicleList.length === 0
                    ? t('accidents.noActiveInsurance', 'No vehicles with active insurance')
                    : t('accidents.chooseVehicle', 'Choose vehicle...')
                  }
                </option>
                {vehicleList.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.model} - {vehicle.plateNumber}
                    {vehicle.insurance && ` (${vehicle.insurance.insuranceCompany})`}
                  </option>
                ))}
              </select>
              {formData.insuredId && vehicleList.length === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {t('accidents.noActiveInsuranceMessage', 'This customer has no vehicles with active insurance')}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Insurance Info Display */}
          {selectedVehicleInfo && selectedVehicleInfo.insurance && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                {t('accidents.insuranceInfo', 'Insurance Information')}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('accidents.insuranceCompany', 'Company')}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {selectedVehicleInfo.insurance.insuranceCompany}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('accidents.insuranceType', 'Type')}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {selectedVehicleInfo.insurance.insuranceType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('accidents.validUntil', 'Valid Until')}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {new Date(selectedVehicleInfo.insurance.insuranceEndDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('accidents.status', 'Status')}:
                  </span>
                  <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                    {t('accidents.active', 'Active')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Title and Priority */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('accidents.title', 'Title')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder={t('accidents.titlePlaceholder', 'e.g., Front bumper collision')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('accidents.priority', 'Priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="low">{t('accidents.priorityLow', 'Low')}</option>
                <option value="medium">{t('accidents.priorityMedium', 'Medium')}</option>
                <option value="high">{t('accidents.priorityHigh', 'High')}</option>
                <option value="urgent">{t('accidents.priorityUrgent', 'Urgent')}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('accidents.description', 'Description')} *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
              rows="3"
              placeholder={t('accidents.descriptionPlaceholder', 'Describe the accident in detail...')}
              required
            />
          </div>

          {/* Images Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('accidents.images', 'Images')} ({selectedImages.length}/10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                {t('accidents.uploadImages', 'Upload Images')}
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('accidents.maxImages', 'Max 10 images')}
              </span>
            </div>

            {/* Image Previews - Compact */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {t('accidents.creating', 'Creating...')}
                </>
              ) : (
                t('accidents.createTicket', 'Create Ticket')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccidentModal;
