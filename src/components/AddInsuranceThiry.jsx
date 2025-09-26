import { useState, useRef, useEffect } from "react"; 
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';

function AddInsuranceThiry({ onClose, isOpen, onSubmitSuccess }) { 
    const { t, i18n: { language } } = useTranslation();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        insuranceType: "",
        customerUnder24: "No", 
        insuranceCompany: "",
        paymentMethod: "",
        dealer: "",
        insuranceAmount: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                startDate: "",
                endDate: "",
                insuranceType: "",
                customerUnder24: "No",
                insuranceCompany: "",
                paymentMethod: "",
                dealer: "",
                insuranceAmount: "",
            });
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [isOpen]);


    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                if (!isSubmitting) onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, isSubmitting]);


    if (!isOpen) return null;


    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(newFiles);
        }
    };

    const handleInputChange = (e) => { 
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(newFiles);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Form Data:", formData);
        console.log("Files:", files);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        alert(t("addInsuranceThird.alerts.submitSuccess", "Insurance submitted (simulated)!"));
        if (onSubmitSuccess) onSubmitSuccess(); 
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
            onClick={() => { if (!isSubmitting) onClose(); }}>
            <div className="w-full max-w-[800px] bg-[rgb(255,255,255)] rounded-lg shadow-lg p-6 dark:bg-navbarBack max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>

                <div className="flex items-center justify-between pb-1 px-4 py-1 rounded-md border-b dark:border-gray-700 mb-4">
                    <h2 className="text-2xl font-semibold rounded-md dark:text-[rgb(255,255,255)]">
                        {t("addInsuranceThird.title", "Add New Third Party Insurance")}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300" disabled={isSubmitting}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4 rounded-md">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-[16px] font-semibold px-4 py-2 rounded-md dark:text-gray-300">
                            {t("addInsuranceThird.formTitle", "New Insurance Form")}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.startDate", "Start Date")}</label>
                            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF] dark:[color-scheme:dark]" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.endDate", "End Date")}</label>
                            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF] dark:[color-scheme:dark]" />
                        </div>
                        <div>
                            <label htmlFor="insuranceType" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.insuranceType", "Insurance Type")}</label>
                            <select id="insuranceType" name="insuranceType" value={formData.insuranceType} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF]">
                                <option value="" disabled>{t("addInsuranceThird.options.chooseType", "Choose Type")}</option>
                                <option value="third_party">{t("addInsuranceThird.options.thirdParty", "Third Party")}</option>
                                {/* Add other relevant types */}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="customerUnder24" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.customerUnder24", "Is Customer Under 24?")}</label>
                            <select id="customerUnder24" name="customerUnder24" value={formData.customerUnder24} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF]">
                                <option value="Yes">{t("addInsuranceThird.options.yes", "Yes")}</option>
                                <option value="No">{t("addInsuranceThird.options.no", "No")}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="insuranceCompany" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.insuranceCompany", "Insurance Company")}</label>
                            <select id="insuranceCompany" name="insuranceCompany" value={formData.insuranceCompany} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF]">
                                <option value="" disabled>{t("addInsuranceThird.options.chooseCompany", "Choose Insurance Company")}</option>
                                {/* Populate with actual companies */}
                                <option value="companyA">{t("companies.companyA", "Company A")}</option>
                                <option value="companyB">{t("companies.companyB", "Company B")}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.paymentMethod", "Payment Method")}</label>
                            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF]">
                                <option value="" disabled>{t("addInsuranceThird.options.choosePayment", "Choose Payment Method")}</option>
                                <option value="cash">{t("paymentMethods.cash", "Cash")}</option>
                                <option value="visa">{t("paymentMethods.visa", "Visa")}</option>
                                <option value="bank_transfer">{t("paymentMethods.bankTransfer", "Bank Transfer")}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dealer" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.dealer", "Dealer")}</label>
                            <select id="dealer" name="dealer" value={formData.dealer} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md text-[#9CA3AF]">
                                <option value="" disabled>{t("addInsuranceThird.options.chooseDealer", "Choose Dealer")}</option>
                                {/* Populate with actual dealers */}
                                <option value="dealerX">{t("dealers.dealerX", "Dealer X")}</option>
                                <option value="dealerY">{t("dealers.dealerY", "Dealer Y")}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="insuranceAmount" className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.insuranceAmount", "Insurance Amount")}</label>
                            <input type="number" id="insuranceAmount" name="insuranceAmount" value={formData.insuranceAmount} onChange={handleInputChange} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md" placeholder={t("addInsuranceThird.placeholders.insuranceAmount", "Enter Insurance Amount")} />
                        </div>
                    </div>

                    <div className='px-4'>
                        <label className="block text-sm font-medium dark:text-gray-300">{t("addInsuranceThird.labels.attachments", "Attachments")}</label>
                        <div
                            onClick={handleBrowseClick}
                            ref={dropAreaRef}
                            className={`w-full relative flex cursor-pointer h-[80px] flex-col items-center justify-center border-2 border-dashed rounded-md bg-gray-50 dark:bg-gray-700/30 transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center text-center py-1">
                                <svg width="30" height="30" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 dark:text-gray-500">
                                    <g filter="url(#filter0_d_77_976)">
                                        <rect x="2.62695" y="1.06055" width="60" height="60" rx="30" fill="currentColor" className="text-[rgb(255,255,255)] dark:text-gray-800" shapeRendering="crispEdges" />
                                        <g clipPath="url(#clip0_77_976)">
                                            <path d="M41.377 34.8105C41.002 34.8105 40.6582 35.123 40.6582 35.5293V38.3105C40.6582 38.5918 40.4395 38.8105 40.1582 38.8105H25.0957C24.8145 38.8105 24.5957 38.5918 24.5957 38.3105V35.5293C24.5957 35.123 24.252 34.8105 23.877 34.8105C23.502 34.8105 23.1582 35.123 23.1582 35.5293V38.3105C23.1582 39.373 24.002 40.2168 25.0645 40.2168H40.1582C41.2207 40.2168 42.0645 39.373 42.0645 38.3105V35.5293C42.0957 35.123 41.752 34.8105 41.377 34.8105Z" fill="currentColor" className="text-gray-600 dark:text-gray-400" />
                                            <path d="M28.5957 27.5293L31.9395 24.2793V35.0918C31.9395 35.4668 32.252 35.8105 32.6582 35.8105C33.0332 35.8105 33.377 35.498 33.377 35.0918V24.2793L36.7207 27.5293C36.8457 27.6543 37.0332 27.7168 37.2207 27.7168C37.4082 27.7168 37.5957 27.6543 37.7207 27.498C38.002 27.2168 37.9707 26.7793 37.7207 26.498L33.127 22.123C32.8457 21.873 32.4082 21.873 32.1582 22.123L27.5957 26.5293C27.3145 26.8105 27.3145 27.248 27.5957 27.5293C27.877 27.7793 28.3145 27.8105 28.5957 27.5293Z" fill="currentColor" className="text-gray-600 dark:text-gray-400" />
                                        </g>
                                    </g>
                                    <defs>
                                        <filter id="filter0_d_77_976" x="0.626953" y="0.0605469" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                            <feOffset dy="1" />
                                            <feGaussianBlur stdDeviation="1" />
                                            <feComposite in2="hardAlpha" operator="out" />
                                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_77_976" />
                                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_77_976" result="shape" />
                                        </filter>
                                        <clipPath id="clip0_77_976">
                                            <rect width="20" height="20" fill="currentColor" className="text-[rgb(255,255,255)]" transform="translate(22.627 21.0605)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div>
                                    <p className="text-md text-gray-600 dark:text-gray-400">
                                        {files.length > 0
                                            ? t("addInsuranceThird.dropArea.filesSelected", "{{count}} file(s) selected", { count: files.length })
                                            : t("addInsuranceThird.dropArea.dropOrClick", "Drop Files here or click to upload")}
                                    </p>
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} />
                                </div>
                            </div>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-2 text-sm dark:text-gray-300">
                                <ul className="list-disc pl-5">
                                    {files.map((file, index) => (
                                        <li key={index} className="truncate" title={file.name}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end px-4 pt-4 border-t dark:border-gray-700 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            {t("common.cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-medium text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? t("addInsuranceThird.buttons.submitting", "Submitting...") : t("addInsuranceThird.buttons.submit", "Submit")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInsuranceThiry;