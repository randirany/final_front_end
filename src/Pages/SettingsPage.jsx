import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
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


function SettingsPage() {
    const { t, i18n: { language } } = useTranslation();
    const [activeTab, setActiveTab] = useState('details');

    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [fetchUserError, setFetchUserError] = useState(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [detailErrors, setDetailErrors] = useState({});
    const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
    // CHANGE 3: حالة جديدة لرسائل الـ API الخاصة بتفاصيل المستخدم
    const [detailsApiMessage, setDetailsApiMessage] = useState({ text: '', type: '' });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    // CHANGE 4: حالة جديدة لرسائل الـ API الخاصة بكلمة المرور
    const [passwordApiMessage, setPasswordApiMessage] = useState({ text: '', type: '' });


    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // CHANGE 5: تحويل `loadUser` إلى دالة يمكن استدعاؤها وتغليفها بـ useCallback
    const loadUser = useCallback(async () => {
        setIsLoadingUser(true);
        setFetchUserError(null);
        try {
            const userData = await getCurrentUserData();
            if (userData) {
                setName(userData.name || '');
                setEmail(userData.email || '');
            } else {
                setFetchUserError(t('settings.error.loadUser', 'Failed to load user data. Please try again or re-login.'));
            }
        } catch (err) {
            setFetchUserError(t('settings.error.loadUserUnexpected', 'An unexpected error occurred while loading user data.'));
        } finally {
            setIsLoadingUser(false);
        }
    }, [t]); // تعتمد على t

    useEffect(() => {
        loadUser();
    }, [loadUser]); // استدعاء loadUser عند تحميل المكون

    const getCurrentUserData = async () => {
        const token = `islam__${localStorage.getItem("token")}`;
        if (!localStorage.getItem("token") || localStorage.getItem("token") === "null" || localStorage.getItem("token") === "undefined") {
            return null;
        }
        try {
            const response = await axios.get(`http://localhost:3002/api/v1/user/profile`, {
                headers: { token }
            });
            if (response.data && response.data.user) {
                return response.data.user;
            }
            throw new Error("User data not found in response");
        } catch (error) {
            return null;
        }
    };

    const validateDetails = () => {
        const errors = {};
        if (!name.trim()) errors.name = t('settings.validation.nameRequired', "Name is required");
        if (!email.trim()) {
            errors.email = t('settings.validation.emailRequired', "Email is required");
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            errors.email = t('settings.validation.emailInvalid', "Invalid email address");
        }
        setDetailErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitDetails = async (e) => {
        e.preventDefault();
        // CHANGE 6: مسح الرسالة السابقة عند كل محاولة حفظ
        setDetailsApiMessage({ text: '', type: '' });

        if (!validateDetails()) return;

        setIsSubmittingDetails(true);
        setDetailErrors({});
        const token = `islam__${localStorage.getItem("token")}`;
        if (!token) {
            setIsSubmittingDetails(false);
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3002/api/v1/user/change`, { name, email }, { headers: { token } });
            const successMessage = response.data.message || t('settings.detailsUpdatedSuccess', 'Details updated successfully!');
            setDetailsApiMessage({ text: successMessage, type: 'success' });
            // toast.success(successMessage); // يمكنك الإبقاء على الـ toast إذا أردت

            await loadUser();

        } catch (error) {

            const apiError = error.response?.data?.message || t('settings.detailsUpdateError', 'Failed to update details.');
            // عرض رسالة الخطأ الموحدة
            setDetailsApiMessage({ text: apiError, type: 'error' });
            // toast.error(apiError); // يمكنك الإبقاء على الـ toast
        } finally {
            setIsSubmittingDetails(false);
        }
    };

    const validatePasswordChange = () => {
        const errors = {};
        if (!currentPassword) errors.currentPassword = t('settings.validation.currentPasswordRequired', 'Current password is required.');
        if (!newPassword) {
            errors.newPassword = t('settings.validation.newPasswordRequired', 'New password is required.');
        } else if (newPassword.length < 6) {
            errors.newPassword = t('settings.validation.newPasswordTooShort', 'New password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
            errors.confirmPassword = t('settings.validation.passwordsDoNotMatch', 'New passwords do not match.');
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        // CHANGE 8: مسح الرسالة السابقة عند كل محاولة حفظ
        setPasswordApiMessage({ text: '', type: '' });

        if (!validatePasswordChange()) return;

        setIsSubmittingPassword(true);
        setPasswordErrors({});
        const token = `islam__${localStorage.getItem("token")}`;
        if (!token) {
            setIsSubmittingPassword(false);
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:3002/api/v1/user/changepassword`,
                { currentPassword, newPassword },
                { headers: { token } }
            );

            const successMessage = response.data.message || t('settings.passwordChangedSuccess', 'Password changed successfully!');
            setPasswordApiMessage({ text: successMessage, type: 'success' });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const status = error.response?.status;
            const apiError =
                (status === 400
                    ? t('settings.error.errorPassword') 
                    : error.response?.data?.message) ||
                t('settings.passwordChangeError', 'Failed to change password.');

            setPasswordApiMessage({ text: apiError, type: 'error' });
        } finally {
            setIsSubmittingPassword(false);
        }

    };

    const renderDetailsForm = () => (
        <form onSubmit={handleSubmitDetails} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('settings.nameLabel', 'Full Name')}
                </label>
                <div className="mt-1">
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={validateDetails}
                        className={`focus:ring-blue-500 py-2 px-3 border rounded-md focus:border-blue-500 block w-full sm:text-sm dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] ${detailErrors.name ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {detailErrors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{detailErrors.name}</p>}
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('settings.emailLabel', 'Email Address')}
                </label>
                <div className="mt-1">
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={validateDetails}
                        className={`focus:ring-blue-500 border focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md py-2 px-3 ${detailErrors.email ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {detailErrors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{detailErrors.email}</p>}
            </div>

            <AlertMessage message={detailsApiMessage.text} type={detailsApiMessage.type} />

            <button type="submit" disabled={isSubmittingDetails}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent dark:!border-none rounded-md shadow-sm text-sm font-medium text-[rgb(255,255,255)] bg-[#6C5FFC] hover:bg-[#5a4ff1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmittingDetails ? t('settings.savingButton', 'Saving...') : t('settings.saveDetailsButton', 'Save Changes')}
            </button>
        </form>
    );

    const renderPasswordForm = () => (
        <form onSubmit={handleSubmitPassword} className="space-y-6">
            {/* ... حقول الإدخال تبقى كما هي ... */}
            <div>
                <label htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.currentPasswordLabel', 'Current Password')}</label>
                <div className="mt-1 relative">
                    <input type={showOldPassword ? "text" : "password"} id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`focus:ring-blue-500 focus:border-blue-500 border block w-full pr-10 sm:text-sm border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md py-2 px-3 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className={`absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-500 ${language === 'en' ? 'right-0   pr-3' : 'left-0   pl-3'}`}>
                        {showOldPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                {passwordErrors.currentPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword}</p>}
            </div>
            <div>
                <label htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.newPasswordLabel', 'New Password')}</label>
                <div className="mt-1 relative">
                    <input type={showNewPassword ? "text" : "password"} id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className={`focus:ring-blue-500 focus:border-blue-500 border block w-full pr-10 sm:text-sm border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md py-2 px-3 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-500 ${language === 'en' ? 'right-0   pr-3' : 'left-0   pl-3'}`}>
                        {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                {passwordErrors.newPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword}</p>}
            </div>
            <div>
                <label htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.confirmPasswordLabel', 'Confirm New Password')}</label>
                <div className="mt-1 relative">
                    <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`focus:ring-blue-500 focus:border-blue-500 border block w-full pr-10 sm:text-sm border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md py-2 px-3 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-500 ${language === 'en' ? 'right-0   pr-3' : 'left-0   pl-3'}`}>
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                {passwordErrors.confirmPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword}</p>}
            </div>

            {/* CHANGE 10: عرض الرسالة الموحدة فوق الزر */}
            <AlertMessage message={passwordApiMessage.text} type={passwordApiMessage.type} />

            <button type="submit" disabled={isSubmittingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent dark:!border-none rounded-md shadow-sm text-sm font-medium text-[rgb(255,255,255)] bg-[#6C5FFC] hover:bg-[#5a4ff1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmittingPassword ? t('settings.changingPasswordButton', 'Changing...') : t('settings.changePasswordButton', 'Change Password')}
            </button>
        </form>
    );

    if (isLoadingUser) {
        return ( <div className='flex justify-center h-[100vh] items-center dark:text-dark4 dark:bg-dark2'> <div className="sk-fading-circle "> <div className="sk-circle1 sk-circle"></div> <div className="sk-circle2 sk-circle"></div> <div className="sk-circle3 sk-circle"></div> <div className="sk-circle4 sk-circle"></div> <div className="sk-circle5 sk-circle"></div> <div className="sk-circle6 sk-circle"></div> <div className="sk-circle7 sk-circle"></div> <div className="sk-circle8 sk-circle"></div> <div className="sk-circle9 sk-circle"></div> <div className="sk-circle10 sk-circle"></div> <div className="sk-circle11 sk-circle"></div> <div className="sk-circle12 sk-circle"></div> </div> </div> );
    }
    if (fetchUserError) {
        return <div className="py-3 dark:bg-dark2 min-h-screen flex items-center justify-center text-center px-4"><p className="text-xl text-red-500">{fetchUserError}</p></div>;
    }
    return (
        <div className='py-3 dark:bg-dark2 border-t dark:border-borderNav-b-gray-200 min-h-screen'>
            {/* ... */}
            {/* ... */}
            <main className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 flex-1 pb-10">
                <div className="mt-8">
                    <div className="bg-[rgb(255,255,255)] card dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between mb-6 flex-wrap shadow-sm">
                        <div className={`flex gap-2 items-center text-sm md:text-base`} dir={language === "en" ? "ltr" : "rtl"}>
                            <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('customers.firstTitle', 'Dashboard')}</NavLink>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-500 dark:text-gray-400">{t('settings.breadcrumbTitle', 'Account Settings')}</span>
                        </div>
                    </div>

                    <div className="dark:bg-navbarBack rounded-lg bg-[rgb(255,255,255)] p-6 sm:p-8 shadow-lg card">
                        <div className={`flex border-b border-gray-200 dark:border-gray-700 mb-6 ${language === 'en' ? "justify-start" : "justify-end"}`}>
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`${activeTab === 'details'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    <UserCircleIcon className="h-5 w-5" />
                                    {t('settings.tabs.details', 'Personal Details')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`${activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    <LockClosedIcon className="h-5 w-5" />
                                    {t('settings.tabs.password', 'Change Password')}
                                </button>
                            </nav>
                        </div>

                        <div dir={language === "en" ? "ltr" : "rtl"}>
                            {activeTab === 'details' && renderDetailsForm()}
                            {activeTab === 'password' && renderPasswordForm()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SettingsPage;