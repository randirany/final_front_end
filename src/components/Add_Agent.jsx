import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from 'react-toastify';

function Add_Agent({ isOpen, onClose, onAgentAdded }) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [errors, setErrors] = useState({});

    // Reset form when the dialog opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', email: '' });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Handle Escape key to close the modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = t("validation.nameRequired", "Name is required");
        }
        if (!formData.email.trim()) {
            newErrors.email = t("validation.emailRequired", "Email is required");
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = t("validation.emailInvalid", "Invalid email address");
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error(t("validation.formErrors", "Please fix the errors in the form."));
            return;
        }

        setIsSubmitting(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            await axios.post(`http://localhost:3002/api/v1/agents/addAgents`, formData, {
                headers: { token }
            });
            toast.success(t('agents.messages.addSuccess', 'Agent added successfully!'));
            onAgentAdded?.();
            onClose();
        } catch (err) {
            console.error('Error adding agent:', err);
            toast.error(err.response?.data?.message || t('agents.messages.addError', 'Failed to add agent!'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
            onClick={onClose}
        >
            <div
className="w-full max-w-xl bg-[rgb(255,255,255)] rounded-lg shadow-xl p-3 dark:bg-navbarBack   overflow-hidden flex flex-col"                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-1 p-2 rounded-md border-b dark:border-gray-700">
                    <h2 className="text-2xl font-semibold rounded-md dark:text-gray-200">{t("agents.addTitle", "Add New Agent")}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4 rounded-md ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 ">
                        {/* Agent Name Field */}
                        <div className="md:col-span-2">
                            <label htmlFor="agent_name_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("agents.table.name", "Agent Name")}
                            </label>
                            <input
                                type="text"
                                id="agent_name_add"
                                name="name"
                                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-[rgb(255,255,255)] ${errors.name ? 'border-red-500' : 'border-gray-300 dark:!border-none'}`}
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={validateForm} // Optional: validate on blur
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>
                        
                        {/* Agent Email Field */}
                        <div className="md:col-span-2">
                            <label htmlFor="agent_email_add" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("agents.table.email", "Agent Email")}
                            </label>
                            <input
                                type="email"
                                id="agent_email_add"
                                name="email"
                                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-[rgb(255,255,255)] ${errors.email ? 'border-red-500' : 'border-gray-300 dark:!border-none'}`}
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={validateForm} // Optional: validate on blur
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end px-4 gap-2 pt-4 border-t dark:border-gray-700">
                         <button
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting} 
                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                        >
                            {t("common.cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? t("common.saving", "Saving...") : t("common.add", "Add Agent")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Add_Agent;