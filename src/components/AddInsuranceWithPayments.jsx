import { useState, useEffect, useRef } from "react";
import { X, FileText, Trash2, Plus, Minus } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { addInsuranceToVehicle, getAllAgents } from '../services/insuranceApi';
import { getCompaniesByInsuranceType } from '../services/insuranceCompanyApi';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import AddChequeModal from './AddChequeModal';

// --- Alert Message Component ---
const AlertMessage = ({ message, type }) => {
    if (!message) return null;
    const baseClasses = 'p-4 mb-4 text-sm rounded-lg text-center';
    const typeClasses = {
        success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.error}`} role="alert">
            <span className="font-medium">{message}</span>
        </div>
    );
};

// --- File Preview Component ---
const FilePreview = ({ file, onRemove, t }) => {
    const isImage = file.type.startsWith('image/');
    return (
        <div className="relative group w-full h-24 border dark:border-gray-600 rounded-md flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700/50">
            {isImage ? (
                <img src={URL.createObjectURL(file)} alt={file.name} className="max-w-full max-h-full object-contain rounded" />
            ) : (
                <FileText className="w-10 h-10 text-gray-500" />
            )}
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                <p className="text-white text-xs break-all">{file.name}</p>
            </div>
            <button
                type="button"
                onClick={onRemove}
                title={t("common.removeFile", "Remove file")}
                className="absolute -top-2 -right-2 z-10 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none transition-transform transform group-hover:scale-100 scale-0"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};

// --- Payment Row Component ---
const PaymentRow = ({ payment, index, onUpdate, onRemove, canRemove, onOpenChequeModal }) => {
    const { t } = useTranslation();

    const paymentMethodOptions = [
        { value: "cash", label: t("insurance.paymentMethods.cash", "Cash") },
        { value: "card", label: t("insurance.paymentMethods.card", "Card") },
        { value: "cheque", label: t("insurance.paymentMethods.cheque", "Cheque") },
        { value: "bank_transfer", label: t("insurance.paymentMethods.bankTransfer", "Bank Transfer") },
    ];

    const chequeStatusOptions = [
        { value: "pending", label: t("insurance.chequeStatus.pending", "Pending") },
        { value: "cleared", label: t("insurance.chequeStatus.cleared", "Cleared") },
        { value: "bounced", label: t("insurance.chequeStatus.bounced", "Bounced") },
    ];

    const handleChange = (field, value) => {
        // If payment method changed to cheque, open the cheque modal
        if (field === 'paymentMethod' && value === 'cheque') {
            onOpenChequeModal(index);
        }
        // If payment method changed to card, open online payment in new tab
        if (field === 'paymentMethod' && value === 'card') {
            handleOpenOnlinePayment();
        }
        onUpdate(index, { ...payment, [field]: value });
    };

    const handleOpenOnlinePayment = () => {
        // Construct payment URL with parameters
        const paymentAmount = payment.amount || 0;
        const baseUrl = 'http://localhost:3002/api/v1/payment/tranzila';

        // Open payment gateway in new tab
        // You can pass parameters as query string or use a hosted payment page
        const paymentUrl = `${baseUrl}/hosted?amount=${paymentAmount}&currency=ILS`;

        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30 space-y-3">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold dark:text-white">
                    {t("insurance.payment.title", "Payment")} #{index + 1}
                </h4>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("insurance.payment.amount", "Amount")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                        step="any"
                        required
                    />
                </div>

                {/* Payment Method */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("insurance.payment.method", "Payment Method")} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={payment.paymentMethod}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">{t("insurance.placeholders.choosePaymentMethod", "Choose Method")}</option>
                        {paymentMethodOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {payment.paymentMethod === 'card' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t("insurance.payment.cardPaymentInfo", "Online payment gateway opened in new tab. Complete the payment and return here.")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("insurance.payment.date", "Payment Date")}
                    </label>
                    <input
                        type="date"
                        value={payment.paymentDate}
                        onChange={(e) => handleChange('paymentDate', e.target.value)}
                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                    />
                </div>

                {/* Receipt Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("insurance.payment.receiptNumber", "Receipt Number")}
                    </label>
                    <input
                        type="text"
                        value={payment.receiptNumber}
                        onChange={(e) => handleChange('receiptNumber', e.target.value)}
                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                        placeholder={t("insurance.payment.autoGenerated", "Auto-generated if empty")}
                    />
                </div>

                {/* Cheque-specific fields */}
                {payment.paymentMethod === 'cheque' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insurance.payment.chequeNumber", "Cheque Number")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={payment.chequeNumber || ''}
                                onChange={(e) => handleChange('chequeNumber', e.target.value)}
                                className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                                required={payment.paymentMethod === 'cheque'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insurance.payment.chequeDate", "Cheque Date")}
                            </label>
                            <input
                                type="date"
                                value={payment.chequeDate || ''}
                                onChange={(e) => handleChange('chequeDate', e.target.value)}
                                className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insurance.payment.chequeStatus", "Cheque Status")}
                            </label>
                            <select
                                value={payment.chequeStatus || 'pending'}
                                onChange={(e) => handleChange('chequeStatus', e.target.value)}
                                className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                {chequeStatusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Notes */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("insurance.payment.notes", "Notes")}
                    </label>
                    <textarea
                        value={payment.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                        rows="2"
                        placeholder={t("insurance.payment.notesPlaceholder", "Optional notes...")}
                    />
                </div>
            </div>
        </div>
    );
};

// --- Helper Functions for Dates ---
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

const getOneYearFromToday = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
};

// --- Main Component ---
function AddInsuranceWithPayments({ onClose, isOpen, vehicleId, insuredId, onInsuranceAdded }) {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [insuranceTypes, setInsuranceTypes] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });
    const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
    const [currentPaymentIndex, setCurrentPaymentIndex] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        insuranceType: "",
        insuranceCompany: "",
        agent: "",
        agentId: "",
        isUnder24: false,
        insuranceAmount: "",
        insuranceStartDate: getTodayDate(),
        insuranceEndDate: getOneYearFromToday(),
        agentFlow: "none", // NEW: "to_agent", "from_agent", or "none"
        agentAmount: "", // NEW: Amount for agent credit/debit
    });

    // Payments state (NEW)
    const [payments, setPayments] = useState([
        {
            amount: "",
            paymentMethod: "",
            paymentDate: getTodayDate(),
            notes: "",
            receiptNumber: "",
            chequeNumber: "",
            chequeDate: "",
            chequeStatus: "pending"
        }
    ]);

    const initialFormState = {
        insuranceType: "",
        insuranceCompany: "",
        agent: "",
        agentId: "",
        isUnder24: false,
        insuranceAmount: "",
        insuranceStartDate: getTodayDate(),
        insuranceEndDate: getOneYearFromToday(),
        agentFlow: "none",
        agentAmount: "",
    };

    // --- Fetch Initial Data ---
    const fetchData = async () => {
        try {
            const [agentsRes, insuranceTypesRes] = await Promise.all([
                getAllAgents(),
                insuranceTypeApi.getAll()
            ]);
            setAgents(agentsRes.getAll || agentsRes || []);
            setInsuranceTypes(insuranceTypesRes.insuranceTypes || insuranceTypesRes || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(t("insurance.messages.fetchError", "Failed to load data"));
        }
    };

    // --- Fetch Companies by Insurance Type ---
    const fetchCompaniesByType = async (insuranceTypeId) => {
        if (!insuranceTypeId) {
            setCompanies([]);
            return;
        }

        setLoadingCompanies(true);
        try {
            const response = await getCompaniesByInsuranceType(insuranceTypeId);
            setCompanies(response.companies || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error(t("insurance.messages.companiesFetchError", "Failed to load companies"));
            setCompanies([]);
        } finally {
            setLoadingCompanies(false);
        }
    };

    // --- Reset Form when Modal Opens ---
    useEffect(() => {
        if (isOpen) {
            fetchData();
            setFormData({
                insuranceType: "",
                insuranceCompany: "",
                agent: "",
                agentId: "",
                isUnder24: false,
                insuranceAmount: "",
                insuranceStartDate: getTodayDate(),
                insuranceEndDate: getOneYearFromToday(),
                agentFlow: "none",
                agentAmount: "",
            });
            setPayments([{
                amount: "",
                paymentMethod: "",
                paymentDate: getTodayDate(),
                notes: "",
                receiptNumber: "",
                chequeNumber: "",
                chequeDate: "",
                chequeStatus: "pending"
            }]);
            setFiles([]);
            setApiMessage({ text: '', type: '' });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    // --- Watch for Insurance Type Changes ---
    useEffect(() => {
        if (formData.insuranceType) {
            // Find the selected insurance type object to get its ID
            const selectedType = insuranceTypes.find(type => type.name === formData.insuranceType || type._id === formData.insuranceType);
            if (selectedType) {
                fetchCompaniesByType(selectedType._id);
            }
            // Reset company selection when type changes
            setFormData(prev => ({ ...prev, insuranceCompany: "" }));
        } else {
            setCompanies([]);
        }
    }, [formData.insuranceType, insuranceTypes]);

    // --- Handle Input Change ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Handle Agent Selection ---
    const handleAgentChange = (e) => {
        const agentId = e.target.value;
        const selectedAgent = agents.find(a => a._id === agentId);
        setFormData(prev => ({
            ...prev,
            agentId: agentId,
            agent: selectedAgent ? selectedAgent.name : ""
        }));
    };

    // --- Payment Management ---
    const addPayment = () => {
        setPayments([...payments, {
            amount: "",
            paymentMethod: "",
            paymentDate: getTodayDate(),
            notes: "",
            receiptNumber: "",
            chequeNumber: "",
            chequeDate: "",
            chequeStatus: "pending"
        }]);
    };

    const removePayment = (index) => {
        if (payments.length > 1) {
            setPayments(payments.filter((_, i) => i !== index));
        }
    };

    const updatePayment = (index, updatedPayment) => {
        const newPayments = [...payments];
        newPayments[index] = updatedPayment;
        setPayments(newPayments);
    };

    // --- Cheque Modal Handlers ---
    const handleOpenChequeModal = (paymentIndex) => {
        setCurrentPaymentIndex(paymentIndex);
        setIsChequeModalOpen(true);
    };

    const handleChequeSuccess = (chequeData) => {
        // Populate the payment with cheque data
        if (currentPaymentIndex !== null) {
            const updatedPayment = {
                ...payments[currentPaymentIndex],
                chequeNumber: chequeData.chequeNumber,
                chequeDate: chequeData.chequeDate,
                amount: chequeData.amount,
                notes: chequeData.notes || '',
                chequeStatus: chequeData.status || 'pending'
            };
            updatePayment(currentPaymentIndex, updatedPayment);
        }

        // Close the cheque modal and return to insurance modal
        setIsChequeModalOpen(false);
        setCurrentPaymentIndex(null);
    };

    const handleCloseChequeModal = () => {
        // If user cancels, reset payment method to empty
        if (currentPaymentIndex !== null) {
            const updatedPayment = {
                ...payments[currentPaymentIndex],
                paymentMethod: ''
            };
            updatePayment(currentPaymentIndex, updatedPayment);
        }
        setIsChequeModalOpen(false);
        setCurrentPaymentIndex(null);
    };

    // --- File Management ---
    const handleFileChange = (selectedFiles) => {
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileChange(e.dataTransfer.files); };
    const handleBrowseClick = () => fileInputRef.current?.click();

    // --- Handle Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        // --- Validation ---
        if (!formData.insuranceType) {
            return setApiMessage({ text: t("insurance.validation.typeRequired", "Insurance Type required"), type: "error" });
        }
        if (!formData.insuranceCompany) {
            return setApiMessage({ text: t("insurance.validation.companyRequired", "Insurance Company required"), type: "error" });
        }
        if (!formData.insuranceAmount || parseFloat(formData.insuranceAmount) <= 0) {
            return setApiMessage({ text: t("insurance.validation.amountRequired", "Valid insurance amount required"), type: "error" });
        }

        // Validate at least one payment
        const validPayments = payments.filter(p => p.amount && parseFloat(p.amount) > 0 && p.paymentMethod);
        if (validPayments.length === 0) {
            return setApiMessage({ text: t("insurance.validation.paymentRequired", "At least one valid payment required"), type: "error" });
        }

        // Validate cheque fields if payment method is cheque
        for (const payment of validPayments) {
            if (payment.paymentMethod === 'cheque' && !payment.chequeNumber) {
                return setApiMessage({ text: t("insurance.validation.chequeNumberRequired", "Cheque number required for cheque payments"), type: "error" });
            }
        }

        // Validate agent flow
        if (formData.agentFlow !== 'none') {
            if (!formData.agentAmount || parseFloat(formData.agentAmount) <= 0) {
                return setApiMessage({ text: t("insurance.validation.agentAmountRequired", "Agent amount required when agent flow is selected"), type: "error" });
            }
            if (!formData.agentId) {
                return setApiMessage({ text: t("insurance.validation.agentRequired", "Agent selection required when agent flow is selected"), type: "error" });
            }
        }

        setLoading(true);
        try {
            const insuranceData = {
                ...formData,
                payments: validPayments
            };

            const response = await addInsuranceToVehicle(insuredId, vehicleId, insuranceData, files);

            setApiMessage({
                text: response.message || t("insurance.messages.addSuccess", "Insurance added successfully"),
                type: "success"
            });

            toast.success(t("insurance.messages.addSuccess", "Insurance added successfully"));

            setTimeout(() => {
                if (onInsuranceAdded) onInsuranceAdded();
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Error adding insurance:', error);
            let msg = t("insurance.messages.addError", "Failed to add insurance");
            if (error.response?.data?.message) {
                msg = error.response.data.message;
            }
            setApiMessage({ text: msg, type: "error" });
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const agentFlowOptions = [
        { value: "none", label: t("insurance.agentFlow.none", "No Agent Flow") },
        { value: "to_agent", label: t("insurance.agentFlow.toAgent", "To Agent (Agent owes company)") },
        { value: "from_agent", label: t("insurance.agentFlow.fromAgent", "From Agent (Company owes agent)") },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => { if (!loading) onClose(); }}>
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-navbarBack z-10 px-0 pt-0">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {t("insurance.addInsurance", "Add New Insurance")}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto hide-scrollbar flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4 pr-1">
                        {/* Basic Insurance Information */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="text-md font-semibold mb-3 dark:text-white">
                                {t("insurance.sections.basicInfo", "Basic Information")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Insurance Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.insuranceType", "Insurance Type")} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="insuranceType"
                                        value={formData.insuranceType}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">{t("insurance.placeholders.chooseType", "Choose Type")}</option>
                                        {insuranceTypes.map(type => (
                                            <option key={type._id} value={type.name}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Insurance Company */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.insuranceCompany", "Insurance Company")} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="insuranceCompany"
                                        value={formData.insuranceCompany}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                        disabled={!formData.insuranceType || loadingCompanies}
                                    >
                                        <option value="">
                                            {loadingCompanies
                                                ? t("insurance.placeholders.loadingCompanies", "Loading companies...")
                                                : !formData.insuranceType
                                                    ? t("insurance.placeholders.selectTypeFirst", "Select insurance type first")
                                                    : t("insurance.placeholders.chooseCompany", "Choose Company")
                                            }
                                        </option>
                                        {companies.map(c => (
                                            <option key={c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    {companies.length === 0 && formData.insuranceType && !loadingCompanies && (
                                        <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                            {t("insurance.messages.noCompaniesForType", "No companies available for this insurance type")}
                                        </p>
                                    )}
                                </div>

                                {/* Insurance Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.insuranceAmount", "Insurance Amount")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="insuranceAmount"
                                        value={formData.insuranceAmount}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                                        step="any"
                                        required
                                    />
                                </div>

                                {/* Is Under 24 */}
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        name="isUnder24"
                                        id="isUnder24"
                                        checked={formData.isUnder24}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <label htmlFor="isUnder24" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.driverUnder24", "Driver Under 24?")}
                                    </label>
                                </div>

                                {/* Insurance Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.startDate", "Start Date")}
                                    </label>
                                    <input
                                        type="date"
                                        name="insuranceStartDate"
                                        value={formData.insuranceStartDate}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                                    />
                                </div>

                                {/* Insurance End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.endDate", "End Date")}
                                    </label>
                                    <input
                                        type="date"
                                        name="insuranceEndDate"
                                        value={formData.insuranceEndDate}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Agent Flow Section (NEW) */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h3 className="text-md font-semibold mb-3 dark:text-white">
                                {t("insurance.sections.agentFlow", "Agent Flow")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Agent */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.agent", "Agent")}
                                    </label>
                                    <select
                                        value={formData.agentId}
                                        onChange={handleAgentChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">{t("insurance.placeholders.chooseAgent", "Choose Agent")}</option>
                                        {agents.map(a => (
                                            <option key={a._id} value={a._id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Agent Flow Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t("insurance.labels.agentFlow", "Agent Flow Type")}
                                    </label>
                                    <select
                                        name="agentFlow"
                                        value={formData.agentFlow}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                                    >
                                        {agentFlowOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Agent Amount */}
                                {formData.agentFlow !== 'none' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t("insurance.labels.agentAmount", "Agent Amount")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="agentAmount"
                                            value={formData.agentAmount}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white"
                                            step="any"
                                            placeholder={t("insurance.placeholders.agentAmount", "Enter agent amount")}
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {formData.agentFlow === 'from_agent'
                                                ? t("insurance.hints.fromAgent", "Company owes this amount to the agent")
                                                : t("insurance.hints.toAgent", "Agent owes this amount to the company")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payments Section (NEW) */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-md font-semibold dark:text-white">
                                    {t("insurance.sections.payments", "Payments")}
                                </h3>
                                <button
                                    type="button"
                                    onClick={addPayment}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t("insurance.buttons.addPayment", "Add Payment")}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {payments.map((payment, index) => (
                                    <PaymentRow
                                        key={index}
                                        payment={payment}
                                        index={index}
                                        onUpdate={updatePayment}
                                        onRemove={removePayment}
                                        canRemove={payments.length > 1}
                                        onOpenChequeModal={handleOpenChequeModal}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("insurance.labels.attachments", "Attachments")} ({t("common.optional", "Optional")})
                            </label>
                            {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                    {files.map((file, index) => (
                                        <FilePreview key={index} file={file} onRemove={() => handleRemoveFile(index)} t={t} />
                                    ))}
                                </div>
                            )}
                            <div
                                onClick={handleBrowseClick}
                                className={`relative flex cursor-pointer flex-col items-center justify-center h-32 border-2 border-dashed rounded-md transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
                                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                    </svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            {t("insurance.uploadPrompt", "Click to upload")}
                                        </span> {t("insurance.orDragDrop", "or drag and drop")}
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e.target.files)}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* API Message */}
                        <AlertMessage message={apiMessage.text} type={apiMessage.type} />

                        {/* Submit */}
                        <div className="pt-3 flex justify-end gap-2 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                {t("common.cancel", "Cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                {loading ? t("common.saving", "Saving...") : t("insurance.buttons.addInsurance", "Add Insurance")}
                            </button>
                        </div>
                    </form>
                </div>

                <ToastContainer />
            </div>

            {/* Add Cheque Modal */}
            {isChequeModalOpen && (
                <AddChequeModal
                    open={isChequeModalOpen}
                    onClose={handleCloseChequeModal}
                    onSuccess={handleChequeSuccess}
                    selectedCustomerId={insuredId}
                />
            )}
        </div>
    );
}

export default AddInsuranceWithPayments;
