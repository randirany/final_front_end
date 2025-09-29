import { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toLocaleDateStringEN } from '../utils/dateFormatter';

const formatDate = (dateString, language) => {
    if (!dateString) return "N/A";
    try {
        return toLocaleDateStringEN(dateString);
    } catch (error) {
        return "Invalid Date";
    }
};

const formatCurrency = (amount, currencySymbol = "₪") => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return "N/A";
    return `${currencySymbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function CheckDetails() {
    const { t, i18n: { language } } = useTranslation();
    const { insuredId, vehicleId, insuranceId } = useParams();
    const [checks, setChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCheckDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = `islam__${localStorage.getItem("token")}`;
                const response = await axios.get(
                    `http://localhost:3002/api/v1/insured/getCheck/${insuredId}/${vehicleId}/${insuranceId}`,
                    {
                        headers: { token }
                    }
                );
                setChecks(response.data.checks || []);
            } catch (err) {
                const apiError = err.response?.data?.message || t('checkDetails.alerts.fetchErrorDefault', 'Failed to fetch check details.');
                setError(apiError);
                toast.error(apiError);
            } finally {
                setLoading(false);
            }
        };

        if (insuredId && vehicleId && insuranceId) {
            fetchCheckDetails();
        } else {
            const missingIdError = t('checkDetails.alerts.missingIds', "Missing required IDs (insured, vehicle, or insurance) in the URL.");
            setError(missingIdError);
            toast.error(missingIdError);
            setLoading(false);
        }
    }, [insuredId, vehicleId, insuranceId, t]);

    if (loading) {
        return (
            <div className='flex justify-center h-[100vh] items-center dark:text-dark4 dark:bg-dark2'>
                <div className="sk-fading-circle ">
                    {/* ... spinner divs ... */}
                </div>
            </div>
        );
    }


    return (
        <div className="navblayout" style={{ padding: '20px', minHeight: '100vh' }} dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            <div className='mb-2 pb-2 '>
                <div className="bg-[rgb(255,255,255)] flex p-[20px] rounded-md justify-between items-center mt-5  dark:bg-navbarBack dark:text-dark3">
                    <div className="flex gap-[14px] items-center">
                        <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home', 'Home')}</NavLink>
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transform ${(language === 'ar' || language === 'he') ? 'rotate-180' : ''}`}>
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                                fill="currentColor"
                                className="text-gray-500 dark:text-gray-400"
                            />
                        </svg>
                        <NavLink to={`/insured/${insuredId}/${vehicleId}`} className="hover:underline text-blue-600 dark:text-blue-400">
                            {t('breadcrumbs.insuranceList', 'Insurance List')}
                        </NavLink>
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transform ${(language === 'ar' || language === 'he') ? 'rotate-180' : ''}`}>
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                                fill="currentColor"
                                className="text-gray-500 dark:text-gray-400"
                            />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.checkDetails', 'Check Details')}</p>
                    </div>
                </div>
            </div>

            <div className=" md-3 rounded-md bg-[rgb(255,255,255)] dark:bg-navbarBack min-h-[50vh]" >
                {error && (
                    <div className="flex justify-center my-2">
                        <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-md shadow-md w-full mx-5">
                            <p className="font-medium text-red-700 dark:text-red-300">{t('common.errorOccurred', 'An error occurred:')} {error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && checks.length === 0 && (
                    <div className="flex justify-center my-2">
                        <div className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20  p-4 rounded-md shadow-md w-full mx-5">
                            <p className="font-medium text-blue-700 dark:text-blue-300">{t('checkDetails.noChecksFound', 'No check details found for this insurance.')}</p>
                        </div>
                    </div>
                )}


                {!error && checks.length > 0 && (
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-2 min-h-[50vh]">
                        {checks.map((check, index) => (
                            <div key={check._id || index}>
                                <div className={`flex items-start py-4 px-2 my-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg shadow-sm dark:bg-darkSec ${(language === 'ar' || language === 'he') ? 'flex-row-reverse' : ''}`}>
                                    <div className={`${(language === 'ar' || language === 'he') ? 'ml-4' : 'mr-4'} mt-1`}>
                                        {check.checkImage ? (
                                            <div
                                                className="relative w-24 h-24 cursor-pointer bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden"
                                                title={t('checkDetails.viewImageTitle', 'View Image')}
                                                onClick={() => window.open(check.checkImage, '_blank')}
                                            >
                                                <img
                                                    src={check.checkImage}
                                                    alt={t('checkDetails.checkImageAlt', 'Check Image')}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = "none";
                                                        e.target.nextSibling.style.display = "flex";
                                                    }}
                                                />
                                                <div className="absolute inset-0 hidden items-center justify-center bg-gray-300 dark:bg-gray-600">
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-medium text-base dark:text-[rgb(255,255,255)]">
                                            {t('checkDetails.labels.checkNumber', 'Check No:')} <span className="text-gray-600 dark:text-gray-400">{check.checkNumber || t('common.notAvailable', 'N/A')}</span>
                                        </div>
                                        <div className="mt-1">
                                            <div className="font-medium text-sm dark:text-gray-300"> {/* Changed to text-sm */}
                                                {t('checkDetails.labels.dueDate', 'Due Date:')} <span className="text-gray-600 dark:text-gray-400">{formatDate(check.checkDueDate, language)}</span>
                                            </div>
                                            <div className="font-medium text-sm dark:text-gray-300"> {/* Changed to text-sm */}
                                                {t('checkDetails.labels.amount', 'Amount:')} <span className="text-gray-600 dark:text-gray-400 font-bold">{formatCurrency(check.checkAmount)}</span>
                                            </div>
                                            <div className={`text-sm font-medium ${check.isReturned ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                                {t('checkDetails.labels.returned', 'Returned:')} {check.isReturned ? t('checkDetails.options.yes', 'Yes') : t('checkDetails.options.no', 'No')}
                                            </div>
                                        </div>
                                    </div>
                                    {check.checkImage && (
                                        <div className={`${(language === 'ar' || language === 'he') ? 'mr-auto' : 'ml-auto'} ${(language === 'ar' || language === 'he') ? 'pl-2' : 'pr-2'}`}> {/* Adjusted for RTL */}
                                            <button
                                                onClick={() => window.open(check.checkImage, '_blank')}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                                                title={t('checkDetails.openImageTitle', 'Open image in new tab')}
                                            >
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {index < checks.length - 1 && (
                                    <div className=" border-b border-gray-200 dark:border-gray-700 mx-12"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckDetails;