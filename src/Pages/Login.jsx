import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import axios from 'axios'
import { UserContext } from '../context/User'
import { jwtDecode } from "jwt-decode"
import { useTranslation } from 'react-i18next'

function Login() {
    const { setUserData, setLogin } = useContext(UserContext);
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { language } = i18n

    const handleLanguageToggle = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    }
    const RegisterUser = async () => {
        try {
            const { data } = await axios.post(`http://localhost:3002/api/v1/user/signin`, formik.values)
            localStorage.setItem('token', data.token)
            const decoded = jwtDecode(data.token);
            setUserData(decoded)
            setLogin(true);
            navigate('/home')

        } catch {
            // Handle error silently
        }
    }

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        }, onSubmit: RegisterUser
    })



    return (
        <div className="login bg-[url('https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/bg/37.png')] bg-cover bg-center min-h-screen flex items-center justify-center p-4" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="wrapper w-full max-w-md mx-auto border border-gray-200 dark:border-borderNav rounded-lg p-6 md:p-8 bg-white dark:bg-navbarBack shadow-lg relative">
                {/* Language Switcher */}
                <button
                    onClick={handleLanguageToggle}
                    title={t('nav.toggleLanguage', 'Change Language')}
                    aria-label={t('nav.toggleLanguage', 'Change Language')}
                    className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} grid size-10 w-10 h-10 place-items-center rounded-full border bg-gray-100 outline-none hover:text-blue-500 focus-visible:border-blue-500 focus-visible:text-blue-500 hover:bg-gray-200 transition-colors`}
                >
                    <span className="font-semibold text-sm uppercase">
                        {language === 'en' ? t('language.ar', 'AR') : t('language.en', 'EN')}
                    </span>
                </button>

                <div className='w-24 md:w-28 lg:w-32 mx-auto py-4 md:py-6'>
                    <img
                        src="https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/crm/logo_black.png"
                        alt="AB Insurance Logo"
                        className='w-full h-auto object-contain'
                    />
                </div>

                <h1 className='text-xl md:text-2xl font-semibold leading-7 md:leading-8 text-center mb-4 md:mb-6'>
                    {t('login.title', 'تسجيل الدخول')}
                    <br />
                    <span className='text-sm md:text-base text-gray-500 dark:text-gray-400 font-light'>
                        {t('login.subtitle', 'باستخدام البريد الإلكتروني')}
                    </span>
                </h1>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('login.email', 'البريد الإلكتروني')}
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 py-3 md:py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                            id="email"
                            placeholder={t('login.emailPlaceholder', 'أدخل بريدك الإلكتروني')}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                    </div>

                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label htmlFor="password" className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('login.password', 'كلمة المرور')}
                        </label>
                        <input
                            type="password"
                            className="w-full px-3 py-3 md:py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            id="password"
                            placeholder={t('login.passwordPlaceholder', 'أدخل كلمة المرور')}
                        />
                    </div>

                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pt-2'>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                id="remember"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember" className={`${language === 'ar' ? 'mr-2' : 'ml-2'} text-sm font-medium text-gray-700 dark:text-gray-300`}>
                                {t('login.rememberMe', 'تذكرني')}
                            </label>
                        </div>
                        <Link
                            to="/code"
                            className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline underline-offset-2 transition-colors'
                        >
                            {t('login.forgotPassword', 'نسيت كلمة المرور؟')}
                        </Link>
                    </div>

                    <div className='pt-4'>
                        <button
                            type="submit"
                            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 md:py-4 px-4 rounded-lg transition-colors duration-200 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                        >
                            {t('login.loginButton', 'تسجيل الدخول')}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default Login