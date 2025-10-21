import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, CheckCircle, Refresh, Info } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { initializePricingTypes, getAllPricingTypes } from '../services/pricingTypeApi';

const SystemSetupTab = () => {
  const { t } = useTranslation();
  const [pricingTypes, setPricingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    fetchPricingTypes();
  }, []);

  const fetchPricingTypes = async () => {
    setLoading(true);
    try {
      const response = await getAllPricingTypes();
      const types = response.pricingTypes || response.data || [];
      setPricingTypes(types);
      setIsInitialized(types.length >= 5); // 5 standard pricing types
    } catch (error) {
      console.error('Error fetching pricing types:', error);
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    const result = await Swal.fire({
      title: t('systemSetup.initializeTitle', 'Initialize Pricing Types?'),
      html: `
        <div class="text-left">
          <p class="mb-3">${t('systemSetup.initializeConfirm', 'This will create the following 5 standard pricing types:')}</p>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li><strong>${t('systemSetup.types.compulsory', 'Compulsory Insurance')}</strong> - ${t('systemSetup.descriptions.compulsory', 'Manual entry')}</li>
            <li><strong>${t('systemSetup.types.thirdParty', 'Third Party Insurance')}</strong> - ${t('systemSetup.descriptions.thirdParty', 'Matrix-based pricing')}</li>
            <li><strong>${t('systemSetup.types.comprehensive', 'Comprehensive Insurance')}</strong> - ${t('systemSetup.descriptions.comprehensive', 'Matrix-based pricing')}</li>
            <li><strong>${t('systemSetup.types.roadService', 'Road Services')}</strong> - ${t('systemSetup.descriptions.roadService', 'Configured separately')}</li>
            <li><strong>${t('systemSetup.types.accidentFeeWaiver', 'Accident Fee Waiver')}</strong> - ${t('systemSetup.descriptions.accidentFeeWaiver', 'Fixed amount')}</li>
          </ul>
          <p class="mt-3 text-sm text-gray-600">${t('systemSetup.initializeNote', 'This is a one-time setup operation. Existing types will not be duplicated.')}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('systemSetup.initializeButton', 'Initialize'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      width: '600px'
    });

    if (result.isConfirmed) {
      setInitializing(true);
      try {
        const response = await initializePricingTypes();

        Swal.fire({
          icon: 'success',
          title: t('systemSetup.initializeSuccess', 'Success!'),
          html: `
            <div class="text-left">
              <p class="mb-2">${t('systemSetup.initializeSuccessMessage', 'Pricing types initialized successfully!')}</p>
              <ul class="text-sm space-y-1">
                <li>✅ ${t('systemSetup.summary.inserted', 'Inserted')}: <strong>${response.summary?.inserted || 0}</strong></li>
                <li>🔄 ${t('systemSetup.summary.updated', 'Updated')}: <strong>${response.summary?.updated || 0}</strong></li>
                <li>📊 ${t('systemSetup.summary.total', 'Total')}: <strong>${response.summary?.total || 0}</strong></li>
              </ul>
            </div>
          `,
          timer: 3000
        });

        fetchPricingTypes();
      } catch (error) {
        console.error('Error initializing pricing types:', error);
        Swal.fire({
          icon: 'error',
          title: t('common.error'),
          text: error.response?.data?.message || t('systemSetup.initializeError', 'Failed to initialize pricing types')
        });
      } finally {
        setInitializing(false);
      }
    }
  };

  const getPricingTypeIcon = (typeId) => {
    const icons = {
      compulsory: '📝',
      third_party: '🚗',
      comprehensive: '🛡️',
      road_service: '🛣️',
      accident_fee_waiver: '💰'
    };
    return icons[typeId] || '📋';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('systemSetup.title', 'System Setup')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('systemSetup.subtitle', 'One-time configuration for pricing system')}
          </p>
        </div>
        <button
          onClick={handleInitialize}
          disabled={initializing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
        >
          {initializing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('systemSetup.initializing', 'Initializing...')}
            </>
          ) : (
            <>
              <Settings />
              {isInitialized ? t('systemSetup.reinitialize', 'Reinitialize') : t('systemSetup.initialize', 'Initialize Pricing Types')}
            </>
          )}
        </button>
      </div>

      {/* Status Card */}
      <div className={`mb-6 p-6 rounded-lg border-2 ${
        isInitialized
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-700'
      }`}>
        <div className="flex items-start gap-3">
          {isInitialized ? (
            <CheckCircle className="text-green-600 dark:text-green-400" fontSize="large" />
          ) : (
            <Info className="text-yellow-600 dark:text-yellow-400" fontSize="large" />
          )}
          <div>
            <h3 className={`font-semibold text-lg ${
              isInitialized
                ? 'text-green-900 dark:text-green-200'
                : 'text-yellow-900 dark:text-yellow-200'
            }`}>
              {isInitialized
                ? t('systemSetup.status.initialized', 'System Initialized')
                : t('systemSetup.status.notInitialized', 'System Not Initialized')
              }
            </h3>
            <p className={`mt-1 text-sm ${
              isInitialized
                ? 'text-green-700 dark:text-green-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {isInitialized
                ? t('systemSetup.status.initializedMessage', 'All pricing types are configured. You can now create companies and configure pricing.')
                : t('systemSetup.status.notInitializedMessage', 'Click "Initialize Pricing Types" to set up the system before creating companies.')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
          <Info />
          {t('systemSetup.whatIsThis', 'What is System Initialization?')}
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
          {t('systemSetup.explanation', 'System initialization creates the 5 standard pricing type categories that define how insurance pricing works across your system. This is a one-time setup that must be completed before you can configure pricing for insurance companies.')}
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>{t('systemSetup.point1', 'This operation only needs to be run once')}</li>
          <li>{t('systemSetup.point2', 'Existing pricing types will not be duplicated')}</li>
          <li>{t('systemSetup.point3', 'You can safely re-run initialization to restore default types')}</li>
        </ul>
      </div>

      {/* Pricing Types List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings />
          {t('systemSetup.pricingTypes', 'Pricing Types')} ({pricingTypes.length})
        </h3>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : pricingTypes.length === 0 ? (
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-12 text-center">
            <Settings className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('systemSetup.noPricingTypes', 'No Pricing Types')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('systemSetup.initializeFirst', 'Initialize the system to create pricing types')}
            </p>
            <button
              onClick={handleInitialize}
              disabled={initializing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <Settings />
              {t('systemSetup.initialize', 'Initialize Pricing Types')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingTypes.map((type) => (
              <div
                key={type._id}
                className="bg-white dark:bg-navbarBack rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{getPricingTypeIcon(type._id)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h4>
                    {type.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    type.requiresPricingTable
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {type.requiresPricingTable
                      ? t('systemSetup.matrixBased', 'Matrix-based')
                      : t('systemSetup.simple', 'Simple')
                    }
                  </span>
                  <CheckCircle className="text-green-600 dark:text-green-400 ml-auto" fontSize="small" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      {pricingTypes.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={fetchPricingTypes}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Refresh className={loading ? 'animate-spin' : ''} />
            {t('common.refresh', 'Refresh')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemSetupTab;
