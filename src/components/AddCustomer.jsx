


import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";
import { validateIsraeliId, validateMinimumAge } from "../utils/idValidation";
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

function AddCustomer({ onClose, isOpen, onAddSuccess }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [agents, setAgents] = useState([]);
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
        agentsName: "",   // 👈 صار الاسم مش id
        notes: "",
        image: null,
        joining_date: ""
    });
    const [errors, setErrors] = useState({});
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
                first_name: "", last_name: "", email: "", id_Number: "", phone_number: "",
                city: "", birth_date: "", agentId: "", notes: "", image: null, joining_date: ""
            });
            setFiles([]);
            setErrors({});
            setApiMessage({ text: '', type: '' });
            if (fileInputRef.current) fileInputRef.current.value = "";

            const fetchAgents = async () => {
                try {
                    const token = `islam__${localStorage.getItem("token")}`;

                    const res = await axios.get("http://localhost:3002/api/v1/agents/all", {
                        headers: { token }
                    });
                    setAgents(res.data.getAll || []);
                } catch {

                }
            };
            fetchAgents();
        }
    }, [isOpen]);

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
        }
    };















    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiMessage({ text: '', type: '' });
        setErrors({});


        if (!formData.first_name.trim()) return setApiMessage({ text: t('customers.validation.firstName'), type: 'error' });
        if (!formData.last_name.trim()) return setApiMessage({ text: t('customers.validation.lastName'), type: 'error' });
        if (!formData.email.trim()) return setApiMessage({ text: t('customers.validation.email'), type: 'error' });
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) return setApiMessage({ text: t('customers.validation.invalidEmail'), type: 'error' });
        if (!formData.id_Number.toString().trim()) return setApiMessage({ text: t('customers.validation.id_Number'), type: 'error' });
        if (!validateIsraeliId(formData.id_Number)) return setApiMessage({ text: t('customers.validation.invalidIdNumber'), type: 'error' });
        if (!formData.phone_number.trim()) return setApiMessage({ text: t('customers.validation.phone_number'), type: 'error' });
        if (!formData.city.trim()) return setApiMessage({ text: t('customers.validation.city'), type: 'error' });
        if (!formData.birth_date) return setApiMessage({ text: t('customers.validation.birth_date'), type: 'error' });
        if (!validateMinimumAge(formData.birth_date, 16)) return setApiMessage({ text: t('customers.validation.minimumAge'), type: 'error' });

        setIsSubmitting(true);

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== "") {
                formDataToSend.append(key, formData[key]);
            }
        });

        const token = `islam__${localStorage.getItem("token")}`;

        try {
            const response = await axios.post(
                "http://localhost:3002/api/v1/insured/addInsured",
                formDataToSend,
                { headers: { token, "Content-Type": "multipart/form-data" } }
            );

            setIsSubmitting(false);

            let successMessage;
            if (response.data.messageKey) successMessage = t(response.data.messageKey);
            else if (response.data.message) successMessage = response.data.message;
            else successMessage = t('customers.messages.addSuccess');

            setApiMessage({ text: successMessage, type: 'success' });


            const addVehicle = await MySwal.fire({
                title: t("customers.addVehicle.title", "Add Vehicle?"),
                text: t("customers.addVehicle.text", "Do you want to add a new vehicle for this customer?"),
                icon: "question",
                showCancelButton: true,
                confirmButtonText: t("common.yes", "Yes"),
                cancelButtonText: t("common.no", "No"),
                reverseButtons: true,
            });

            if (addVehicle.isConfirmed) {
                const insuredId = response.data.savedInsured._id;


                setTimeout(() => {
                    navigate(`/add_vehicle/${insuredId}`);
                }, 100);

            } else {

                if (onAddSuccess) onAddSuccess(false);
                onClose();
            }

        } catch (error) {
            setIsSubmitting(false);
            if (error.response) {
                const status = error.response.status;
                let messageKey = 'errors.unknown';
                if (status === 409) messageKey = 'customers.validation.alreadyExists';
                else if (status === 404) messageKey = 'customers.validation.Agent';
                else if (status === 400 && error.response.data.messageKey) messageKey = error.response.data.messageKey;
                setApiMessage({ text: t(messageKey, t("errors.unknown")), type: 'error' });
            } else {
                setApiMessage({ text: t("errors.network"), type: 'error' });
            }
        }
    };











    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("customers.addModal.title", "Add New Customer")}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.firstName")}</label>
                            <input
                                type="text"
                                id="first_name_add"
                                name="first_name"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.firstName", "Enter first name")}
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.lastName")}</label>
                            <input
                                type="text"
                                id="last_name_add"
                                name="last_name"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.lastName", "Enter last name")}
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.email")}</label>
                            <input
                                type="email"
                                id="email_add"
                                name="email"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.email", "Enter email address")}
                            />
                        </div>
                        {/* ID Number */}
                        <div>
                            <label htmlFor="id_Number_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("customers.labels.idNumber")}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={9}
                                id="id_Number_add"
                                name="id_Number"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.id_Number}
                                onChange={(e) => {
                                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 9); // يقبل فقط أرقام
                                    setFormData((prev) => ({ ...prev, id_Number: cleaned }));
                                }}
                                placeholder={t("customers.placeholders.idNumber", "Enter ID number")}
                            />
                        </div>
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone_number_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.mobile")}</label>
                            <input
                                type="text"
                                id="phone_number_add"
                                name="phone_number"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.mobile", "Enter phone number")}
                            />
                        </div>
                        {/* City */}
                        <div>
                            <label htmlFor="city_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.city")}</label>
                            <input
                                type="text"
                                id="city_add"
                                name="city"
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder={t("customers.placeholders.city", "Enter city")}
                            />
                        </div>
                        {/* Agent Dropdown */}
                        <div>
                            <label htmlFor="agentsName_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("customers.labels.agentName")}
                            </label>
                            <select
                                id="agentsName_add"
                                name="agentsName"   // 👈 صار يبعث agentsName
                                value={formData.agentsName}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="">{t("customers.labels.selectAgent", "اختر الوكيل")}</option>
                                {agents.map((agent) => (
                                    <option key={agent._id} value={agent.name}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Birth Date */}
                        <div>
                            <label htmlFor="birth_date_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customers.labels.birthDate")}</label>
                            <input
                                type="date"
                                id="birth_date_add"
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
                            htmlFor="notes_add"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            {t("customers.labels.notes")}
                        </label>
                        <textarea
                            id="notes_add"
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
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            {t("common.cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? t("customers.buttons.submittingAdd", "إضافة...") : t("customers.buttons.add", "إضافة")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCustomer;
