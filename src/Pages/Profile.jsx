import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import avater from '../assets/Avatar.png'; 
import axios from 'axios';
const fetchUserData = async () => {
    const token = `islam__${localStorage.getItem("token")}`; 
    const response = await axios.get(`http://localhost:3002/api/v1/user/profile`, {
        headers: { token } 
    });

    if (response.data && response.data.user) {
        return response.data.user;
    } else {
        throw new Error("Failed to fetch user data: Unexpected response structure");
    }
};


function Profile() {
    const { t, i18n: { language } } = useTranslation(); 
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                setLoading(true);
                setError(null); 
                const data = await fetchUserData();
                setUserData(data);
            } catch (err) {
                setError(err.message || t('profile.error', 'Could not load user profile.'));
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [t]);

    if (loading) {
                return ( <div className='flex justify-center h-[100vh] items-center dark:text-dark4 dark:bg-dark2'> <div className="sk-fading-circle "> <div className="sk-circle1 sk-circle"></div> <div className="sk-circle2 sk-circle"></div> <div className="sk-circle3 sk-circle"></div> <div className="sk-circle4 sk-circle"></div> <div className="sk-circle5 sk-circle"></div> <div className="sk-circle6 sk-circle"></div> <div className="sk-circle7 sk-circle"></div> <div className="sk-circle8 sk-circle"></div> <div className="sk-circle9 sk-circle"></div> <div className="sk-circle10 sk-circle"></div> <div className="sk-circle11 sk-circle"></div> <div className="sk-circle12 sk-circle"></div> </div> </div> );

    }

    if (error || !userData) {
        return (
            <div className="py-3 dark:bg-dark2 min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-500 dark:text-red-400">
                    {error || t('profile.errorNoData', 'User data not available.')}
                </p>
            </div>
        );
    }

    const profileInfo = [
        { labelKey: t('profile.labels.username'), value: userData.name },
        { labelKey: t('profile.labels.email'), value: userData.email },
        { labelKey:  t('profile.labels.role'), value: t(`roles.${userData.role}`, userData.role) },
        { labelKey: t('profile.labels.departmentId'), value: userData.departmentId || t('profile.noDepartment', 'N/A') },
        { labelKey:  t('profile.labels.status'), value: t(`status.${userData.status?.replace(/\s+/g, '_')}`, userData.status) },
        { labelKey:  t('profile.labels.address'), value: userData.address || t('profile.notSet', 'Not Set') },
        { labelKey:  t('profile.labels.debt'), value: userData.debt !== undefined ? userData.debt : t('profile.notSet', 'Not Set') },
        { labelKey:  t('profile.labels.financialStatus'), value: userData.financialStatus || t('profile.notSet', 'Not Set') },
        { labelKey:  t('profile.labels.installments'), value: userData.installments !== undefined ? userData.installments : t('profile.notSet', 'Not Set') },
    ];

    return (
        <div className='py-3 dark:bg-dark2 border-t dark:border-borderNav-b-gray-200 min-h-screen'>
            <main className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 flex-1 pb-10">
                <div className="px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="mt-8">
                        <div className="bg-[rgb(255,255,255)] card dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between mb-4 flex-wrap shadow-sm">
                            <div className="flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base">
                                <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">
                                    {t('customers.firstTitle', 'Dashboard')}
                                </NavLink>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {t('profile.breadcrumbTitle', 'User Profile')}
                                </span>
                            </div>
                        </div>

                        <div className="dark:bg-navbarBack rounded-[10px] bg-[rgb(255,255,255)] p-6 sm:p-8 shadow-lg dark:bg-gray-dark card">
                            <div className="flex flex-col sm:flex-row items-center mb-6 sm:mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                                <img src={avater} alt="User Avatar" className='w-24 h-24 rounded-full sm:mr-6 mb-4 sm:mb-0' /> {/* Added alt text and rounded-full */}
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold dark:text-[rgb(255,255,255)] text-center sm:text-left">{userData.name}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">{t(`roles.${userData.role}`, userData.role)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {profileInfo.map((item) => (
                                    <div key={item.labelKey} className="py-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.labelKey}</dt>
                                        <dd className="mt-1 text-md dark:text-[rgb(255,255,255)] text-gray-900 font-semibold">{item.value}</dd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;