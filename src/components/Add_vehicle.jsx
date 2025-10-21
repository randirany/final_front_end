import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { vehicleApi } from "../services/vehicleApi";
import { toast } from "react-toastify";

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
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchingVehicleData, setFetchingVehicleData] = useState(false);
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
        const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileInputChange = (e) => {
        if (e.target.files?.length > 0) setFiles(Array.from(e.target.files));
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) setFiles(Array.from(e.dataTransfer.files));
    };
    const handleBrowseClick = () => fileInputRef.current?.click();

    // Fetch vehicle data when plate number is entered
    const handlePlateNumberBlur = async () => {
        const plateNumber = formData.plateNumber;
        if (!plateNumber || plateNumber.toString().trim() === "") {
            return;
        }

        try {
            setFetchingVehicleData(true);
            toast.info(t("customers.vehicles.messages.fetchingData", "جاري جلب بيانات المركبة..."), {
                position: "top-center",
                autoClose: 2000,
            });

            const response = await vehicleApi.getVehicleDataByPlate(plateNumber);

            // Check if we have data
            if (response && response.data && response.data.length > 0) {
                // Use the first vehicle in the results
                const vehicleData = response.data[0];

                // Format the date fields from the API
                const formatDate = (dateStr) => {
                    if (!dateStr) return "";
                    try {
                        const date = new Date(dateStr);
                        return date.toISOString().split('T')[0];
                    } catch {
                        return "";
                    }
                };

                // Map the API fields to form fields
                setFormData(prev => ({
                    ...prev,
                    model: vehicleData.tozeret_nm || prev.model, // Manufacturer name
                    type: vehicleData.kinuy_mishari || vehicleData.degem_nm || prev.type, // Commercial name or model
                    ownership: vehicleData.baalut || prev.ownership, // Ownership type
                    modelNumber: vehicleData.misgeret || prev.modelNumber, // Chassis/VIN
                    color: vehicleData.tzeva_rechev || prev.color, // Color
                    price: prev.price, // Price not in API
                    licenseExpiry: formatDate(vehicleData.tokef_dt) || prev.licenseExpiry, // License expiry
                    lastTest: formatDate(vehicleData.mivchan_acharon_dt) || prev.lastTest, // Last test date
                }));

                const message = response.count > 1
                    ? t("customers.vehicles.messages.dataFetchedMultiple", `تم جلب بيانات المركبة بنجاح (تم العثور على ${response.count} مركبات، تم استخدام الأولى)`)
                    : t("customers.vehicles.messages.dataFetched", "تم جلب بيانات المركبة بنجاح");

                toast.success(message, {
                    position: "top-center",
                    autoClose: 4000,
                });
            } else {
                toast.warning(t("customers.vehicles.messages.dataNotFound", "لم يتم العثور على بيانات للمركبة. يرجى إدخال البيانات يدوياً"), {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            const errorMessage = error.response?.data?.message || t("customers.vehicles.messages.dataNotFound", "لم يتم العثور على بيانات للمركبة. يرجى إدخال البيانات يدوياً");
            toast.warning(errorMessage, {
                position: "top-center",
                autoClose: 3000,
            });
        } finally {
            setFetchingVehicleData(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        // Client-side validation
        const requiredFields = [
            { key: 'plateNumber', msg: t("customers.vehicles.validation.plateRequired") },
            { key: 'model', msg: t("customers.vehicles.validation.modelRequired") },
            { key: 'type', msg: t("customers.vehicles.validation.typeRequired") },
            { key: 'ownership', msg: t("customers.vehicles.validation.ownershipRequired") },
            { key: 'modelNumber', msg: t("customers.vehicles.validation.chassisRequired") },
            { key: 'licenseExpiry', msg: t("customers.vehicles.validation.licenseExpiryRequired") },
            { key: 'lastTest', msg: t("customers.vehicles.validation.lastTestRequired") },
            { key: 'color', msg: t('customers.vehicles.validation.colorRequired') },
            { key: 'price', msg: t('customers.vehicles.validation.priceRequired') },
        ];

        for (let field of requiredFields) {
            if (!formData[field.key] || formData[field.key].toString().trim() === "") {
                setApiMessage({ text: field.msg, type: 'error' });
                return;
            }
        }

        if (!insuredId) {
            setApiMessage({ text: t("customers.vehicles.messages.insuredIdMissing"), type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const token = `islam__${localStorage.getItem("token")}`;
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (files.length > 0) data.append('image', files[0]);

        try {
            const response = await axios.post(
                `http://localhost:3002/api/v1/insured/addCar/${insuredId}`,
                data,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );

            setIsSubmitting(false);
            setApiMessage({ text: t(response.data.messageKey, 'Vehicle added successfully!'), type: 'success' });

            // 🔹 مباشرة للبروفايل بعد الإضافة
            navigate(`/profile/${insuredId}`);
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


    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isSubmitting && !fetchingVehicleData) {
            if (onClose && typeof onClose === 'function') {
                onClose();
            }
        }
    };

    const handleCloseClick = () => {
        if (!isSubmitting && !fetchingVehicleData) {
            if (onClose && typeof onClose === 'function') {
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleBackdropClick}>
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-2xl font-semibold dark:text-white">{t("customers.vehicles.addModal.title", "Add New Vehicle")}</h2>
                    <button
                        onClick={handleCloseClick}
                        disabled={isSubmitting || fetchingVehicleData}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="plateNumber" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.plateNumber", "Vehicle Plate Number")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="plateNumber"
                                    name="plateNumber"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.plateNumber", "Enter Plate Number")}
                                    value={formData.plateNumber}
                                    onChange={handleInputChange}
                                    onBlur={handlePlateNumberBlur}
                                    disabled={fetchingVehicleData}
                                />
                                {fetchingVehicleData && (
                                    <p className="mt-1 text-sm text-blue-500">{t("customers.vehicles.messages.fetching", "جاري جلب البيانات...")}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="model" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.modelName", "Vehicle Model/Name")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="model"
                                    name="model"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.modelName", "e.g., Toyota Camry")}
                                    value={formData.model}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.type", "Vehicle Type")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="type"
                                    name="type"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.type", "e.g., Sedan, SUV")}
                                    value={formData.type}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="modelNumber" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.chassisNumber", "Chassis Number (VIN)")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="modelNumber"
                                    name="modelNumber"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.chassisNumber", "Enter Chassis Number")}
                                    value={formData.modelNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="ownership" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.ownership", "Ownership")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="ownership"
                                    name="ownership"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.ownership", "e.g., Private, Company")}
                                    value={formData.ownership}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="color" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.color", "Vehicle Color")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="color"
                                    name="color"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.color", "e.g., Red, Blue")}
                                    value={formData.color}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="licenseExpiry" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.licenseExpiry", "License Expiry Date")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="licenseExpiry"
                                    name="licenseExpiry"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.licenseExpiry}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="lastTest" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.lastTestDate", "Last Test Date")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="lastTest"
                                    name="lastTest"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.lastTest}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    {t("customers.vehicles.labels.price", "Vehicle Price")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    className="w-full p-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t("customers.vehicles.placeholders.price", "Enter Vehicle Price")}
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    step="any"
                                />
                            </div>
                        </div>

                        {/* Error/Success Message */}
                        {apiMessage.text && (
                            <div className="mt-4">
                                <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                            </div>
                        )}
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="flex gap-3 justify-end px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <button
                            type="button"
                            onClick={handleCloseClick}
                            disabled={isSubmitting || fetchingVehicleData}
                            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {t("common.cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || fetchingVehicleData}
                            className="px-6 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? t("customers.vehicles.buttons.submittingAdd", "Submitting...") : t("customers.vehicles.buttons.submitAdd", "Submit Vehicle")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
export default Add_vehicle;

