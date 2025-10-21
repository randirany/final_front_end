import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Add, Edit, Delete, Category } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import AddInsuranceTypeModal from './AddInsuranceTypeModal';
import EditInsuranceTypeModal from './EditInsuranceTypeModal';

const InsuranceTypesTab = () => {
  const { t } = useTranslation();
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState(null);

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

  const handleEdit = (insuranceType) => {
    setSelectedInsuranceType(insuranceType);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (insuranceTypeId, insuranceTypeName) => {
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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('insuranceType.title', 'Insurance Types')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('insuranceType.subtitle', 'Manage general insurance type categories')}
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
          {insuranceTypes.map((type) => (
            <div
              key={type._id}
              className="bg-white dark:bg-navbarBack rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Category className="text-blue-600 dark:text-blue-400" fontSize="small" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {type.name}
                    </h3>
                    {type.pricing_type_id && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {typeof type.pricing_type_id === 'object' ? type.pricing_type_id.name : type.pricing_type_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {type.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {type.description}
                </p>
              )}

              {type.pricing_type_id && typeof type.pricing_type_id === 'object' && (
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    type.pricing_type_id.requiresPricingTable
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {type.pricing_type_id.requiresPricingTable ? 'Matrix-based Pricing' : 'Simple Pricing'}
                  </span>
                </div>
              )}

              {type.createdAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {t('common.created', 'Created')}: {new Date(type.createdAt).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(type)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200"
                >
                  <Edit fontSize="small" />
                  <span className="text-sm font-medium">{t('common.edit', 'Edit')}</span>
                </button>
                <button
                  onClick={() => handleDelete(type._id, type.name)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200"
                >
                  <Delete fontSize="small" />
                  <span className="text-sm font-medium">{t('common.delete', 'Delete')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddInsuranceTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onInsuranceTypeAdded={fetchInsuranceTypes}
      />
      <EditInsuranceTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInsuranceType(null);
        }}
        onInsuranceTypeUpdated={fetchInsuranceTypes}
        insuranceType={selectedInsuranceType}
      />
    </div>
  );
};

export default InsuranceTypesTab;
