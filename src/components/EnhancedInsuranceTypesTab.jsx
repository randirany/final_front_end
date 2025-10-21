import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Add,
  Edit,
  Delete,
  Category,
  Visibility,
  MoreVert
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Chip } from '@mui/material';
import Swal from 'sweetalert2';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import EnhancedAddInsuranceTypeModal from './EnhancedAddInsuranceTypeModal';
import EnhancedEditInsuranceTypeModal from './EnhancedEditInsuranceTypeModal';
import ViewInsuranceTypeModal from './ViewInsuranceTypeModal';

const EnhancedInsuranceTypesTab = () => {
  const { t } = useTranslation();
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuInsuranceTypeId, setMenuInsuranceTypeId] = useState(null);

  useEffect(() => {
    fetchInsuranceTypes();
  }, []);

  const fetchInsuranceTypes = async () => {
    try {
      setLoading(true);
      const response = await insuranceTypeApi.getAll();
      setInsuranceTypes(response.insuranceTypes || response.data || []);
    } catch (error) {
      console.error('Error fetching insurance types:', error);
      Swal.fire({
        title: t('insuranceType.error', 'Error'),
        text: t('insuranceType.messages.fetchError', 'Failed to fetch insurance types'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, insuranceTypeId) => {
    setAnchorEl(event.currentTarget);
    setMenuInsuranceTypeId(insuranceTypeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuInsuranceTypeId(null);
  };

  const handleView = (insuranceType) => {
    setSelectedInsuranceType(insuranceType);
    setIsViewModalOpen(true);
    handleMenuClose();
  };

  const handleEdit = (insuranceType) => {
    setSelectedInsuranceType(insuranceType);
    setIsEditModalOpen(true);
    handleMenuClose();
  };

  const handleDelete = async (insuranceTypeId, insuranceTypeName) => {
    handleMenuClose();

    const result = await Swal.fire({
      title: t('common.areYouSure'),
      text: t('insuranceType.deleteConfirmText', `Are you sure you want to delete "${insuranceTypeName}"?`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      try {
        await insuranceTypeApi.delete(insuranceTypeId);
        Swal.fire({
          icon: 'success',
          title: t('common.deleted'),
          text: t('insuranceType.deleteSuccessText', 'Insurance type has been deleted.'),
          timer: 2000
        });
        fetchInsuranceTypes();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: error.response?.data?.message || t('insuranceType.messages.deleteError', 'Failed to delete insurance type')
        });
      }
    }
  };

  const getPricingTypeIcon = (pricingTypeId) => {
    const icons = {
      'compulsory': '🛡️',
      'third_party': '🚗',
      'comprehensive': '💎',
      'road_service': '🛣️',
      'accident_fee_waiver': '📋'
    };
    return icons[pricingTypeId] || '📄';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Category className="text-blue-600 dark:text-blue-400" />
            {t('insuranceType.title', 'Insurance Types')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('insuranceType.subtitle', 'Manage general insurance type categories and their pricing methods')}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Add />
          {t('insuranceType.addButton', 'Add Insurance Type')}
        </button>
      </div>

      {/* Stats Banner */}
      {!loading && insuranceTypes.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Category className="text-white" fontSize="large" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('insuranceType.totalTypes', 'Total Insurance Types')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {insuranceTypes.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('insuranceType.statsDesc', 'Available categories for companies')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Types Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : insuranceTypes.length === 0 ? (
        <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-12 text-center">
          <Category className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('insuranceType.noTypes', 'No Insurance Types')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('insuranceType.addFirstType', 'Create your first insurance type category')}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Add />
            {t('insuranceType.addButton', 'Add Insurance Type')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {insuranceTypes.map((type) => {
            const pricingType = typeof type.pricing_type_id === 'object'
              ? type.pricing_type_id
              : null;

            const pricingTypeId = typeof type.pricing_type_id === 'string'
              ? type.pricing_type_id
              : type.pricing_type_id?._id;

            return (
              <div
                key={type._id}
                className="bg-white dark:bg-navbarBack rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl">
                        {getPricingTypeIcon(pricingTypeId)}
                      </div>
                    </div>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, type._id)}
                      className="text-white hover:bg-white/20"
                      sx={{ color: 'white' }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </div>
                  <h3 className="font-bold text-white text-lg mt-2">
                    {type.name}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Pricing Type Info */}
                  {pricingType && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('insuranceType.labels.pricingType', 'Pricing Type')}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {pricingType.name}
                      </p>
                      {pricingType.requiresPricingTable !== undefined && (
                        <Chip
                          label={pricingType.requiresPricingTable
                            ? t('companyPricing.matrixBased', 'Matrix-based')
                            : t('companyPricing.simplePricing', 'Simple')
                          }
                          size="small"
                          className={`${
                            pricingType.requiresPricingTable
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {type.description && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {type.description}
                      </p>
                    </div>
                  )}

                  {/* Created Date */}
                  {type.createdAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('common.created', 'Created')}: {new Date(type.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-gray-50 dark:bg-dark2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button
                    onClick={() => handleView(type)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white dark:bg-navbarBack border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Visibility fontSize="small" />
                    <span className="text-sm font-medium">{t('common.view', 'View')}</span>
                  </button>
                  <button
                    onClick={() => handleEdit(type)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Edit fontSize="small" />
                    <span className="text-sm font-medium">{t('common.edit', 'Edit')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const type = insuranceTypes.find(t => t._id === menuInsuranceTypeId);
          if (type) handleView(type);
        }}>
          <Visibility fontSize="small" className="mr-2" />
          {t('common.view', 'View')}
        </MenuItem>
        <MenuItem onClick={() => {
          const type = insuranceTypes.find(t => t._id === menuInsuranceTypeId);
          if (type) handleEdit(type);
        }}>
          <Edit fontSize="small" className="mr-2" />
          {t('common.edit', 'Edit')}
        </MenuItem>
        <MenuItem onClick={() => {
          const type = insuranceTypes.find(t => t._id === menuInsuranceTypeId);
          if (type) handleDelete(type._id, type.name);
        }}>
          <Delete fontSize="small" className="mr-2 text-red-600" />
          <span className="text-red-600">{t('common.delete', 'Delete')}</span>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <EnhancedAddInsuranceTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onInsuranceTypeAdded={fetchInsuranceTypes}
      />
      <EnhancedEditInsuranceTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInsuranceType(null);
        }}
        onInsuranceTypeUpdated={fetchInsuranceTypes}
        insuranceType={selectedInsuranceType}
      />
      <ViewInsuranceTypeModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInsuranceType(null);
        }}
        insuranceType={selectedInsuranceType}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EnhancedInsuranceTypesTab;
