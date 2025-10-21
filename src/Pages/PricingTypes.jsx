import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Refresh, CheckCircle, Category } from '@mui/icons-material';
import Swal from 'sweetalert2';
import DataTable from '../components/shared/DataTable';
import { getAllPricingTypes, initializePricingTypes } from '../services/pricingTypeApi';

const PricingTypes = () => {
  const { t } = useTranslation();
  const [pricingTypes, setPricingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchPricingTypes();
  }, []);

  const fetchPricingTypes = async () => {
    setLoading(true);
    try {
      const response = await getAllPricingTypes();
      setPricingTypes(response.pricingTypes || []);
    } catch (error) {
      console.error('Error fetching pricing types:', error);
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: t('pricingTypes.fetchError', 'Failed to fetch pricing types')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    const result = await Swal.fire({
      title: t('pricingTypes.initializeConfirm', 'Initialize Pricing Types?'),
      text: t('pricingTypes.initializeDescription', 'This will create the 5 standard pricing types if they don\'t exist'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    });

    if (result.isConfirmed) {
      setInitializing(true);
      try {
        const response = await initializePricingTypes();

        Swal.fire({
          icon: 'success',
          title: t('pricingTypes.initializeSuccess', 'Success!'),
          html: `
            <div>
              <p>${t('pricingTypes.initialized', 'Pricing types initialized successfully')}</p>
              <p class="text-sm mt-2">
                ${t('pricingTypes.inserted', 'Inserted')}: ${response.summary?.inserted || 0}<br/>
                ${t('pricingTypes.updated', 'Updated')}: ${response.summary?.updated || 0}<br/>
                ${t('pricingTypes.total', 'Total')}: ${response.summary?.total || 0}
              </p>
            </div>
          `,
          timer: 3000
        });

        fetchPricingTypes();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: error.response?.data?.message || t('pricingTypes.initializeError', 'Error initializing pricing types')
        });
      } finally {
        setInitializing(false);
      }
    }
  };

  const columns = [
    {
      header: t('pricingTypes.id', 'Type ID'),
      accessor: '_id',
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      header: t('pricingTypes.name', 'Name'),
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Category className="text-blue-600 dark:text-blue-400" fontSize="small" />
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      header: t('pricingTypes.description', 'Description'),
      accessor: 'description',
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
      )
    },
    {
      header: t('pricingTypes.requiresPricingTable', 'Pricing Table'),
      accessor: 'requiresPricingTable',
      render: (value) => (
        <div className="flex items-center gap-1">
          {value ? (
            <>
              <CheckCircle className="text-green-600 dark:text-green-400" fontSize="small" />
              <span className="text-sm text-green-600 dark:text-green-400">
                {t('pricingTypes.required', 'Required')}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('pricingTypes.manualEntry', 'Manual Entry')}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Category className="text-blue-600 dark:text-blue-400" />
            {t('pricingTypes.title', 'Pricing Types')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('pricingTypes.subtitle', 'Standard insurance pricing types configuration')}
          </p>
        </div>
        <button
          onClick={handleInitialize}
          disabled={initializing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Refresh className={initializing ? 'animate-spin' : ''} />
          {initializing ? t('pricingTypes.initializing', 'Initializing...') : t('pricingTypes.initialize', 'Initialize Types')}
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Category className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              {t('pricingTypes.aboutTitle', 'About Pricing Types')}
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              {t('pricingTypes.aboutDescription', 'The system supports 5 standard pricing types:')}
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
              <li>{t('pricingTypes.compulsory', 'Compulsory Insurance - Manual entry')}</li>
              <li>{t('pricingTypes.thirdParty', 'Third Party Insurance - Matrix pricing')}</li>
              <li>{t('pricingTypes.comprehensive', 'Comprehensive Insurance - Matrix pricing')}</li>
              <li>{t('pricingTypes.roadService', 'Road Services - Service-based pricing')}</li>
              <li>{t('pricingTypes.accidentFee', 'Accident Fee Waiver - Fixed amount')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={pricingTypes}
        columns={columns}
        title={t('pricingTypes.listTitle', 'Available Pricing Types')}
        loading={loading}
        onRefresh={fetchPricingTypes}
        enableSearch={false}
        enableExport={false}
      />
    </div>
  );
};

export default PricingTypes;
