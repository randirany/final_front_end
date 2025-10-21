import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Add, Settings, Business } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { getAllCompanies } from '../services/insuranceCompanyApi';
import { getAllPricingTypes } from '../services/pricingTypeApi';
import { getPricingByCompany } from '../services/companyPricingApi';
import ConfigurePricingModal from '../components/ConfigurePricingModal';

const CompanyPricing = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [pricingTypes, setPricingTypes] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companyPricing, setCompanyPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configureModalOpen, setConfigureModalOpen] = useState(false);
  const [selectedPricingType, setSelectedPricingType] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchPricingTypes();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyPricing();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const response = await getAllCompanies({ page: 1, limit: 1000 });
      console.log('Companies response:', response);
      // Handle both array response and nested data response
      setCompanies(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchPricingTypes = async () => {
    try {
      const response = await getAllPricingTypes();
      setPricingTypes(response.pricingTypes || []);
    } catch (error) {
      console.error('Error fetching pricing types:', error);
    }
  };

  const fetchCompanyPricing = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await getPricingByCompany(selectedCompany);
      setCompanyPricing(response.pricing || []);
    } catch (error) {
      console.error('Error fetching company pricing:', error);
      setCompanyPricing([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurePricing = (pricingType) => {
    setSelectedPricingType(pricingType);
    setConfigureModalOpen(true);
  };

  const getConfigurationForType = (typeId) => {
    return companyPricing.find(p =>
      (typeof p.pricing_type_id === 'string' ? p.pricing_type_id : p.pricing_type_id?._id) === typeId
    );
  };

  const getPricingTypeBadge = (pricingType) => {
    const config = getConfigurationForType(pricingType._id);

    if (!config) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {t('companyPricing.notConfigured', 'Not Configured')}
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        {t('companyPricing.configured', 'Configured')}
      </span>
    );
  };

  const getConfigurationSummary = (pricingType) => {
    const config = getConfigurationForType(pricingType._id);

    if (!config) {
      return null;
    }

    if (config.rules?.matrix) {
      return `${config.rules.matrix.length} ${t('companyPricing.rules', 'rules')}`;
    }

    if (config.rules?.fixedAmount) {
      return `${config.rules.fixedAmount} ₪`;
    }

    return t('companyPricing.manualEntry', 'Manual entry');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="text-blue-600 dark:text-blue-400" />
          {t('companyPricing.title', 'Company Pricing Configuration')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('companyPricing.subtitle', 'Configure pricing rules for insurance companies')}
        </p>
      </div>

      {/* Company Selection */}
      <div className="mb-6 bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          {t('companyPricing.selectCompany', 'Select Insurance Company')} *
        </label>
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-dark2 dark:text-white dark:focus:border-blue-400"
        >
          <option value="">{t('companyPricing.selectCompanyPlaceholder', 'Choose a company...')}</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Types Cards */}
      {selectedCompany && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('companyPricing.pricingTypes', 'Pricing Types')}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricingTypes.map((pricingType) => {
                const summary = getConfigurationSummary(pricingType);

                return (
                  <div
                    key={pricingType._id}
                    className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {pricingType.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {pricingType.description}
                        </p>
                      </div>
                      {getPricingTypeBadge(pricingType)}
                    </div>

                    {summary && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-dark2 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {summary}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleConfigurePricing(pricingType)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Settings fontSize="small" />
                      {getConfigurationForType(pricingType._id)
                        ? t('companyPricing.editConfiguration', 'Edit Configuration')
                        : t('companyPricing.configure', 'Configure')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedCompany && (
        <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-12 text-center">
          <Business className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('companyPricing.noCompanySelected', 'No Company Selected')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('companyPricing.selectCompanyPrompt', 'Please select an insurance company to configure pricing')}
          </p>
        </div>
      )}

      {/* Configure Pricing Modal */}
      <ConfigurePricingModal
        open={configureModalOpen}
        onClose={() => {
          setConfigureModalOpen(false);
          setSelectedPricingType(null);
        }}
        companyId={selectedCompany}
        pricingType={selectedPricingType}
        onSuccess={fetchCompanyPricing}
      />
    </div>
  );
};

export default CompanyPricing;
