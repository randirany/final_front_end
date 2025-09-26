import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // يمكنك إبقاؤها إذا كنت تستخدمها في أماكن أخرى
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


function AddInsuranceCompany({ onClose, isOpen, onCompanyAdded }) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("private_car");
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

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
    
    useEffect(() => {
        if (isOpen) {
            setFormData({ name: "", contact: "", address: "", insuranceType: "الزامي" });
            const updatedCategories = [
                { key: "private_car", label: t("insuranceCompany.tabs.privateCar"), rates: { ...initialRates } },
                { key: "commercial_car", label: t("insuranceCompany.tabs.commercialCar"), rates: { ...initialRates } },
                { key: "motorcycle", label: t("insuranceCompany.tabs.motorcycle"), rates: { ...initialRates } }
            ];
            setVehicleCategories(updatedCategories);
            setActiveTab("private_car");
            setApiMessage({ text: '', type: '' });
        }
    }, [isOpen, t]);


    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, isOpen, loading]);


    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRateChange = (categoryKey, field, value) => {
        const numValue = value === "" ? "" : Number(value);
        setVehicleCategories((prevCategories) =>
            prevCategories.map((category) =>
                category.key === categoryKey
                    ? { ...category, rates: { ...category.rates, [field]: numValue } }
                    : category
            )
        );
    };

    const rateFieldsConfig = [
        { field: "تحت_24", label: t("insuranceCompany.rates.under24") },
        { field: "فوق_24", label: t("insuranceCompany.rates.over24") },
        { field: "مبلغ_العرض", label: t("insuranceCompany.rates.offerAmount") },
        { field: "الحد_الأدنى_لـ_60_ألف", label: t("insuranceCompany.rates.minFor60k") },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        // --- Start of Form Validation ---
        if (!formData.name.trim()) {
            setApiMessage({ text: t("validation.companyNameRequired"), type: 'error' });
            return;
        }
        if (!formData.contact.trim()) {
            setApiMessage({ text: t("validation.contactRequired"), type: 'error' });
            return;
        }
        if (!formData.address.trim()) {
            setApiMessage({ text: t("validation.addressRequired"), type: 'error' });
            return;
        }
        
        if (formData.insuranceType !== "الزامي") {
            for (const category of vehicleCategories) {
                for (const rateField of rateFieldsConfig) {
                    const rateValue = category.rates[rateField.field];
                    if (isNaN(Number(rateValue)) || Number(rateValue) <= 0) {
                        const errorMessage = `${category.label} - ${rateField.label}: ${t("validation.rateRequiredStrictlyPositive")}`;
                        setApiMessage({ text: errorMessage, type: 'error' });
                        return; 
                    }
                }
            }
        }
        // --- End of Form Validation ---

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

            const response = await axios.post("http://localhost:3002/api/v1/company/addInsuranceCompany", dataToSend, {
                headers: { token: `islam__${token}` }
            });


            setApiMessage({
                text:  t("insuranceCompany.addSuccess"),
                type: 'success'
            });
            
            setTimeout(() => {
                if (onCompanyAdded) onCompanyAdded();
                onClose(true);
            }, 1500);

        } catch (error) {
            const apiErrorMessage =  t("insuranceCompany.addErrorGeneric");
            setApiMessage({ text: apiErrorMessage, type: 'error' });
        } finally {
            // سنوقف التحميل مباشرة بعد الاستجابة، سواء كانت ناجحة أو فاشلة
            // ستبقى الرسالة ظاهرة في حالة النجاح بفضل المؤقت الزمني
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => !loading && onClose(false)}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack h-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-navbarBack z-10">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {t("insuranceCompany.addTitle")}
                    </h2>
                    <button type="button" onClick={() => onClose(false)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="flex-grow overflow-y-auto hide-scrollbar space-y-4 pr-1" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="companyName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.companyName")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" id="companyName" name="name" value={formData.name} onChange={handleInputChange} placeholder={t("insuranceCompany.form.companyNamePlaceholder")}
                                className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="insuranceType" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.insuranceType")} <span className="text-red-500">*</span>
                            </label>
                            <select id="insuranceType" name="insuranceType" value={formData.insuranceType} onChange={handleInputChange}
                                className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            >
                                <option value="الزامي">{t("insuranceCompany.types.mandatory")}</option>
                                <option value="ثالث شامل">{t("insuranceCompany.types.comprehensive")}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="contactNumber" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.contact")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" id="contactNumber" name="contact" value={formData.contact} onChange={handleInputChange} placeholder={t("insuranceCompany.form.contactPlaceholder")}
                                className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("insuranceCompany.form.address")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder={t("insuranceCompany.form.addressPlaceholder")}
                                className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                    </div>

                    {formData.insuranceType !== "الزامي" && (
                        <div className="mt-6 border-t dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                {t("insuranceCompany.ratesTitle")}
                            </h3>
                            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                                {vehicleCategories.map((category) => (
                                    <button key={category.key} type="button" onClick={() => setActiveTab(category.key)}
                                        className={`px-4 py-2 text-sm font-medium focus:outline-none -mb-px ${activeTab === category.key ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {rateFieldsConfig.map(({ field, label }) => (
                                    <div key={field}>
                                        <label htmlFor={`${activeTab}_${field}`} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label} <span className="text-red-500">*</span></label>
                                        <input
                                            type="number" id={`${activeTab}_${field}`} min="0" value={vehicleCategories.find(cat => cat.key === activeTab)?.rates[field] ?? ""}
                                            onChange={(e) => handleRateChange(activeTab, field, e.target.value)}
                                            className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                                            placeholder={t("insuranceCompany.form.ratePlaceholder", { label })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-4">
                        <AlertMessage message={apiMessage.text} type={apiMessage.type} />
                    </div>

                    <div className="flex justify-end pt-2 sticky bottom-0 bg-white dark:bg-navbarBack z-10">
                        <button type="button" onClick={() => onClose(false)} disabled={loading} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50">
                            {t("common.cancel")}
                        </button>
                        <button type="submit" disabled={loading} className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 w-36 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("insuranceCompany.addButton")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInsuranceCompany;