import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from 'react-toastify';

function Edit_Agent({ isOpen, onClose, onAgentUpdated, agent }) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    });
    const [errors, setErrors] = useState({});

    // Populate form when agent prop changes
    useEffect(() => {
        if (isOpen && agent) {
            setFormData({
                name: agent.name || '',
                email: agent.email || '',
                password: '', // Don't populate password for security
                role: agent.role || ''
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, agent]);

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

    if (!isOpen || !agent) {
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
        // Password is optional for update
        if (formData.password && formData.password.length < 6) {
            newErrors.password = t("validation.passwordTooShort", "Password must be at least 6 characters");
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

            // Only send fields that have values
            const updateData = {};
            if (formData.name) updateData.name = formData.name;
            if (formData.email) updateData.email = formData.email;
            if (formData.password) updateData.password = formData.password;
            if (formData.role) updateData.role = formData.role;

            await axios.patch(
                `http://localhost:3002/api/v1/agents/updateAgents/${agent.id}`,
                updateData,
                { headers: { token } }
            );

            toast.success(t('agents.messages.updateSuccess', 'Agent updated successfully!'));
            onAgentUpdated?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || t('agents.messages.updateError', 'Failed to update agent!'));
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
                className="w-full max-w-xl bg-[rgb(255,255,255)] rounded-lg shadow-xl p-3 dark:bg-navbarBack overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-1 p-2 rounded-md border-b dark:border-gray-700">
                    <h2 className="text-2xl font-semibold rounded-md dark:text-gray-200">
                        {t("agents.editTitle", "Edit Agent")}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                        {/* Agent Name Field */}
                        <div className="md:col-span-2">
                            <label htmlFor="agent_name_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("agents.table.name", "Agent Name")}
                            </label>
                            <input
                                type="text"
                                id="agent_name_edit"
                                name="name"
                                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-[rgb(255,255,255)] ${errors.name ? 'border-red-500' : 'border-gray-300 dark:!border-none'}`}
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={validateForm}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>

                        {/* Agent Email Field */}
                        <div className="md:col-span-2">
                            <label htmlFor="agent_email_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("agents.table.email", "Agent Email")}
                            </label>
                            <input
                                type="email"
                                id="agent_email_edit"
                                name="email"
                                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-[rgb(255,255,255)] ${errors.email ? 'border-red-500' : 'border-gray-300 dark:!border-none'}`}
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={validateForm}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>

                        {/* Role Field */}
                        <div className="md:col-span-2">
                            <label htmlFor="agent_role_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("agents.table.role", "Role")}
                            </label>
                            <input
                                type="text"
                                id="agent_role_edit"
                                name="role"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-[rgb(255,255,255)] border-gray-300 dark:!border-none"
                                value={formData.role}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Password Field (Optional) */}
                        <div className="md:col-span-2">
                            <label htmlFor="agent_password_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("agents.form.newPassword", "New Password")} ({t("common.optional", "Optional")})
                            </label>
                            <input
                                type="password"
                                id="agent_password_edit"
                                name="password"
                                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-[rgb(255,255,255)] ${errors.password ? 'border-red-500' : 'border-gray-300 dark:!border-none'}`}
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={validateForm}
                                placeholder={t("agents.form.passwordPlaceholder", "Leave blank to keep current password")}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t("agents.form.passwordHint", "Only enter a password if you want to change it")}
                            </p>
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
                            {isSubmitting ? t("common.saving", "Saving...") : t("common.saveChanges", "Save Changes")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Edit_Agent;
