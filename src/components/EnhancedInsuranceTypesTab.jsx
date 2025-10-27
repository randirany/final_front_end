import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Add,
  Edit,
  Delete,
  Category,
  Visibility
} from '@mui/icons-material';
import { Chip } from '@mui/material';
import Swal from 'sweetalert2';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import EnhancedAddInsuranceTypeModal from './EnhancedAddInsuranceTypeModal';
import EnhancedEditInsuranceTypeModal from './EnhancedEditInsuranceTypeModal';
import ViewInsuranceTypeModal from './ViewInsuranceTypeModal';
import DataTable from './shared/DataTable';

const EnhancedInsuranceTypesTab = () => {
  const { t } = useTranslation();
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState(null);

  useEffect(() => {
    fetchInsuranceTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleView = (insuranceType) => {
    setSelectedInsuranceType(insuranceType);
    setIsViewModalOpen(true);
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

  // Define columns for DataTable
  const columns = [
    {
      header: t('insuranceType.columns.name', 'Insurance Type'),
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Category className="text-white" sx={{ fontSize: 20 }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{value}</p>
            {row.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.description}</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('insuranceType.labels.pricingType', 'Pricing Type'),
      accessor: 'pricing_type_id',
      render: (value) => {
        const pricingType = typeof value === 'object' ? value : null;
        if (!pricingType) return <span className="text-gray-400 dark:text-gray-500">-</span>;

        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{pricingType.name}</p>
            {pricingType.requiresPricingTable !== undefined && (
              <Chip
                label={pricingType.requiresPricingTable
                  ? t('companyPricing.matrixBased', 'Matrix-based')
                  : t('companyPricing.simplePricing', 'Simple')
                }
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  backgroundColor: pricingType.requiresPricingTable
                    ? 'rgba(147, 51, 234, 0.1)'
                    : 'rgba(107, 114, 128, 0.1)',
                  borderColor: pricingType.requiresPricingTable
                    ? 'rgb(147, 51, 234)'
                    : 'rgb(107, 114, 128)',
                  color: pricingType.requiresPricingTable
                    ? 'rgb(147, 51, 234)'
                    : 'rgb(107, 114, 128)'
                }}
              />
            )}
          </div>
        );
      }
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
            title={t('common.view', 'View')}
          >
            <Visibility sx={{ fontSize: 16 }} />
            {t('common.view', 'View')}
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
            title={t('common.edit', 'Edit')}
          >
            <Edit sx={{ fontSize: 16 }} />
            {t('common.edit', 'Edit')}
          </button>
          <button
            onClick={() => handleDelete(row._id, row.name)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
            title={t('common.delete', 'Delete')}
          >
            <Delete sx={{ fontSize: 16 }} />
            {t('common.delete', 'Delete')}
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('insuranceType.title', 'Insurance Types')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {t('insuranceType.subtitle', 'Manage insurance type categories')}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <Add fontSize="small" />
          {t('insuranceType.addButton', 'Add Type')}
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        data={insuranceTypes}
        columns={columns}
        loading={loading}
        onRefresh={fetchInsuranceTypes}
        enableSearch={true}
        enableExport={true}
        title={t('insuranceType.title', 'Insurance Types')}
      />

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
