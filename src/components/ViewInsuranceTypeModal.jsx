import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Close,
  Category,
  Edit,
  Info,
  CheckCircle
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider
} from '@mui/material';

const ViewInsuranceTypeModal = ({ isOpen, onClose, insuranceType, onEdit }) => {
  const { t, i18n: { language } } = useTranslation();

  if (!insuranceType) return null;

  const isRTL = language === 'ar' || language === 'he';

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

  const pricingType = typeof insuranceType.pricing_type_id === 'object'
    ? insuranceType.pricing_type_id
    : null;

  const pricingTypeId = typeof insuranceType.pricing_type_id === 'string'
    ? insuranceType.pricing_type_id
    : insuranceType.pricing_type_id?._id;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        className: 'dark:bg-navbarBack'
      }}
    >
      <DialogTitle className="dark:text-white border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Category className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {t('insuranceType.viewDetails', 'Insurance Type Details')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Close />
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="dark:bg-navbarBack dark:text-white">
        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('insuranceType.labels.name', 'Name')}
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {insuranceType.name}
            </p>
          </div>

          <Divider className="dark:border-gray-700" />

          {/* Pricing Type */}
          {pricingType && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('insuranceType.labels.pricingType', 'Pricing Type')}
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{getPricingTypeIcon(pricingTypeId)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {pricingType.name}
                    </h4>
                    {pricingType.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {pricingType.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {pricingType.requiresPricingTable !== undefined && (
                        <Chip
                          label={pricingType.requiresPricingTable ? t('companyPricing.matrixBased', 'Matrix-based Pricing') : t('companyPricing.simplePricing', 'Simple Pricing')}
                          size="small"
                          className={`${
                            pricingType.requiresPricingTable
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        />
                      )}
                      <Chip
                        label={pricingTypeId}
                        size="small"
                        className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {insuranceType.description && (
            <>
              <Divider className="dark:border-gray-700" />
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('insuranceType.labels.description', 'Description')}
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {insuranceType.description}
                </p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Divider className="dark:border-gray-700" />
          <div className="grid grid-cols-2 gap-4">
            {insuranceType.createdAt && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('common.created', 'Created')}
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(insuranceType.createdAt).toLocaleDateString(language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            {insuranceType.updatedAt && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('common.lastUpdated', 'Last Updated')}
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(insuranceType.updatedAt).toLocaleDateString(language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fontSize="small" />
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  {t('insuranceType.viewInfoText', 'This insurance type can be used by companies when configuring their insurance offerings. The pricing type determines how pricing is calculated.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="dark:bg-navbarBack dark:border-gray-700 border-t px-6 py-4">
        <Button
          onClick={onClose}
          className="dark:text-gray-300"
        >
          {t('common.close', 'Close')}
        </Button>
        {onEdit && (
          <Button
            onClick={() => {
              onClose();
              onEdit(insuranceType);
            }}
            variant="contained"
            startIcon={<Edit />}
            sx={{ background: '#6C5FFC', '&:hover': { background: '#5a4dd4' } }}
          >
            {t('common.edit', 'Edit')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewInsuranceTypeModal;
