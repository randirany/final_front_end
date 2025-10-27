import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { addPaymentToInsurance } from '../services/insuranceApi';

const AddPaymentToInsurance = ({ isOpen, onClose, insuredId, vehicleId, insuranceId, onPaymentAdded }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
        receiptNumber: '',
        chequeNumber: '',
        chequeDate: '',
        chequeStatus: 'pending'
    });

    const paymentMethodOptions = [
        { value: 'cash', label: t('insurance.paymentMethods.cash', 'Cash') },
        { value: 'card', label: t('insurance.paymentMethods.card', 'Card') },
        { value: 'cheque', label: t('insurance.paymentMethods.cheque', 'Cheque') },
        { value: 'bank_transfer', label: t('insurance.paymentMethods.bankTransfer', 'Bank Transfer') }
    ];

    const chequeStatusOptions = [
        { value: 'pending', label: t('insurance.chequeStatus.pending', 'Pending') },
        { value: 'cleared', label: t('insurance.chequeStatus.cleared', 'Cleared') },
        { value: 'bounced', label: t('insurance.chequeStatus.bounced', 'Bounced') }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If payment method changed to card, open online payment in new tab
        if (name === 'paymentMethod' && value === 'card') {
            handleOpenOnlinePayment();
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenOnlinePayment = () => {
        // Construct payment URL with parameters
        const paymentAmount = formData.amount || 0;
        const baseUrl = 'http://localhost:3002/api/v1/payment/tranzila';

        // Open payment gateway in new tab
        const paymentUrl = `${baseUrl}/hosted?amount=${paymentAmount}&currency=ILS&insuranceId=${insuranceId}`;

        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error(t('insurance.validation.validAmountRequired', 'Please enter a valid amount'));
            return;
        }

        if (!formData.paymentMethod) {
            toast.error(t('insurance.validation.paymentMethodRequired', 'Payment method is required'));
            return;
        }

        if (formData.paymentMethod === 'cheque' && !formData.chequeNumber) {
            toast.error(t('insurance.validation.chequeNumberRequired', 'Cheque number is required for cheque payments'));
            return;
        }

        setLoading(true);
        try {
            const response = await addPaymentToInsurance(insuredId, vehicleId, insuranceId, formData);

            toast.success(response.message || t('insurance.messages.paymentAddSuccess', 'Payment added successfully'));

            if (onPaymentAdded) {
                onPaymentAdded(response);
            }

            // Reset form
            setFormData({
                amount: '',
                paymentMethod: '',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: '',
                receiptNumber: '',
                chequeNumber: '',
                chequeDate: '',
                chequeStatus: 'pending'
            });

            onClose();
        } catch (error) {
            console.error('Error adding payment:', error);
            const errorMsg = error.response?.data?.message || t('insurance.messages.paymentAddError', 'Failed to add payment');
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-2xl bg-white dark:bg-navbarBack rounded-lg shadow-2xl max-h-[95vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t('insurance.addPayment', 'Add Payment to Insurance')}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form - Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">
                        {/* Amount & Payment Method Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('insurance.payment.amount', 'Amount')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                                    step="0.01"
                                    required
                                    disabled={loading}
                                    placeholder={t('insurance.placeholders.enterAmount', 'Enter amount')}
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('insurance.payment.method', 'Payment Method')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                                    required
                                    disabled={loading}
                                >
                                    <option value="">{t('insurance.placeholders.choosePaymentMethod', 'Choose Method')}</option>
                                    {paymentMethodOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Card Payment Info Banner */}
                        {formData.paymentMethod === 'card' && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {t('insurance.payment.cardPaymentInfo', 'Online payment gateway opened in new tab. Complete payment there and return here to save the record.')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Cheque-specific fields */}
                        {formData.paymentMethod === 'cheque' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('insurance.payment.chequeNumber', 'Cheque Number')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="chequeNumber"
                                        value={formData.chequeNumber}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                                        required={formData.paymentMethod === 'cheque'}
                                        disabled={loading}
                                        placeholder={t('insurance.placeholders.chequeNumber', 'Enter cheque number')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('insurance.payment.chequeDate', 'Cheque Date')}
                                    </label>
                                    <input
                                        type="date"
                                        name="chequeDate"
                                        value={formData.chequeDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors dark:[color-scheme:dark]"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('insurance.payment.chequeStatus', 'Cheque Status')}
                                    </label>
                                    <select
                                        name="chequeStatus"
                                        value={formData.chequeStatus}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                                        disabled={loading}
                                    >
                                        {chequeStatusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Payment Date & Receipt Number Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('insurance.payment.date', 'Payment Date')}
                                </label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors dark:[color-scheme:dark]"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('insurance.payment.receiptNumber', 'Receipt Number')}
                                </label>
                                <input
                                    type="text"
                                    name="receiptNumber"
                                    value={formData.receiptNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                                    placeholder={t('insurance.payment.autoGenerated', 'Auto-generated if empty')}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('insurance.payment.notes', 'Notes')}
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-colors"
                                rows="3"
                                placeholder={t('insurance.payment.notesPlaceholder', 'Optional notes...')}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Buttons - Fixed at bottom */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    {t('common.saving', 'Saving...')}
                                </>
                            ) : (
                                t('insurance.buttons.addPayment', 'Add Payment')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentToInsurance;
