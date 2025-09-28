import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

// مكون مساعد لعرض الرسائل داخل النموذج
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

const INITIAL_FORM_STATE_ADD_CHECK = {
    checkNumber: "",
    checkDueDate: "",
    checkAmount: "",
    isReturned: "false",
};

function AddCheckModal({ isOpen, onClose, insuredId, vehicleId, insuranceId, onCheckAdded }) {
    const { t, i18n: { language } } = useTranslation();

    const [formData, setFormData] = useState(INITIAL_FORM_STATE_ADD_CHECK);
    const [checkImageFile, setCheckImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, loading]);

    useEffect(() => {
        if (isOpen) {
            setFormData(INITIAL_FORM_STATE_ADD_CHECK);
            setCheckImageFile(null);
            setApiMessage({ text: '', type: '' });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (selectedFiles) => {
        setCheckImageFile(selectedFiles && selectedFiles.length > 0 ? selectedFiles[0] : null);
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
            if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
        }
    };
    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleFileInputChangeInternal = (e) => handleFileChange(e.target.files);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        // التحقق عبر JavaScript كخط دفاع ثانٍ
        if (!formData.checkNumber.trim()) {
            setApiMessage({ text: t('addCheckModal.validation.checkNumberRequired'), type: 'error' });
            return;
        }
        if (!formData.checkDueDate) {
            setApiMessage({ text: t('addCheckModal.validation.dueDateRequired'), type: 'error' });
            return;
        }
        if (!formData.checkAmount.toString().trim()) {
            setApiMessage({ text: t('addCheckModal.validation.amountRequired'), type: 'error' });
            return;
        }
        
        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'checkAmount') {
                    formDataToSubmit.append(key, Number(formData[key]));
                } else if (key === 'isReturned') {
                    formDataToSubmit.append(key, formData[key] === 'true');
                } else {
                    formDataToSubmit.append(key, formData[key]);
                }
            });
            if (checkImageFile) formDataToSubmit.append('checkImage', checkImageFile);

            const token = `islam__${localStorage.getItem("token")}`;
            const response = await axios.post(
                `http://localhost:3002/api/v1/insured/add/${insuredId}/${vehicleId}/${insuranceId}`,
                formDataToSubmit,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );
            
            // toast.success(response.data.message || t('addCheckModal.alerts.checkAddedSuccess'));
            if(response.status===200){
                            setApiMessage({ text: t('addCheckModal.successAdd'), type: 'success' });

            }
            
            setTimeout(() => {
                if (onCheckAdded) onCheckAdded(response.data.check);
                onClose();
            }, 1500);

        } catch (error) {
            
            let errorMessage = t('addCheckModal.alerts.addCheckFailed');
            if (error.response) {
                const { status, data } = error.response;
                const backendMessage = data?.message;
                switch (status) {
                    case 404: errorMessage = t('addCheckModal.errors.insuredNotFound'); break;
                    case 407: errorMessage = t('addCheckModal.errors.vehicleNotFound'); break;
                    case 409: errorMessage = t('addCheckModal.errors.insuranceNotFound'); break;
                    case 400: errorMessage = backendMessage || t('addCheckModal.errors.invalidRequest'); break;
                    default: if (backendMessage) errorMessage = backendMessage; break;
                }
            } else if (error.request) {
                errorMessage = t('errors.networkError');
            }
            
            setApiMessage({ text: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => !loading && onClose()}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack h-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-navbarBack z-10">
                    <h2 className="text-xl font-semibold dark:text-white">{t('addCheckModal.title')}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto hide-scrollbar flex-grow pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="checkNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addCheckModal.labels.checkNumber')} <span className="text-red-500">*</span></label>
                            <input type="text" id="checkNumber" name="checkNumber" value={formData.checkNumber} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm" placeholder={t('addCheckModal.placeholders.checkNumber')}  />
                        </div>
                        <div>
                            <label htmlFor="checkDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addCheckModal.labels.checkDueDate')} <span className="text-red-500">*</span></label>
                            <input type="date" id="checkDueDate" name="checkDueDate" value={formData.checkDueDate} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm dark:[color-scheme:dark]"  />
                        </div>
                        <div>
                            <label htmlFor="checkAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addCheckModal.labels.checkAmount')} <span className="text-red-500">*</span></label>
                            <input type="number" id="checkAmount" name="checkAmount" value={formData.checkAmount} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm" placeholder={t('addCheckModal.placeholders.checkAmount')}  step="any" min="0.01" />
                        </div>
                        <div>
                            <label htmlFor="isReturned" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('addCheckModal.labels.isReturned')}</label>
                            <select id="isReturned" name="isReturned" value={formData.isReturned} onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                                <option value="false">{t('addCheckModal.options.no')}</option>
                                <option value="true">{t('addCheckModal.options.yes')}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addCheckModal.labels.checkImage')}</label>
                        <div onClick={handleBrowseClick} className={`relative flex cursor-pointer flex-col items-center justify-center h-40 border-2 border-dashed rounded-md transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                            <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{t('addCheckModal.dropArea.clickToUpload')}</span> {t('addCheckModal.dropArea.orDragAndDrop')}</p>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileInputChangeInternal} />
                            </div>
                        </div>
                        {checkImageFile && (
                            <div className="mt-3 text-sm dark:text-gray-300">
                                <div className="flex items-center justify-between mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                    <span className="truncate" title={checkImageFile.name}>{checkImageFile.name} <span className="text-xs text-gray-500">({(checkImageFile.size / 1024).toFixed(1)} KB)</span></span>
                                    <button type="button" onClick={() => { setCheckImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="ml-2 text-red-500 hover:text-red-700"><X size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-2">
                        <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                    </div>

                    <div className="flex justify-end  sticky bottom-0 bg-white dark:bg-navbarBack z-10">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50">{t('addCheckModal.buttons.cancel')}</button>
                        <button type="submit" disabled={loading} className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 w-32 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t('addCheckModal.buttons.add')}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer position={(language === "ar" || language === "he") ? "top-left" : "top-right"} autoClose={2000} hideProgressBar />
        </div>
    );
}

export default AddCheckModal;