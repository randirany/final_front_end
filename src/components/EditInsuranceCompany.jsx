import { useState, useEffect } from "react";
import { X, Trash, Plus } from "lucide-react";
import axios from "axios";
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
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        name: "",
        insuranceTypes: [],
        roadServices: []
    });

    const [errors, setErrors] = useState({});

    // Initialize formData when opening
    useEffect(() => {
        if (isOpen && companyData) {
            setFormData({
                name: companyData.name || "",
                insuranceTypes: Array.isArray(companyData.insuranceTypes)
                    ? companyData.insuranceTypes.map(it => ({ type: it.type, price: it.price }))
                    : [],
                roadServices: Array.isArray(companyData.roadServices)
                    ? companyData.roadServices.map(rs => ({ name: rs.name, price: rs.price }))
                    : []
            });
            setErrors({});
            setApiMessage({ text: '', type: '' });
        }
    }, [isOpen, companyData]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // InsuranceTypes handlers
    const handleInsuranceTypeChange = (index, field, value) => {
        const updated = [...formData.insuranceTypes];
        if (field === "price") value = Number(value);
        updated[index][field] = value;
        setFormData({ ...formData, insuranceTypes: updated });
    };

    const addInsuranceType = () => {
        setFormData(prev => ({
            ...prev,
            insuranceTypes: [...prev.insuranceTypes, { type: "compulsory", price: 0 }]
        }));
    };

    const removeInsuranceType = (index) => {
        const updated = [...formData.insuranceTypes];
        updated.splice(index, 1);
        setFormData({ ...formData, insuranceTypes: updated });
    };

    // RoadServices handlers
    const handleRoadServiceChange = (index, field, value) => {
        const updated = [...formData.roadServices];
        if (field === "price") value = Number(value);
        updated[index][field] = value;
        setFormData({ ...formData, roadServices: updated });
    };

    const addRoadService = () => {
        setFormData(prev => ({
            ...prev,
            roadServices: [...prev.roadServices, { name: "", price: 0 }]
        }));
    };

    const removeRoadService = (index) => {
        const updated = [...formData.roadServices];
        updated.splice(index, 1);
        setFormData({ ...formData, roadServices: updated });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t("validation.companyNameRequired");

        formData.insuranceTypes.forEach((it, idx) => {
            if (!it.type) newErrors[`insuranceTypes_${idx}_type`] = t("validation.typeRequired");
            if (isNaN(it.price) || it.price < 0) newErrors[`insuranceTypes_${idx}_price`] = t("validation.pricePositive");
        });

        formData.roadServices.forEach((rs, idx) => {
            if (!rs.name.trim()) newErrors[`roadServices_${idx}_name`] = t("validation.nameRequired");
            if (isNaN(rs.price) || rs.price < 0) newErrors[`roadServices_${idx}_price`] = t("validation.pricePositive");
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
console.log(companyData.id)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        if (!validateForm()) {
            setApiMessage({ text: t("validation.formErrors"), type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.patch(
                `http://localhost:3002/api/v1/company/updateInsuranceCompany/${companyData.id}`,
                formData,
                { headers: { token: `islam__${token}` } }
            );

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => !loading && onClose()}>
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-navbarBack z-10">
                    <h2 className="text-xl font-semibold dark:text-white">{t("insuranceCompany.editTitle")}</h2>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Company Name */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                            {t("insuranceCompany.form.companyName")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full p-2.5 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Insurance Types */}
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t("insuranceCompany.form.insuranceTypes")}</h3>
                        {formData.insuranceTypes.map((it, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <select
                                    value={it.type}
                                    onChange={(e) => handleInsuranceTypeChange(idx, "type", e.target.value)}
                                    className={`p-2 border rounded-md ${errors[`insuranceTypes_${idx}_type`] ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white`}
                                >
                                    <option value="compulsory">{t("insuranceCompany.types.mandatory")}</option>
                                    <option value="comprehensive">{t("insuranceCompany.types.comprehensive")}</option>
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    value={it.price}
                                    onChange={(e) => handleInsuranceTypeChange(idx, "price", e.target.value)}
                                    className={`p-2 border rounded-md w-24 ${errors[`insuranceTypes_${idx}_price`] ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white`}
                                />
                                <button type="button" onClick={() => removeInsuranceType(idx)} className="p-2 text-red-600 dark:text-red-400"><Trash /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addInsuranceType} className="flex items-center gap-1 px-2 py-1 text-sm text-indigo-600 dark:text-indigo-400 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Plus className="w-4 h-4" /> {t("insuranceCompany.addInsuranceType")}
                        </button>
                    </div>

                    {/* Road Services */}
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t("insuranceCompany.form.roadServices")}</h3>
                        {formData.roadServices.map((rs, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={rs.name}
                                    onChange={(e) => handleRoadServiceChange(idx, "name", e.target.value)}
                                    placeholder={t("insuranceCompany.form.serviceName")}
                                    className={`p-2 border rounded-md flex-1 ${errors[`roadServices_${idx}_name`] ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white`}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={rs.price}
                                    onChange={(e) => handleRoadServiceChange(idx, "price", e.target.value)}
                                    className={`p-2 border rounded-md w-24 ${errors[`roadServices_${idx}_price`] ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white`}
                                />
                                <button type="button" onClick={() => removeRoadService(idx)} className="p-2 text-red-600 dark:text-red-400"><Trash /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addRoadService} className="flex items-center gap-1 px-2 py-1 text-sm text-indigo-600 dark:text-indigo-400 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Plus className="w-4 h-4" /> {t("insuranceCompany.addRoadService")}
                        </button>
                    </div>

                    {/* API Message */}
                    <AlertMessage message={apiMessage.text} type={apiMessage.type} />

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                            {t("common.cancel")}
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("insuranceCompany.saveChangesButton")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditInsuranceCompany;
