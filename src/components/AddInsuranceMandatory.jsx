import { useState, useEffect, useRef } from "react";
import { X, FileText, Trash2 } from "lucide-react";
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

// 1. مكون AlertMessage لعرض الرسالة العامة
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

const FilePreview = ({ file, onRemove }) => {
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
                title="Remove file"
                className="absolute -top-2 -right-2 z-10 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none transition-transform transform group-hover:scale-100 scale-0"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};


function AddInsuranceMandatory({ onClose, isOpen, vehicleId, insuredId, onInsuranceAdded }) {
    const { t, i18n: { language } } = useTranslation();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
      const [agents, setAgents] = useState([]); 
const [company, setCompany] = useState([]); 
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

    const initialFormState = {
        insuranceType: "",
        insuranceCompany: "", agent: "", paymentMethod: "",
        insuranceAmount: "", paidAmount: "", isUnder24: "false",
        paymentDate: ""
    };
    const [formData, setFormData] = useState(initialFormState);
        const fetchAgents = async () => {
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get("http://localhost:3002/api/v1/agents/all", {
                headers: { token }
            });
            setAgents(res.data.getAll || []);
        } catch {
            // Handle error silently
        }
    }

        const fetchCompany = async () => {
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get("http://localhost:3002/api/v1/company/all", {
                headers: { token }
            });
            setCompany(res.data || []);
        } catch {
            // Handle error silently
        }
    }



    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, loading]);

    useEffect(() => {
        if (isOpen) {
             fetchAgents();
             fetchCompany();
            setFormData(initialFormState);
            setFiles([]);
            setApiMessage({ text: '', type: '' }); 
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    if (!isOpen) return null;



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (selectedFiles) => {
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...Array.from(selectedFiles)]);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleRemoveFile = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

       
    
        if (!formData.insuranceType.trim()) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.typeRequired', 'Insurance Type is required.'), type: 'error' });
            return;
        }
        if (!formData.insuranceCompany.trim()) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.companyRequired', 'Insurance Company is required.'), type: 'error' });
            return;
        }
        if (!formData.agent.trim()) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.agentRequired', 'Agent is required.'), type: 'error' });
            return;
        }
        if (!formData.paymentMethod) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.paymentMethodRequired', 'Payment Method is required.'), type: 'error' });
            return;
        }
        if (!formData.insuranceAmount.toString().trim()) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.insuranceAmountRequired', 'Insurance Amount is required.'), type: 'error' });
            return;
        }
        if (!formData.paidAmount.toString().trim()) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.paidAmountRequired', 'Paid Amount is required.'), type: 'error' });
            return;
        }
        if (!formData.paymentDate) {
            setApiMessage({ text: t('addInsuranceMandatory.validation.paymentDateRequired', 'Payment Date is required.'), type: 'error' });
            return;
        }
        const insuranceAmount = parseFloat(formData.insuranceAmount);
        const paidAmount = parseFloat(formData.paidAmount);
        if (!isNaN(insuranceAmount) && !isNaN(paidAmount) && paidAmount > insuranceAmount) {
            setApiMessage({ text: t('validation.paidExceedsInsurance', 'Paid amount cannot exceed the insurance amount.'), type: 'error' });
            return;
        }
        if (!insuredId || !vehicleId) {
            setApiMessage({ text: t('addInsuranceMandatory.alerts.missingIds', 'Insured ID or Vehicle ID is missing.'), type: 'error' });
            return;
        }
        // --- End of Form Validation ---

        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            const dataToAppend = {
                ...formData,
                isUnder24: formData.isUnder24 === 'true',
                insuranceAmount: Number(formData.insuranceAmount),
                paidAmount: Number(formData.paidAmount),
            };
            Object.keys(dataToAppend).forEach(key => formDataToSubmit.append(key, dataToAppend[key]));
            files.forEach(file => formDataToSubmit.append('insuranceFiles', file));

            const token = `islam__${localStorage.getItem("token")}`;
            const response = await axios.post(
                `http://localhost:3002/api/v1/insured/addInsurance/${insuredId}/${vehicleId}`,
                formDataToSubmit,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );
            if (response.status === 200) {
                setApiMessage(t('addInsuranceMandatory.errors.companyNotFoundGeneric', 'The specified insurance company was not found.'));
                // return;
            }
            setApiMessage({ text: response.data.message || t('addInsuranceMandatory.success', 'Insurance added successfully'), type: 'success' });
            setTimeout(() => {
                if (onInsuranceAdded) onInsuranceAdded();
                onClose();
            }, 1500);

        } catch (error) {
            // --- START: MODIFIED ERROR HANDLING BLOCK ---

            let errorMessage = t('addInsuranceMandatory.alerts.addInsuranceFailed', 'Failed to add insurance. Please try again.');

            if (error.response) {
                const { status } = error.response;
                switch (status) {
                    case 404:
                        errorMessage = t('addInsuranceMandatory.errors.insuredNotFound', 'Insured person not found. Please refresh the page and try again.');
                        break;
                    case 407:
                        errorMessage = t('addInsuranceMandatory.errors.vehicleNotFound', 'The selected vehicle was not found for this client. Please refresh and try again.');
                        break;
                    case 409:
                        errorMessage = t('addInsuranceMandatory.errors.companyNotFoundGeneric', 'The specified insurance company was not found.');
                        break;
                    
                }
            } else if (error.request) {
                errorMessage = t('addInsuranceMandatory.errors.networkError', 'Network error. Please check your connection and try again.');
            }

            setApiMessage({ text: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    const paymentMethodOptions = [
        { value: "cash", labelKey: "addInsuranceMandatory.paymentMethods.cash" },
        { value: "card", labelKey: "addInsuranceMandatory.paymentMethods.card" },
        { value: "check", labelKey: "addInsuranceMandatory.paymentMethods.check" },
        { value: "bank_transfer", labelKey: "addInsuranceMandatory.paymentMethods.bankTransfer" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => { if (!loading) onClose(); }}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-navbarBack z-10 px-0 pt-0">
                    <h2 className="text-xl font-semibold dark:text-white">{t('addInsuranceMandatory.title', 'Add New Insurance')}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}><X className="w-5 h-5" /></button>
                </div>

                <div className="overflow-y-auto hide-scrollbar flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4 pr-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                            {/* Insurance Type */}
                            <div>
                                <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addInsuranceMandatory.labels.insuranceType', 'Insurance Type')} <span className="text-red-500">*</span></label>
                                <input type="text" id="insuranceType" name="insuranceType" value={formData.insuranceType} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder={t('addInsuranceMandatory.placeholders.insuranceType', 'e.g., Comprehensive')} />
                            </div>
                            {/* isUnder24 */}
                            <div>
                                <label htmlFor="isUnder24" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addInsuranceMandatory.labels.isUnder24', 'Driver Under 24?')} <span className="text-red-500">*</span></label>
                                <select id="isUnder24" name="isUnder24" value={formData.isUnder24} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                                    <option value="false">{t('addInsuranceMandatory.options.no', 'No')}</option>
                                    <option value="true">{t('addInsuranceMandatory.options.yes', 'Yes')}</option>
                                </select>
                            </div>
                            {/* Insurance Company */}


                      
                            <div>
                                <label htmlFor="insuranceCompany" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('insuranceCompany.labels.insuranceCompany', 'insuranceCompany')} <span className="text-red-500">*</span>
                                </label>
                                <select id="insuranceCompany" name="insuranceCompany" value={formData.insuranceCompany} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="">{t('insuranceCompany.options.chooseinsuranceCompany', 'Choose insuranceCompany')}</option>
                                    {company.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>



                            {/* Payment Method */}
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addInsuranceMandatory.labels.paymentMethod', 'Payment Method')} <span className="text-red-500">*</span></label>
                                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                                    <option value="">{t('addInsuranceMandatory.options.choosePaymentMethod', 'Choose Payment Method')}</option>
                                    {paymentMethodOptions.map((methodOpt) => (
                                        <option key={methodOpt.value} value={methodOpt.value}>{t(methodOpt.labelKey, methodOpt.value)}</option>
                                    ))}
                                </select>
                            </div>
                                {/* Agent (Dropdown) */}
                            <div>
                                <label htmlFor="agent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('addInsuranceMandatory.labels.agent', 'Agent')} <span className="text-red-500">*</span>
                                </label>
                                <select id="agent" name="agent" value={formData.agent} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="">{t('addInsuranceMandatory.options.chooseAgent', 'Choose Agent')}</option>
                                    {agents.map(agent => (
                                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Insurance Amount */}
                            <div>
                                <label htmlFor="insuranceAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addInsuranceMandatory.labels.insuranceAmount', 'Insurance Amount')} <span className="text-red-500">*</span></label>
                                <input type="number" id="insuranceAmount" name="insuranceAmount" value={formData.insuranceAmount} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder={t('addInsuranceMandatory.placeholders.insuranceAmount', "Enter Insurance Amount")} step="any" />
                            </div>
                            {/* Paid Amount */}
                            <div>
                                <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addInsuranceMandatory.labels.paidAmount', 'Paid Amount')} <span className="text-red-500">*</span></label>
                                <input type="number" id="paidAmount" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder={t('addInsuranceMandatory.placeholders.paidAmount', "Enter Paid Amount")} step="any" />
                            </div>
                            {/* Payment Date */}
                            <div>
                                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addInsuranceMandatory.labels.paymentDate', 'Payment Date')} <span className="text-red-500">*</span></label>
                                <input type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:[color-scheme:dark]" />
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addInsuranceMandatory.labels.attachments', 'Attachments (Optional)')}</label>
                            {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                    {files.map((file, index) => (
                                        <FilePreview key={index} file={file} onRemove={() => handleRemoveFile(index)} />
                                    ))}
                                </div>
                            )}
                            <div onClick={handleBrowseClick} className={`relative flex cursor-pointer flex-col items-center justify-center h-40 border-2 border-dashed rounded-md transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
                                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}>{t('addInsuranceMandatory.dropArea.clickToUpload', 'Click to upload')}</span> {t('addInsuranceMandatory.dropArea.orDragAndDrop', 'or drag and drop')}</p>
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.png,.jpg,.jpeg" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                        </div>

                        <div className="flex justify-end pt-2 sticky bottom-0 bg-white dark:bg-navbarBack z-10 pb-4 px-0">
                            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 mr-2 rtl:ml-2 rtl:mr-0 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                                {t('addInsuranceMandatory.buttons.cancel', 'Cancel')}
                            </button>
                            <button type="submit" disabled={loading} className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''} flex items-center justify-center w-32`}>
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    t('addInsuranceMandatory.buttons.add', 'Add Insurance')
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}

export default AddInsuranceMandatory;