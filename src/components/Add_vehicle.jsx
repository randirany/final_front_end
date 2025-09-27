import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);
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

function Add_vehicle({ onClose, isOpen, onVehicleAdded, insuredId }) {
      const navigate = useNavigate(); // ✅ هنا
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        plateNumber: '',
        model: '',
        type: '',
        ownership: '',
        modelNumber: '',
        licenseExpiry: '',
        lastTest: '',
        color: '',
        price: ''
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
        if (isOpen) {
            setFormData({
                plateNumber: '', model: '', type: '', ownership: '', modelNumber: '',
                licenseExpiry: '', lastTest: '', color: '', price: ''
            });
            setFiles([]);
            setApiMessage({ text: '', type: '' });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileInputChange = (e) => {
        if (e.target.files?.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };




    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        // Client-Side Validation
        if (!formData.plateNumber.trim()) {
            setApiMessage({ text: t("customers.vehicles.validation.plateRequired"), type: 'error' });
            return;
        }
        if (!formData.model.trim()) {
            setApiMessage({ text: t("customers.vehicles.validation.modelRequired"), type: 'error' });
            return;
        }
        if (!formData.type.trim()) {
            setApiMessage({ text: t("customers.vehicles.validation.typeRequired"), type: 'error' });
            return;
        }
        if (!formData.ownership.trim()) {
            setApiMessage({ text: t("customers.vehicles.validation.ownershipRequired"), type: 'error' });
            return;
        }
        if (!formData.modelNumber.trim()) {
            setApiMessage({ text: t("customers.vehicles.validation.chassisRequired"), type: 'error' });
            return;
        }
        if (!formData.licenseExpiry) {
            setApiMessage({ text: t("customers.vehicles.validation.licenseExpiryRequired"), type: 'error' });
            return;
        }
        if (!formData.lastTest) {
            setApiMessage({ text: t("customers.vehicles.validation.lastTestRequired"), type: 'error' });
            return;
        }
        if (!formData.color.trim()) {
            setApiMessage({ text: t('customers.vehicles.validation.colorRequired'), type: 'error' });
            return;
        }

        if (!formData.price.toString().trim()) {
            setApiMessage({ text: t('customers.vehicles.validation.priceRequired'), type: 'error' });
            return;
        }

        if (!insuredId) {
            setApiMessage({ text: t("customers.vehicles.messages.insuredIdMissing"), type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const token = `islam__${localStorage.getItem("token")}`;
        const data = new FormData();

        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        if (files.length > 0) {
            data.append('image', files[0]);
        }

        try {
            const response = await axios.post(
                `http://localhost:3002/api/v1/insured/addCar/${insuredId}`,
                data,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );

       setIsSubmitting(false);
            const vehicleId = response.data.savedVehicle?._id; // تأكد API يرجع vehicleId
            setApiMessage({ text: t(response.data.messageKey, 'Vehicle added successfully!'), type: 'success' });

            // 🔹 بعد الحفظ، نسأل هل يريد إضافة تأمين
            const addInsurance = await MySwal.fire({
                title: t("customers.addInsurance.title", "Add Insurance?"),
                text: t("customers.addInsurance.text", "Do you want to add insurance for this vehicle?"),
                icon: "question",
                showCancelButton: true,
                confirmButtonText: t("common.yes", "Yes"),
                cancelButtonText: t("common.no", "No"),
                reverseButtons: true,
            });

            if (addInsurance.isConfirmed) {
                // إذا ضغط نعم، ينقل لفورم إضافة التأمين
                navigate(`/insured/${insuredId}/${vehicleId}`);
            }

            // سواء ضغط نعم أو لا، يمكننا إغلاق الفورم
            if (onVehicleAdded) onVehicleAdded();
            onClose();

        } catch (error) {
            setIsSubmitting(false);
            if (error.response) {
                const status = error.response.status;
                let messageKey = error.response.data.messageKey || 'errors.unknown';
                if (status === 404) messageKey = 'errors.insured.notFound';
                setApiMessage({ text: t(messageKey, "Failed to add vehicle."), type: 'error' });
            } else {
                setApiMessage({ text: t("errors.network", "Network error."), type: 'error' });
            }
        }
    };


















    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };
    const handleBrowseClick = () => fileInputRef.current?.click();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack h-[90vh] overflow-y-auto hide-scrollbar flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-1 p-2 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-semibold dark:text-white">{t("customers.vehicles.addModal.title", "Add New Vehicle")}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="mt-2 space-y-4 rounded-md pt-3" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.modelName", "Vehicle Model/Name")}</label>
                            <input type="text" id="model" name="model"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.modelName", "e.g., Toyota Camry")}
                                value={formData.model} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="plateNumber" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.plateNumber", "Vehicle Plate Number")}</label>
                            <input type="text" id="plateNumber" name="plateNumber"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.plateNumber", "Enter Plate Number")}
                                value={formData.plateNumber} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="modelNumber" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.chassisNumber", "Chassis Number (VIN)")}</label>
                            <input type="text" id="modelNumber" name="modelNumber"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.chassisNumber", "Enter Chassis Number")}
                                value={formData.modelNumber} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.type", "Vehicle Type")}</label>
                            <input type="text" id="type" name="type"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.type", "e.g., Sedan, SUV")}
                                value={formData.type} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="ownership" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.ownership", "Ownership")}</label>
                            <input type="text" id="ownership" name="ownership"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.ownership", "e.g., Private, Company")}
                                value={formData.ownership} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="licenseExpiry" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.licenseExpiry", "License Expiry Date")}</label>
                            <input type="date" id="licenseExpiry" name="licenseExpiry"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]"
                                value={formData.licenseExpiry} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="lastTest" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.lastTestDate", "Last Test Date")}</label>
                            <input type="date" id="lastTest" name="lastTest"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]"
                                value={formData.lastTest} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.color", "Vehicle Color")}</label>
                            <input type="text" id="color" name="color"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.color", "e.g., Red, Blue")}
                                value={formData.color} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.price", "Vehicle Price")}</label>
                            <input type="number" id="price" name="price"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("customers.vehicles.placeholders.price", "Enter Vehicle Price")}
                                value={formData.price} onChange={handleInputChange} step="any" />
                        </div>
                    </div>

                    <div className="px-4">
                        <label className="block text-sm font-medium dark:text-gray-300">{t("customers.vehicles.labels.imageOptional", "Vehicle Image (Optional)")}</label>
                        <div
                            onClick={handleBrowseClick} ref={dropAreaRef}
                            className={`relative flex cursor-pointer flex-col items-center justify-center h-48 border-2 border-dashed rounded-md transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/30"}`}
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
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{t("fileUploadModal.dropArea.clickToUpload", "Click to upload")}</span> {t("fileUploadModal.dropArea.orDragAndDrop", "or drag and drop")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-4 pt-2">
                        <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                    </div>

                    <div className="flex gap-2 justify-end px-4 pt-4 border-t dark:border-gray-700">
                        <button type="submit" disabled={isSubmitting}
                            className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                            {isSubmitting ? t("customers.vehicles.buttons.submittingAdd", "Submitting...") : t("customers.vehicles.buttons.submitAdd", "Submit Vehicle")}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSubmitting}
                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
                            {t("common.cancel", "Cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
export default Add_vehicle;

