import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Close, Business, Description, CalendarToday } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { getCompanyById } from '../services/insuranceCompanyApi';

const ViewCompanyModal = ({ open, onClose, companyId }) => {
  const { t, i18n: { language } } = useTranslation();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && companyId) {
      fetchCompanyData();
    }
  }, [open, companyId]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      // Fetch company details (includes populated insuranceTypes and roadServices)
      const response = await getCompanyById(companyId);
      console.log('Company data:', response);
      // Extract company from response (API returns { message, company })
      setCompany(response.company || response);
    } catch (error) {
      console.error('Error fetching company:', error);
      Swal.fire({
        title: t('companies.error', 'Error'),
        text: t('companies.errorFetchingCompany', 'Error loading company data'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompany(null);
    onClose();
  };

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
          <span>{t('companies.viewCompany', 'Company Details')}</span>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="dark:bg-navbarBack dark:text-white">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : company ? (
          <div className="space-y-6 mt-4">
            {/* Company Information */}
            <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Business className="text-blue-600 dark:text-blue-400" />
                {t('companies.companyInformation', 'Company Information')}
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Business className="text-gray-400 mt-0.5" fontSize="small" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('companies.name', 'Company Name')}
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {company.name}
                    </p>
                  </div>
                </div>

                {company.description && (
                  <div className="flex items-start gap-3">
                    <Description className="text-gray-400 mt-0.5" fontSize="small" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('companies.description', 'Description')}
                      </p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {company.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <CalendarToday className="text-gray-400 mt-0.5" fontSize="small" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('companies.createdAt', 'Created Date')}
                    </p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Types */}
            <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('companies.labels.insuranceTypes', 'Insurance Types')}
              </h3>
              {company.insuranceTypes && company.insuranceTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {company.insuranceTypes.map((type) => (
                    <span
                      key={type._id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {t('companies.noInsuranceTypes', 'No insurance types')}
                </p>
              )}
            </div>

            {/* Road Services */}
            <div className="bg-gray-50 dark:bg-dark2 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('companies.labels.roadServices', 'Road Services')}
              </h3>
              {company.roadServices && company.roadServices.length > 0 ? (
                <div className="space-y-2">
                  {company.roadServices.map((service, index) => (
                    <div key={service._id} className="p-3 bg-white dark:bg-navbarBack rounded border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('roadService.title', 'Road Service')} #{index + 1}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          service.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {service.is_active
                            ? t('roadService.status.active', 'Active')
                            : t('roadService.status.inactive', 'Inactive')
                          }
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('roadService.labels.cutoffYear', 'Cutoff Year')}:</span>
                          <span>{service.cutoff_year || 'N/A'}</span>
                        </div>
                        {service.description && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium">{t('companies.description', 'Description')}:</span>
                            <span className="flex-1">{service.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {t('companies.noRoadServices', 'No road services')}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>

      <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
        >
          {t('common.close', 'Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCompanyModal;
