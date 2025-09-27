import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";

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

function EditCustomer({ onClose, isOpen, customerData, onEditSuccess }) {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        id_Number: "",
        phone_number: "",
        city: "",
        birth_date: "",
        agentsName: "",
        notes: "",
        image: null,
        joining_date: ""
    });
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, isOpen]);

    useEffect(() => {
        if (isOpen && customerData) {
            setFormData({
                first_name: customerData.first_name || "",
                last_name: customerData.last_name || "",
                email: customerData.email || "",
                id_Number: customerData.id_Number || "",
                phone_number: customerData.phone_number || "",
                city: customerData.city || "",
                birth_date: customerData.birth_date ? customerData.birth_date.split('T')[0] : "",
                agentsName: customerData.agent || "",
                notes: customerData.notes || "",
                image: null,
                joining_date: customerData.joining_date ? customerData.joining_date.split('T')[0] : "",
            });
            setCurrentImageUrl(customerData.image || null);
            setFiles([]);
            setApiMessage({ text: '', type: '' });
        }
    }, [isOpen, customerData]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFiles([selectedFile]);
            setFormData((prev) => ({ ...prev, image: selectedFile }));
            setCurrentImageUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        if (!formData.first_name.trim()) {
            setApiMessage({ text: t('customers.validation.firstName'), type: 'error' });
            return;
        }
        if (!formData.last_name.trim()) {
            setApiMessage({ text: t('customers.validation.lastName'), type: 'error' });
            return;
        }
        if (!formData.email.trim()) {
            setApiMessage({ text: t('customers.validation.email'), type: 'error' });
            return;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            setApiMessage({ text: t('customers.validation.invalidEmail'), type: 'error' });
            return;
        }
        if (!formData.id_Number.toString().trim()) {
            setApiMessage({ text: t('customers.validation.id_Number'), type: 'error' });
            return;
        }
        if (!formData.phone_number.trim()) {
            setApiMessage({ text: t('customers.validation.phone_number'), type: 'error' });
            return;
        }
        if (!formData.city.trim()) {
            setApiMessage({ text: t('customers.validation.city'), type: 'error' });
            return;
        }
        if (!formData.birth_date) {
            setApiMessage({ text: t('customers.validation.birth_date'), type: 'error' });
            return;
        }

        if (!customerData || !customerData.id) {
            setApiMessage({ text: t("customers.messages.editErrorNoId", "Customer ID is missing."), type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        });

        const token = `islam__${localStorage.getItem("token")}`;

        try {
            const response = await axios.patch(
                `http://localhost:3002/api/v1/insured/updateInsured/${customerData.id}`,
                formDataToSend, { headers: { token, "Content-Type": "multipart/form-data" } }
            );
            setIsSubmitting(false);

            let successMessage = t('settings.error.updateSucces');

            setApiMessage({ text: successMessage, type: 'success' });

            setTimeout(() => {
                if (onEditSuccess) onEditSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            setIsSubmitting(false);
            if (error.response) {
                const status = error.response.status;
                let messageKey = 'errors.unknown';
                if (status === 409) {
                    messageKey = 'customers.validation.alreadyExists';
                } else if (status === 404) {
                    messageKey = error.response.data.messageKey || 'errors.notFound';
                }
                setApiMessage({ text: t(messageKey, "An error occurred."), type: 'error' });
            } else {
                setApiMessage({ text: t("errors.network", "Network error, please try again."), type: 'error' });
            }
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFile = e.dataTransfer.files[0];
            setFiles([selectedFile]);
            setFormData((prev) => ({ ...prev, image: selectedFile }));
            setCurrentImageUrl(null);
        }
    };
    const handleRemoveNewImage = () => {
        setFiles([]);
        setFormData(prev => ({ ...prev, image: null }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (customerData && customerData.image) setCurrentImageUrl(customerData.image);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack h-[90vh] overflow-y-auto hide-scrollbar flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-1 p-2 border-b">
                    <h2 className="text-2xl font-semibold">{t("customers.editCustomerTitle", "Edit Customer Information")}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.firstName")}</label>
                            <input type="text" id="first_name_edit" name="first_name"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.first_name} onChange={handleInputChange} />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.lastName")}</label>
                            <input type="text" id="last_name_edit" name="last_name"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.last_name} onChange={handleInputChange} />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.email")}</label>
                            <input type="email" id="email_edit" name="email"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.email} onChange={handleInputChange} />
                        </div>
                        {/* ID Number */}
                        <div>
                            <label htmlFor="id_Number_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.idNumber")}</label>
                            <input type="number" id="id_Number_edit" name="id_Number"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.id_Number} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="phone_number_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.mobile")}</label>
                            <input type="text" id="phone_number_edit" name="phone_number"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.phone_number} onChange={handleInputChange} />
                        </div>
                        {/* City */}
                        <div>
                            <label htmlFor="city_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.city")}</label>
                            <input type="text" id="city_edit" name="city"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.city} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
                        {/* Agent's Name */}
                        <div>
                            <label htmlFor="agentsName_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.agentName")}</label>
                            <input type="text" id="agentsName_edit" name="agentsName"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.agentsName} onChange={handleInputChange} />
                        </div>
                        {/* Birth Date */}
                        <div>
                            <label htmlFor="birth_date_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.birthDate")}</label>
                            <input type="date" id="birth_date_edit" name="birth_date"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.birth_date} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="notes_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.notes")}</label>
                            <textarea id="notes_edit" name="notes" rows="2"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.notes} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="joining_date_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("customers.labels.joiningDate")}</label>
                            <input type="date" id="joining_date_edit" name="joining_date"
                                className="w-full p-2 rounded-md border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white"
                                value={formData.joining_date} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="px-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("customers.labels.customerImageOptional", "Customer Image (Optional)")}
                        </label>
                        {currentImageUrl && !files.length && (
                            <div className="mt-2 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("customers.labels.currentImage", "Current Image:")}</p>
                                <img src={currentImageUrl} alt={t("customers.altText.currentCustomerImage", "Current customer image")} className="max-h-24 rounded border dark:border-gray-600" />
                            </div>
                        )}
                        <div
                            onClick={() => fileInputRef.current.click()} ref={dropAreaRef}
                            className={`mt-2 relative flex cursor-pointer flex-col items-center justify-center h-48 border-2 border-dashed rounded-md transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/30"}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        >
                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} accept="image/*" />
                            {files.length > 0 ? (
                                <div className="w-full h-full flex items-center justify-center p-2">
                                    <img src={URL.createObjectURL(files[0])} alt={files[0].name} className="max-h-full max-w-full object-contain rounded" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center p-4">
                                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{t("fileUploadModal.dropArea.clickToUpload")}</span> {t("fileUploadModal.dropArea.orDragAndDrop")}
                                    </p>
                                </div>
                            )}
                        </div>
                        {files.length > 0 && (
                            <div className="mt-2 flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                                <span>{t("customers.labels.newSelectedFile", "New file:")} {files[0].name}</span>
                                <button type="button" onClick={handleRemoveNewImage} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
                                    {t("customers.buttons.removeFile", "Remove")}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="px-4 pt-2">
                        <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                    </div>

                    <div className="flex justify-end px-4 gap-2 pt-4 border-t dark:border-gray-700">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                            {isSubmitting ? t("common.saving", "Saving...") : t("common.save", "Save Changes")}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
                            {t("common.cancel", "Cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCustomer;