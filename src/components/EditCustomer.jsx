import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { validateIsraeliId, validateMinimumAge } from "../utils/idValidation";

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
    const [agents, setAgents] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        id_Number: "",
        phone_number: "",
        city: "",
        birth_date: "",
        agentId: "",
        notes: ""
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
                agentId: customerData.agentId || "",
                notes: customerData.notes || ""
            });
            setApiMessage({ text: '', type: '' });

            // Fetch agents list
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
            };
            fetchAgents();
        }
    }, [isOpen, customerData]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
        if (!validateIsraeliId(formData.id_Number)) {
            setApiMessage({ text: t('customers.validation.invalidIdNumber'), type: 'error' });
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
        if (!validateMinimumAge(formData.birth_date, 16)) {
            setApiMessage({ text: t('customers.validation.minimumAge'), type: 'error' });
            return;
        }

        if (!customerData || !customerData.id) {
            setApiMessage({ text: t("customers.messages.editErrorNoId"), type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== "") {
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

            let successMessage = t('customers.messages.updateSuccess');

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
                setApiMessage({ text: t(messageKey, t("errors.unknown")), type: 'error' });
            } else {
                setApiMessage({ text: t("errors.network"), type: 'error' });
            }
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("customers.editCustomerTitle", "Edit Customer Information")}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.firstName")}</label>
                            <input
                                type="text"
                                id="first_name_edit"
                                name="first_name"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.firstName", "Enter first name")}
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.lastName")}</label>
                            <input
                                type="text"
                                id="last_name_edit"
                                name="last_name"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.lastName", "Enter last name")}
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.email")}</label>
                            <input
                                type="email"
                                id="email_edit"
                                name="email"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.email", "Enter email address")}
                            />
                        </div>
                        {/* ID Number */}
                        <div>
                            <label htmlFor="id_Number_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.idNumber")}</label>
                            <input
                                type="number"
                                id="id_Number_edit"
                                name="id_Number"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.id_Number}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.idNumber", "Enter ID number")}
                            />
                        </div>
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone_number_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.mobile")}</label>
                            <input
                                type="text"
                                id="phone_number_edit"
                                name="phone_number"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.mobile", "Enter phone number")}
                            />
                        </div>
                        {/* City */}
                        <div>
                            <label htmlFor="city_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.city")}</label>
                            <input
                                type="text"
                                id="city_edit"
                                name="city"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.city", "Enter city")}
                            />
                        </div>
                        {/* Agent Dropdown */}
                        <div>
                            <label htmlFor="agentId_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.agentName")}</label>
                            <select
                                id="agentId_edit"
                                name="agentId"
                                value={formData.agentId}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="">{t("customers.labels.selectAgent", "Select Agent")}</option>
                                {agents.map((agent) => (
                                    <option key={agent._id} value={agent._id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Birth Date */}
                        <div>
                            <label htmlFor="birth_date_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.birthDate")}</label>
                            <input
                                type="date"
                                id="birth_date_edit"
                                name="birth_date"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="col-span-full">
                        <label
                            htmlFor="notes_edit"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            {t("customers.labels.notes")}
                        </label>
                        <textarea
                            id="notes_edit"
                            name="notes"
                            rows="3"
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder={t("customers.placeholders.notesPlaceholder", "Add any additional notes...")}
                        />
                    </div>

                    {/* Alert Message */}
                    <AlertMessage message={apiMessage.text} type={apiMessage.type} />

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end pt-2 border-t dark:border-gray-600">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
                        >
                            {t("common.cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? t("common.saving", "Saving...") : t("common.save", "Save Changes")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCustomer;