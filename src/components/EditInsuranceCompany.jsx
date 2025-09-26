import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

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


function EditInsuranceCompany({ onClose, isOpen, companyData, onEditSuccess }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("private_car");
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' }); // <-- حالة جديدة للرسائل
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        address: "",
        insuranceType: "الزامي",
    });

    const initialRates = {
        "تحت_24": '',
        "فوق_24": '',
        "مبلغ_العرض": '',
        "الحد_الأدنى_لـ_60_ألف": ''
    };

    const [vehicleCategories, setVehicleCategories] = useState([
        { key: "private_car", label: t("insuranceCompany.tabs.privateCar"), rates: { ...initialRates } },
        { key: "commercial_car", label: t("insuranceCompany.tabs.commercialCar"), rates: { ...initialRates } },
        { key: "motorcycle", label: t("insuranceCompany.tabs.motorcycle"), rates: { ...initialRates } }
    ]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, isOpen, loading]);

    useEffect(() => {
        if (isOpen && companyData) {
            setFormData({
                name: companyData.name || "",
                contact: companyData.contact || "",
                address: companyData.address || "",
                insuranceType: companyData.insuranceType || "الزامي",
            });

            if (companyData.insuranceType !== "الزامي" && companyData.rates) {
                const updatedCategories = vehicleCategories.map(category => ({
                    ...category,
                    label: t(`insuranceCompany.tabs.${category.key}`), // تحديث التسميات عند تغيير اللغة
                    rates: { ...initialRates, ...(companyData.rates[category.key] || {}) }
                }));
                setVehicleCategories(updatedCategories);
                const firstCategoryWithRates = Object.keys(companyData.rates)[0];
                setActiveTab(firstCategoryWithRates || "private_car");
            } else {
                setVehicleCategories(prev => prev.map(cat => ({ ...cat, rates: { ...initialRates } })));
                setActiveTab("private_car");
            }
            setErrors({});
            setApiMessage({ text: '', type: '' }); 
        }
    }, [isOpen, companyData, t]);


    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleRateChange = (categoryKey, field, value) => {
        const numValue = value === "" ? "" : Number(value);
        setVehicleCategories(prev =>
            prev.map(cat =>
                cat.key === categoryKey ? { ...cat, rates: { ...cat.rates, [field]: numValue } } : cat
            )
        );
        const errorKey = `${categoryKey}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t("validation.companyNameRequired");
        if (!formData.contact.trim()) newErrors.contact = t("validation.contactRequired");
        if (!formData.address.trim()) newErrors.address = t("validation.addressRequired");
        if (!formData.insuranceType) newErrors.insuranceType = t("validation.insuranceTypeRequired");

        if (formData.insuranceType !== "الزامي") {
            vehicleCategories.forEach(category => {
                rateFieldsConfig.forEach(rateField => {
                    const rateValue = category.rates[rateField.field];
                    if (isNaN(Number(rateValue)) || Number(rateValue) <= 0) {
                        newErrors[`${category.key}_${rateField.field}`] = t("validation.rateRequiredStrictlyPositive");
                    }
                });
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' }); // <-- مسح الرسائل عند الإرسال

        if (!validateForm()) {
            setApiMessage({ text: t("validation.formErrors"), type: 'error' });
            return;
        }

        if (!companyData || !companyData.id) {
            setApiMessage({ text: t("insuranceCompany.editErrorNoId"), type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const ratesPayload = {};
            if (formData.insuranceType !== "الزامي") {
                vehicleCategories.forEach((category) => {
                    ratesPayload[category.key] = {};
                    Object.keys(category.rates).forEach(rateKey => {
                        ratesPayload[category.key][rateKey] = Number(category.rates[rateKey]);
                    });
                });
            }

            const dataToSend = {
                name: formData.name,
                insuranceType: formData.insuranceType,
                contact: formData.contact,
                address: formData.address,
                ...(formData.insuranceType !== "الزامي" && { rates: ratesPayload }),
            };

            const response = await axios.patch(
                `http://localhost:3002/api/v1/company/updateInsuranceCompany/${companyData.id}`,
                dataToSend,
                { headers: { token: `islam__${token}` } }
            );

            // <<< التغيير الرئيسي هنا >>>
            setApiMessage({
                text: response.data.message || t("insuranceCompany.editSuccess"),
                type: 'success'
            });

            setTimeout(() => {
                if (onEditSuccess) onEditSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            const apiErrorMessage = error.response?.data?.message || error.message || t("insuranceCompany.editErrorGeneric");
            setApiMessage({ text: apiErrorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const rateFieldsConfig = [
        { field: "تحت_24", label: t("insuranceCompany.rates.under24") },
        { field: "فوق_24", label: t("insuranceCompany.rates.over24") },
        { field: "مبلغ_العرض", label: t("insuranceCompany.rates.offerAmount") },
        { field: "الحد_الأدنى_لـ_60_ألف", label: t("insuranceCompany.rates.minFor60k") },
    ];


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => !loading && onClose()}>
            <div className="w-full max-w-2xl bg-[rgb(255,255,255)] rounded-lg shadow-xl p-6 dark:bg-navbarBack h-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {t("insuranceCompany.editTitle")}
                    </h2>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="flex-grow overflow-y-auto hide-scrollbar space-y-4 pr-1" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="editCompanyName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.companyName")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" id="editCompanyName" name="name" value={formData.name} onChange={handleInputChange}
                                className={`mt-1 w-full p-2.5 border dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="editInsuranceType" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.insuranceType")} <span className="text-red-500">*</span>
                            </label>
                            <select id="editInsuranceType" name="insuranceType" value={formData.insuranceType} onChange={(e) => handleSelectChange("insuranceType", e.target.value)}
                                className={`mt-1 w-full p-2.5 border dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm ${errors.insuranceType ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="الزامي">{t("insuranceCompany.types.mandatory")}</option>
                                <option value="ثالث شامل">{t("insuranceCompany.types.comprehensive")}</option>
                            </select>
                             {errors.insuranceType && <p className="mt-1 text-xs text-red-500">{errors.insuranceType}</p>}
                        </div>
                        <div>
                            <label htmlFor="editContactNumber" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.contact")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" id="editContactNumber" name="contact" value={formData.contact} onChange={handleInputChange}
                                className={`mt-1 w-full p-2.5 border dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm ${errors.contact ? 'border-red-500' : 'border-gray-300'}`}
                            />
                             {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
                        </div>
                        <div>
                            <label htmlFor="editAddress" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.address")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" id="editAddress" name="address" value={formData.address} onChange={handleInputChange}
                                className={`mt-1 w-full p-2.5 border dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                            />
                             {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                        </div>
                    </div>

                    {formData.insuranceType !== "الزامي" && (
                        <div className="mt-6 border-t dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t("insuranceCompany.ratesTitle")}</h3>
                            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                                {vehicleCategories.map(category => (
                                    <button key={category.key} type="button" onClick={() => setActiveTab(category.key)}
                                        className={`px-4 py-2 text-sm font-medium focus:outline-none -mb-px ${activeTab === category.key ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}>
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {rateFieldsConfig.map(({ field, label }) => {
                                    const errorKey = `${activeTab}_${field}`;
                                    return (
                                        <div key={field}>
                                            <label htmlFor={`edit_${activeTab}_${field}`} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label} <span className="text-red-500">*</span></label>
                                            <input
                                                type="number" id={`edit_${activeTab}_${field}`} min="0" value={vehicleCategories.find(cat => cat.key === activeTab)?.rates[field] ?? ""}
                                                onChange={(e) => handleRateChange(activeTab, field, e.target.value)}
                                                className={`mt-1 w-full p-2.5 border dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm ${errors[errorKey] ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors[errorKey] && <p className="mt-1 text-xs text-red-500">{errors[errorKey]}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-4">
                        <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                    </div>

                    <div className="flex justify-end pt-2 sticky bottom-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50">
                            {t("common.cancel")}
                        </button>
                        <button type="submit" disabled={loading} className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 w-36 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("insuranceCompany.saveChangesButton")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditInsuranceCompany;