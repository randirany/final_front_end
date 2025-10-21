import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useTranslation } from 'react-i18next';
import AddInsuranceMandatory from "./AddInsuranceMandatory";
import AddInsuranceThiry from "./AddInsuranceThiry";
import AddInsuranceFull from "./AddInsuranceFull";
import InsuranceAhliaRep from "./insuranceAhliaRep";
import InsuranceMashreqRep from "./InsuranceMashreqRep";
import InsuranceTakafulRep from "./InsuranceTakafulRep";
import InsurancePalestineRep from "./InsurancePalestinelRep";
import InsuranceTrustRep from './InsuranceTrustRep';
import InsuranceHoliRep from "./InsuranceHoliRep";
import AddInsuranceCompany from "./AddInsuranceCompany";
import AddCustomer from "./AddCustomer";
import { useTheme } from '../context/ThemeProvider';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [isOpenMandatory, setIsOpenMandatory] = useState(false);
  const [isOpenThird, setIsOpenThird] = useState(false);
  const [isOpenFull, setIsOpenFull] = useState(false);
  const [isOpenAhliaRep, setIsOpenAhliaRep] = useState(false);
  const [isOpenMashreqMashreq, setIsMashreqMashreq] = useState(false)
  const [isOpenTakafulRep, setIsOpenTakafulRep] = useState(false)
  const [isOpenPalestinelRep, setIsOpenPalestinelRep] = useState(false)
  const [isOpenTrustRep, setIsOpenTrustRep] = useState(false)
  const [isOpenHoliRep, setIsOpenHoliRep] = useState(false)
  const [isOpenInsuranceCompany, setIsOpenInsuranceCompany] = useState(false);
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const [isOpenAddInsurance, setIsOpenAddInsurance] = useState(false)
  const [isOpenReport, setIsOpenReport] = useState(false)
  const [isOpenCustomers, setIsOpenCustomers] = useState(false)
  const [isOpenInsuranceCompanies, setIsOpenInsuranceCompanies] = useState(false)
  const [isOpenAddCustomer, setIsOpenAddCustomer] = useState(false)
  const [isOpenAddCompany, setIsOpenAddCompany] = useState(false)
  const { t, i18n: { language } } = useTranslation();

  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isRTL = (language === 'ar' || language === 'he');
  return (
    <>
      <div
        id="sidebar"
        className={`
          bg-[rgb(255,255,255)]  sidebar py-[20px] px-2 md:px-4 fixed top-0 bottom-0 z-40  w-xs
          transform transition-transform duration-300 ease-in-out  ${isRTL
            ? 'right-0 border-l-2 border-gray-200 dark:border-l-zinc-800'
            : 'left-0 border-r-2 border-gray-200 dark:border-r-zinc-800'
          }
          ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
          2md:w-[260px] 2md:translate-x-0 2md:z-11 
          dark:bg-navbarBack
          dark:text-dark3
        `}
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <div className='mb-4 flex items-center gap-2'>
          <img src={logo} alt={t('logoAlt', 'Company Logo')} className="w-11" />
          <p>Al- Basheer Insurance</p>

        </div>

        <div className='mt-6 flex-1 pr-3 min-[850px]:mt-10 overflow-y-scroll h-[calc(100%-50px)] hide-scrollbar'>
          <div className="mb-4">
            <h2 className="mb-2 text-sm px-3 font-medium text-dark-4 dark:text-dark-6">{t("sideBar.mainMenu.title")}</h2>
            <nav role="navigation" aria-label={t("sideBar.mainMenu.title")}>
              <ul className="">
                <li>
                  <Link dir={language === "en" ? "ltr" : "rtl"} to='/home' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="size-6 shrink-0 w-[19px] h-[19px]" aria-hidden="true"><path d="M9 17.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z"></path><path fillRule="evenodd" clipRule="evenodd" d="M12 1.25c-.725 0-1.387.2-2.11.537-.702.327-1.512.81-2.528 1.415l-1.456.867c-1.119.667-2.01 1.198-2.686 1.706C2.523 6.3 2 6.84 1.66 7.551c-.342.711-.434 1.456-.405 2.325.029.841.176 1.864.36 3.146l.293 2.032c.237 1.65.426 2.959.707 3.978.29 1.05.702 1.885 1.445 2.524.742.64 1.63.925 2.716 1.062 1.056.132 2.387.132 4.066.132h2.316c1.68 0 3.01 0 4.066-.132 1.086-.137 1.974-.422 2.716-1.061.743-.64 1.155-1.474 1.445-2.525.281-1.02.47-2.328.707-3.978l.292-2.032c.185-1.282.332-2.305.36-3.146.03-.87-.062-1.614-.403-2.325C22 6.84 21.477 6.3 20.78 5.775c-.675-.508-1.567-1.039-2.686-1.706l-1.456-.867c-1.016-.605-1.826-1.088-2.527-1.415-.724-.338-1.386-.537-2.111-.537zM8.096 4.511c1.057-.63 1.803-1.073 2.428-1.365.609-.284 1.047-.396 1.476-.396.43 0 .867.112 1.476.396.625.292 1.37.735 2.428 1.365l1.385.825c1.165.694 1.986 1.184 2.59 1.638.587.443.91.809 1.11 1.225.199.416.282.894.257 1.626-.026.75-.16 1.691-.352 3.026l-.28 1.937c-.246 1.714-.422 2.928-.675 3.845-.247.896-.545 1.415-.977 1.787-.433.373-.994.593-1.925.71-.951.119-2.188.12-3.93.12h-2.213c-1.743 0-2.98-.001-3.931-.12-.93-.117-1.492-.337-1.925-.71-.432-.372-.73-.891-.977-1.787-.253-.917-.43-2.131-.676-3.845l-.279-1.937c-.192-1.335-.326-2.277-.352-3.026-.025-.732.058-1.21.258-1.626.2-.416.521-.782 1.11-1.225.603-.454 1.424-.944 2.589-1.638l1.385-.825z"></path></svg>
                    <span>{t("sideBar.mainMenu.categore.dash")}</span>
                  </Link>
                </li>
                <li>
                  <div>
                    <button
                      onClick={() => setIsOpenCustomers(!isOpenCustomers)}
                      aria-expanded={isOpenCustomers}
                      className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3"
                    >
                      <svg width={24} height={24} viewBox="0 0 24 24" className="size-6 shrink-0 w-[19px] h-[19px]" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="currentColor" /></svg>
                      <span className="flex-1 text-left">{t("sideBar.mainMenu.categore.custom")}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpenCustomers ? 'rotate-90' : (isRTL ? 'rotate-180' : '')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {isOpenCustomers && (
                      <div className={`ml-8 mt-2 space-y-1 ${isRTL ? 'mr-8 ml-0' : ''}`}>
                        <Link
                          to='/customers'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="currentColor" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="currentColor" />
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.customers.allCustomers", "All Customers")}</span>
                          </div>
                        </Link>
                        <button
                          onClick={() => setIsOpenAddCustomer(true)}
                          className="w-full block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.customers.addCustomer", "Add New Customer")}</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
             
                <li>
                  <div>
                    <button
                      onClick={() => setIsOpenInsuranceCompanies(!isOpenInsuranceCompanies)}
                      aria-expanded={isOpenInsuranceCompanies}
                      className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3"
                    >
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]" ><path fillRule="evenodd" clipRule="evenodd" d="M6.5 1.75C3.87665 1.75 1.75 3.87665 1.75 6.5C1.75 9.12335 3.87665 11.25 6.5 11.25C9.12335 11.25 11.25 9.12335 11.25 6.5C11.25 3.87665 9.12335 1.75 6.5 1.75ZM3.25 6.5C3.25 4.70507 4.70507 3.25 6.5 3.25C8.29493 3.25 9.75 4.70507 9.75 6.5C9.75 8.29493 8.29493 9.75 6.5 9.75C4.70507 9.75 3.25 8.29493 3.25 6.5Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M17.5 12.75C14.8766 12.75 12.75 14.8766 12.75 17.5C12.75 20.1234 14.8766 22.25 17.5 22.25C20.1234 22.25 22.25 20.1234 22.25 17.5C22.25 14.8766 20.1234 12.75 17.5 12.75ZM14.25 17.5C14.25 15.7051 15.7051 14.25 17.5 14.25C19.2949 14.25 20.75 15.7051 20.75 17.5C20.75 19.2949 19.2949 20.75 17.5 20.75C15.7051 20.75 14.25 19.2949 14.25 17.5Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12.75 6.5C12.75 3.87665 14.8766 1.75 17.5 1.75C20.1234 1.75 22.25 3.87665 22.25 6.5C22.25 9.12335 20.1234 11.25 17.5 11.25C14.8766 11.25 12.75 9.12335 12.75 6.5ZM17.5 3.25C15.7051 3.25 14.25 4.70507 14.25 6.5C14.25 8.29493 15.7051 9.75 17.5 9.75C19.2949 9.75 20.75 8.29493 20.75 6.5C20.75 4.70507 19.2949 3.25 17.5 3.25Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M6.5 12.75C3.87665 12.75 1.75 14.8766 1.75 17.5C1.75 20.1234 3.87665 22.25 6.5 22.25C9.12335 22.25 11.25 20.1234 11.25 17.5C11.25 14.8766 9.12335 12.75 6.5 12.75ZM3.25 17.5C3.25 15.7051 4.70507 14.25 6.5 14.25C8.29493 14.25 9.75 15.7051 9.75 17.5C9.75 19.2949 8.29493 20.75 6.5 20.75C4.70507 20.75 3.25 19.2949 3.25 17.5Z" fill="currentColor" /></svg>
                      <span className="flex-1 text-left">{t("sideBar.mainMenu.categore.insucresComp.titleInsucresComp")}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpenInsuranceCompanies ? 'rotate-90' : (isRTL ? 'rotate-180' : '')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {isOpenInsuranceCompanies && (
                      <div className={`ml-8 mt-2 space-y-1 ${isRTL ? 'mr-8 ml-0' : ''}`}>
                        <Link
                          to='/InsuranceCompany'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path fillRule="evenodd" clipRule="evenodd" d="M6.5 1.75C3.87665 1.75 1.75 3.87665 1.75 6.5C1.75 9.12335 3.87665 11.25 6.5 11.25C9.12335 11.25 11.25 9.12335 11.25 6.5C11.25 3.87665 9.12335 1.75 6.5 1.75ZM3.25 6.5C3.25 4.70507 4.70507 3.25 6.5 3.25C8.29493 3.25 9.75 4.70507 9.75 6.5C9.75 8.29493 8.29493 9.75 6.5 9.75C4.70507 9.75 3.25 8.29493 3.25 6.5Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M17.5 12.75C14.8766 12.75 12.75 14.8766 12.75 17.5C12.75 20.1234 14.8766 22.25 17.5 22.25C20.1234 22.25 22.25 20.1234 22.25 17.5C22.25 14.8766 20.1234 12.75 17.5 12.75ZM14.25 17.5C14.25 15.7051 15.7051 14.25 17.5 14.25C19.2949 14.25 20.75 15.7051 20.75 17.5C20.75 19.2949 19.2949 20.75 17.5 20.75C15.7051 20.75 14.25 19.2949 14.25 17.5Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12.75 6.5C12.75 3.87665 14.8766 1.75 17.5 1.75C20.1234 1.75 22.25 3.87665 22.25 6.5C22.25 9.12335 20.1234 11.25 17.5 11.25C14.8766 11.25 12.75 9.12335 12.75 6.5ZM17.5 3.25C15.7051 3.25 14.25 4.70507 14.25 6.5C14.25 8.29493 15.7051 9.75 17.5 9.75C19.2949 9.75 20.75 8.29493 20.75 6.5C20.75 4.70507 19.2949 3.25 17.5 3.25Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M6.5 12.75C3.87665 12.75 1.75 14.8766 1.75 17.5C1.75 20.1234 3.87665 22.25 6.5 22.25C9.12335 22.25 11.25 20.1234 11.25 17.5C11.25 14.8766 9.12335 12.75 6.5 12.75ZM3.25 17.5C3.25 15.7051 4.70507 14.25 6.5 14.25C8.29493 14.25 9.75 15.7051 9.75 17.5C9.75 19.2949 8.29493 20.75 6.5 20.75C4.70507 20.75 3.25 19.2949 3.25 17.5Z" fill="currentColor" />
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.insucresComp.allCompanies", "All Insurance Companies")}</span>
                          </div>
                        </Link>
                        <button
                          onClick={() => setIsOpenAddCompany(true)}
                          className="w-full block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.insucresComp.addCompany", "Add New Company")}</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
                <li>
                  <div>
                    <Link aria-expanded="false" to='/allInsurance' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-6 shrink-0 w-[19px] h-[19px]"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" x2="8" y1="13" y2="13" />
                        <line x1="16" x2="8" y1="17" y2="17" />
                        <line x1="10" x2="8" y1="9" y2="9" />
                      </svg>
                      <span>{t('breadcrumbs.allInsurances', 'All Insurances')}</span>
                    </Link>
                  </div>
                </li>
                {/* Consolidated Insurance Company Management - includes types, pricing, and system setup */}
                <li>
                  <Link to='/insurance-companies' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.insuranceCompanies", "Insurance Companies")}</span>
                  </Link>
                </li>
                <li>
                  <Link to='/expenses' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path d="M21 12V7H5a2 2 0 100 4h14zm0 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <circle cx="8" cy="15" r="1" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.expenses", "Expenses")}</span>
                  </Link>
                </li>
                <li>
                  <Link to='/departments' className="text-[14px]  rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width={24} height={24} viewBox="0 0 24 24" className="size-6 shrink-0 w-[19px] h-[19px]" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="currentColor" /></svg>
                    <span>{t("sideBar.mainMenu.categore.user")}</span>
                  </Link>
                </li>

                <li>
                  <div>
                    <Link to='/Agents' aria-expanded="false" className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px] dark:text-textNav" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.04832 2.48826C8.33094 2.79108 8.31458 3.26567 8.01176 3.54829L3.72605 7.54829C3.57393 7.69027 3.36967 7.76267 3.1621 7.74818C2.95453 7.7337 2.7623 7.63363 2.63138 7.4719L1.41709 5.9719C1.15647 5.64996 1.20618 5.17769 1.52813 4.91707C1.85007 4.65645 2.32234 4.70616 2.58296 5.0281L3.29089 5.90261L6.98829 2.45171C7.2911 2.16909 7.76569 2.18545 8.04832 2.48826ZM11.25 5C11.25 4.58579 11.5858 4.25 12 4.25H22C22.4142 4.25 22.75 4.58579 22.75 5C22.75 5.41422 22.4142 5.75 22 5.75H12C11.5858 5.75 11.25 5.41422 11.25 5ZM8.04832 9.48826C8.33094 9.79108 8.31458 10.2657 8.01176 10.5483L3.72605 14.5483C3.57393 14.6903 3.36967 14.7627 3.1621 14.7482C2.95453 14.7337 2.7623 14.6336 2.63138 14.4719L1.41709 12.9719C1.15647 12.65 1.20618 12.1777 1.52813 11.9171C1.85007 11.6564 2.32234 11.7062 2.58296 12.0281L3.29089 12.9026L6.98829 9.45171C7.2911 9.16909 7.76569 9.18545 8.04832 9.48826ZM11.25 12C11.25 11.5858 11.5858 11.25 12 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H12C11.5858 12.75 11.25 12.4142 11.25 12ZM8.04832 16.4883C8.33094 16.7911 8.31458 17.2657 8.01176 17.5483L3.72605 21.5483C3.57393 21.6903 3.36967 21.7627 3.1621 21.7482C2.95453 21.7337 2.7623 21.6336 2.63138 21.4719L1.41709 19.9719C1.15647 19.65 1.20618 19.1777 1.52813 18.9171C1.85007 18.6564 2.32234 18.7062 2.58296 19.0281L3.29089 19.9026L6.98829 16.4517C7.2911 16.1691 7.76569 16.1855 8.04832 16.4883ZM11.25 19C11.25 18.5858 11.5858 18.25 12 18.25H22C22.4142 18.25 22.75 18.5858 22.75 19C22.75 19.4142 22.4142 19.75 22 19.75H12C11.5858 19.75 11.25 19.4142 11.25 19Z" fill="currentColor" />
                      </svg>
                      <span>{t("sideBar.mainMenu.categore.Dealer")}</span>
                    </Link>
                  </div>

                </li>

              

           
                <li>
                  <Link to='/cheques' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V6ZM5 5C4.44772 5 4 5.44772 4 6V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H5Z" fill="currentColor"/>
                      <path d="M4 9H20V11H4V9Z" fill="currentColor"/>
                      <path d="M6 13H14V15H6V13Z" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.cheques")}</span>
                  </Link>
                </li>
                <li>
                  <Link to='/document-settings' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <circle cx="12" cy="13" r="1" fill="currentColor"/>
                      <circle cx="12" cy="16" r="1" fill="currentColor"/>
                      <circle cx="12" cy="10" r="1" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.documentSettings")}</span>
                  </Link>
                </li>

                <li>
                  <div>
                    <button
                      onClick={() => setIsOpenReport(!isOpenReport)}
                      aria-expanded={isOpenReport}
                      className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="m19 9-5 5-4-4-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="flex-1 text-left">{t("sideBar.mainMenu.categore.reports.title")}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpenReport ? 'rotate-90' : (isRTL ? 'rotate-180' : '')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {isOpenReport && (
                      <div className={`ml-8 mt-2 space-y-1 ${isRTL ? 'mr-8 ml-0' : ''}`}>
                        <Link
                          to='/reports/customers'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="currentColor" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="currentColor" />
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.customers")}</span>
                          </div>
                        </Link>
                        <Link
                          to='/reports/vehicle-insurance'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M14 16H9m10 0a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0V2a1 1 0 00-1-1H8a1 1 0 00-1 1v2m8 0a2 2 0 012 2v10M9 7h6m-6 4h6m-6 4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.vehicleInsurance")}</span>
                          </div>
                        </Link>
                        <Link
                          to='/reports/other-insurance'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.otherInsurance")}</span>
                          </div>
                        </Link>
                        <Link
                          to='/reports/accidents'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.accidents")}</span>
                          </div>
                        </Link>
                        <Link
                          to='/reports/revenues'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M12 2v20m8-18H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="m15 9-3 3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.revenues")}</span>
                          </div>
                        </Link>
                        <Link
                          to='/reports/payments'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.payments")}</span>
                          </div>
                        </Link>
                        <Link
                          to='/reports/receivables-debts'
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-dark-4 transition-colors duration-200 hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-[#FFFFFF1A] dark:hover:text-[rgb(255,255,255)]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{t("sideBar.mainMenu.categore.reports.receivablesDebts")}</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </li>

              </ul>
            </nav>
          </div>
          <div className="mb-4">
            <h2 className="mb-2 px-3 text-sm font-medium text-dark-4 dark:text-dark-6 uppercase">{t("sideBar.support.title")} </h2>
            <nav role="navigation" aria-label="MAIN MENU">
              <ul className="space-y-2">
                 
                    
                <li>
                  <Link to='/emails' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V6ZM5 5C4.44772 5 4 5.44772 4 6V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H5Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.29289 5.29289C2.68342 4.90237 3.31658 4.90237 3.70711 5.29289L12 13.5858L20.2929 5.29289C20.6834 4.90237 21.3166 4.90237 21.7071 5.29289C22.0976 5.68342 22.0976 6.31658 21.7071 6.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L2.29289 6.70711C1.90237 6.31658 1.90237 5.68342 2.29289 5.29289Z" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.emailManagement")}</span>
                  </Link>
                </li>
                 <li>
                  <Link to='/payment' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V6ZM5 5C4.44772 5 4 5.44772 4 6V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H5Z" fill="currentColor"/>
                      <path d="M4 9H20V11H4V9Z" fill="currentColor"/>
                      <path d="M6 13H10V15H6V13Z" fill="currentColor"/>
                      <path d="M14 13H16V15H14V13Z" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.onlinePayment")}</span>
                  </Link>
                </li>
                 <li>
                  <Link to='/sms' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3596 22 8.77516 21.6036 7.35656 20.8645L2.35656 21.8645C2.15678 21.9127 1.94678 21.8472 1.79289 21.6933C1.639 21.5394 1.57354 21.3294 1.62178 21.1296L2.62178 16.1296C1.88265 14.7110 1.48622 13.1266 1.48622 11.4862C1.48622 11.3265 1.49622 11.1638 1.51622 11C1.73622 5.75715 6.25715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 12.7478 4.13622 13.4627 4.38356 14.1205L4.61644 14.6795L3.61644 19.3205L8.32356 18.3205L8.88356 18.5534C9.5413 18.8007 10.2562 18.9369 11 18.9622C16.2428 18.7622 20 15.2428 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor"/>
                      <path d="M8 10C8 9.44772 8.44772 9 9 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H9C8.44772 11 8 10.5523 8 10Z" fill="currentColor"/>
                      <path d="M8 14C8 13.4477 8.44772 13 9 13H13C13.5523 13 14 13.4477 14 14C14 14.5523 13.5523 15 13 15H9C8.44772 15 8 14.5523 8 14Z" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.sms")}</span>
                  </Link>
                </li>
                 <li>

                  <div>
                    <Link to='/auditlog' aria-expanded="false" className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px] dark:text-textNav" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.04832 2.48826C8.33094 2.79108 8.31458 3.26567 8.01176 3.54829L3.72605 7.54829C3.57393 7.69027 3.36967 7.76267 3.1621 7.74818C2.95453 7.7337 2.7623 7.63363 2.63138 7.4719L1.41709 5.9719C1.15647 5.64996 1.20618 5.17769 1.52813 4.91707C1.85007 4.65645 2.32234 4.70616 2.58296 5.0281L3.29089 5.90261L6.98829 2.45171C7.2911 2.16909 7.76569 2.18545 8.04832 2.48826ZM11.25 5C11.25 4.58579 11.5858 4.25 12 4.25H22C22.4142 4.25 22.75 4.58579 22.75 5C22.75 5.41422 22.4142 5.75 22 5.75H12C11.5858 5.75 11.25 5.41422 11.25 5ZM8.04832 9.48826C8.33094 9.79108 8.31458 10.2657 8.01176 10.5483L3.72605 14.5483C3.57393 14.6903 3.36967 14.7627 3.1621 14.7482C2.95453 14.7337 2.7623 14.6336 2.63138 14.4719L1.41709 12.9719C1.15647 12.65 1.20618 12.1777 1.52813 11.9171C1.85007 11.6564 2.32234 11.7062 2.58296 12.0281L3.29089 12.9026L6.98829 9.45171C7.2911 9.16909 7.76569 9.18545 8.04832 9.48826ZM11.25 12C11.25 11.5858 11.5858 11.25 12 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H12C11.5858 12.75 11.25 12.4142 11.25 12ZM8.04832 16.4883C8.33094 16.7911 8.31458 17.2657 8.01176 17.5483L3.72605 21.5483C3.57393 21.6903 3.36967 21.7627 3.1621 21.7482C2.95453 21.7337 2.7623 21.6336 2.63138 21.4719L1.41709 19.9719C1.15647 19.65 1.20618 19.1777 1.52813 18.9171C1.85007 18.6564 2.32234 18.7062 2.58296 19.0281L3.29089 19.9026L6.98829 16.4517C7.2911 16.1691 7.76569 16.1855 8.04832 16.4883ZM11.25 19C11.25 18.5858 11.5858 18.25 12 18.25H22C22.4142 18.25 22.75 18.5858 22.75 19C22.75 19.4142 22.4142 19.75 22 19.75H12C11.5858 19.75 11.25 19.4142 11.25 19Z" fill="currentColor" />
                      </svg>
                      <span>{t("sideBar.mainMenu.categore.audits")}</span>
                    </Link>
                  </div>





                </li>
                 
              </ul>
            </nav>
          </div>

      
        </div>
      </div>
      <AddInsuranceMandatory isOpen={isOpenMandatory} onClose={() => setIsOpenMandatory(false)} />
      <AddInsuranceThiry isOpen={isOpenThird} onClose={() => setIsOpenThird(false)} />
      <AddInsuranceFull isOpen={isOpenFull} onClose={() => setIsOpenFull(false)} />
      <InsuranceAhliaRep isOpen={isOpenAhliaRep} onClose={() => setIsOpenAhliaRep(false)} />
      <InsuranceMashreqRep isOpen={isOpenMashreqMashreq} onClose={() => setIsMashreqMashreq(false)} />
      <InsuranceTakafulRep isOpen={isOpenTakafulRep} onClose={() => setIsOpenTakafulRep(false)} />
      <InsurancePalestineRep isOpen={isOpenPalestinelRep} onClose={() => setIsOpenPalestinelRep(false)} />
      <InsuranceTrustRep isOpen={isOpenTrustRep} onClose={() => setIsOpenTrustRep(false)} />
      <InsuranceHoliRep isOpen={isOpenHoliRep} onClose={() => setIsOpenHoliRep(false)} />
      <AddInsuranceCompany isOpen={isOpenAddInsurance} onClose={() => setIsOpenAddInsurance(false)} />
      <AddCustomer isOpen={isOpenAddCustomer} onClose={() => setIsOpenAddCustomer(false)} />
      <AddInsuranceCompany isOpen={isOpenAddCompany} onClose={() => setIsOpenAddCompany(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30  bg-opacity-30 2md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}

export default Sidebar