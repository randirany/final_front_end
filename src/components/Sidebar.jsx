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
  // const [isOpenReport, setIsOpenReport] = useState(false)
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
                  <Link to='/customers' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width={24} height={24} viewBox="0 0 24 24" className="size-6 shrink-0 w-[19px] h-[19px]" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="currentColor" /></svg>
                    <span>{t("sideBar.mainMenu.categore.custom")}</span>
                  </Link>
                </li>
                <li>
                  <Link to='/sms' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V6ZM5 5C4.44772 5 4 5.44772 4 6V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H5Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.29289 5.29289C2.68342 4.90237 3.31658 4.90237 3.70711 5.29289L12 13.5858L20.2929 5.29289C20.6834 4.90237 21.3166 4.90237 21.7071 5.29289C22.0976 5.68342 22.0976 6.31658 21.7071 6.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L2.29289 6.70711C1.90237 6.31658 1.90237 5.68342 2.29289 5.29289Z" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.sms")}</span>
                  </Link>
                </li>
                <li>
                  <div>
                    <Link aria-expanded="false" to='/InsuranceCompany' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]" ><path fillRule="evenodd" clipRule="evenodd" d="M6.5 1.75C3.87665 1.75 1.75 3.87665 1.75 6.5C1.75 9.12335 3.87665 11.25 6.5 11.25C9.12335 11.25 11.25 9.12335 11.25 6.5C11.25 3.87665 9.12335 1.75 6.5 1.75ZM3.25 6.5C3.25 4.70507 4.70507 3.25 6.5 3.25C8.29493 3.25 9.75 4.70507 9.75 6.5C9.75 8.29493 8.29493 9.75 6.5 9.75C4.70507 9.75 3.25 8.29493 3.25 6.5Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M17.5 12.75C14.8766 12.75 12.75 14.8766 12.75 17.5C12.75 20.1234 14.8766 22.25 17.5 22.25C20.1234 22.25 22.25 20.1234 22.25 17.5C22.25 14.8766 20.1234 12.75 17.5 12.75ZM14.25 17.5C14.25 15.7051 15.7051 14.25 17.5 14.25C19.2949 14.25 20.75 15.7051 20.75 17.5C20.75 19.2949 19.2949 20.75 17.5 20.75C15.7051 20.75 14.25 19.2949 14.25 17.5Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12.75 6.5C12.75 3.87665 14.8766 1.75 17.5 1.75C20.1234 1.75 22.25 3.87665 22.25 6.5C22.25 9.12335 20.1234 11.25 17.5 11.25C14.8766 11.25 12.75 9.12335 12.75 6.5ZM17.5 3.25C15.7051 3.25 14.25 4.70507 14.25 6.5C14.25 8.29493 15.7051 9.75 17.5 9.75C19.2949 9.75 20.75 8.29493 20.75 6.5C20.75 4.70507 19.2949 3.25 17.5 3.25Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M6.5 12.75C3.87665 12.75 1.75 14.8766 1.75 17.5C1.75 20.1234 3.87665 22.25 6.5 22.25C9.12335 22.25 11.25 20.1234 11.25 17.5C11.25 14.8766 9.12335 12.75 6.5 12.75ZM3.25 17.5C3.25 15.7051 4.70507 14.25 6.5 14.25C8.29493 14.25 9.75 15.7051 9.75 17.5C9.75 19.2949 8.29493 20.75 6.5 20.75C4.70507 20.75 3.25 19.2949 3.25 17.5Z" fill="currentColor" /></svg>
                      <span>{t("sideBar.mainMenu.categore.insucresComp.titleInsucresComp")}</span>
                    </Link>
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

                  <div>
                    <Link to='/auditlog' aria-expanded="false" className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px] dark:text-textNav" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.04832 2.48826C8.33094 2.79108 8.31458 3.26567 8.01176 3.54829L3.72605 7.54829C3.57393 7.69027 3.36967 7.76267 3.1621 7.74818C2.95453 7.7337 2.7623 7.63363 2.63138 7.4719L1.41709 5.9719C1.15647 5.64996 1.20618 5.17769 1.52813 4.91707C1.85007 4.65645 2.32234 4.70616 2.58296 5.0281L3.29089 5.90261L6.98829 2.45171C7.2911 2.16909 7.76569 2.18545 8.04832 2.48826ZM11.25 5C11.25 4.58579 11.5858 4.25 12 4.25H22C22.4142 4.25 22.75 4.58579 22.75 5C22.75 5.41422 22.4142 5.75 22 5.75H12C11.5858 5.75 11.25 5.41422 11.25 5ZM8.04832 9.48826C8.33094 9.79108 8.31458 10.2657 8.01176 10.5483L3.72605 14.5483C3.57393 14.6903 3.36967 14.7627 3.1621 14.7482C2.95453 14.7337 2.7623 14.6336 2.63138 14.4719L1.41709 12.9719C1.15647 12.65 1.20618 12.1777 1.52813 11.9171C1.85007 11.6564 2.32234 11.7062 2.58296 12.0281L3.29089 12.9026L6.98829 9.45171C7.2911 9.16909 7.76569 9.18545 8.04832 9.48826ZM11.25 12C11.25 11.5858 11.5858 11.25 12 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H12C11.5858 12.75 11.25 12.4142 11.25 12ZM8.04832 16.4883C8.33094 16.7911 8.31458 17.2657 8.01176 17.5483L3.72605 21.5483C3.57393 21.6903 3.36967 21.7627 3.1621 21.7482C2.95453 21.7337 2.7623 21.6336 2.63138 21.4719L1.41709 19.9719C1.15647 19.65 1.20618 19.1777 1.52813 18.9171C1.85007 18.6564 2.32234 18.7062 2.58296 19.0281L3.29089 19.9026L6.98829 16.4517C7.2911 16.1691 7.76569 16.1855 8.04832 16.4883ZM11.25 19C11.25 18.5858 11.5858 18.25 12 18.25H22C22.4142 18.25 22.75 18.5858 22.75 19C22.75 19.4142 22.4142 19.75 22 19.75H12C11.5858 19.75 11.25 19.4142 11.25 19Z" fill="currentColor" />
                      </svg>
                      <span>{t("sideBar.mainMenu.categore.audits")}</span>
                    </Link>
                  </div>





                </li>
                <li>
                  <div>
                    <button aria-expanded="false" className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px] dark:text-dark3" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.9451 1.25H12.0549C13.4225 1.24998 14.5248 1.24996 15.3918 1.36652C16.2919 1.48754 17.0497 1.74643 17.6517 2.34835C18.3916 3.08833 18.6205 4.07517 18.7012 5.29943C18.9462 5.31578 19.1763 5.33755 19.3918 5.36652C20.2919 5.48754 21.0497 5.74643 21.6517 6.34835C22.2536 6.95027 22.5125 7.70814 22.6335 8.60825C22.75 9.47522 22.75 10.5775 22.75 11.9451V12.0549C22.75 13.4225 22.75 14.5248 22.6335 15.3918C22.5125 16.2919 22.2536 17.0497 21.6517 17.6517C20.9117 18.3916 19.9248 18.6205 18.7006 18.7012C18.6842 18.9462 18.6625 19.1763 18.6335 19.3918C18.5125 20.2919 18.2536 21.0497 17.6517 21.6517C17.0497 22.2536 16.2919 22.5125 15.3918 22.6335C14.5248 22.75 13.4225 22.75 12.0549 22.75H11.9451C10.5775 22.75 9.47522 22.75 8.60825 22.6335C7.70814 22.5125 6.95027 22.2536 6.34835 21.6517C5.74643 21.0497 5.48754 20.2919 5.36652 19.3918C5.33755 19.1763 5.31578 18.9462 5.29942 18.7012C4.07517 18.6205 3.08833 18.3916 2.34835 17.6517C1.74643 17.0497 1.48754 16.2919 1.36652 15.3918C1.24996 14.5248 1.24998 13.4225 1.25 12.0549V11.9451C1.24998 10.5775 1.24996 9.47522 1.36652 8.60825C1.48754 7.70814 1.74643 6.95027 2.34835 6.34835C2.95027 5.74643 3.70814 5.48754 4.60825 5.36652C4.82374 5.33755 5.05377 5.31578 5.29879 5.29943C5.37952 4.07517 5.60837 3.08833 6.34835 2.34835C6.95027 1.74643 7.70814 1.48754 8.60825 1.36652C9.47522 1.24996 10.5775 1.24998 11.9451 1.25ZM6.80714 5.25295C7.16406 5.24999 7.54313 5.24999 7.94512 5.25H16.0549C16.4569 5.24999 16.8359 5.24999 17.1929 5.25295C17.1109 4.23209 16.9265 3.74452 16.591 3.40901C16.3142 3.13225 15.9257 2.9518 15.1919 2.85315C14.4365 2.75159 13.4354 2.75 12 2.75C10.5646 2.75 9.56347 2.75159 8.80812 2.85315C8.07434 2.9518 7.68577 3.13225 7.40901 3.40901C7.0735 3.74452 6.88909 4.23209 6.80714 5.25295ZM5.25294 17.1929C5.24999 16.8359 5.24999 16.4569 5.25 16.0549L5.25 12.9384C5.0954 13.001 4.94783 13.0642 4.8072 13.1273C4.42933 13.297 3.98546 13.1282 3.8158 12.7503C3.64614 12.3724 3.81493 11.9286 4.1928 11.7589C5.91456 10.9858 8.4805 10.25 12 10.25C15.5195 10.25 18.0854 10.9858 19.8072 11.7589C20.1851 11.9286 20.3539 12.3724 20.1842 12.7503C20.0145 13.1282 19.5707 13.297 19.1928 13.1273C19.0522 13.0642 18.9046 13.001 18.75 12.9384V16.0549C18.75 16.4569 18.75 16.8359 18.7471 17.1929C19.7679 17.1109 20.2555 16.9265 20.591 16.591C20.8678 16.3142 21.0482 15.9257 21.1469 15.1919C21.2484 14.4365 21.25 13.4354 21.25 12C21.25 10.5646 21.2484 9.56347 21.1469 8.80812C21.0482 8.07435 20.8678 7.68577 20.591 7.40901C20.3142 7.13225 19.9257 6.9518 19.1919 6.85315C18.4365 6.75159 17.4354 6.75 16 6.75H8C6.56458 6.75 5.56347 6.75159 4.80812 6.85315C4.07435 6.9518 3.68577 7.13225 3.40901 7.40901C3.13225 7.68577 2.9518 8.07435 2.85315 8.80812C2.75159 9.56347 2.75 10.5646 2.75 12C2.75 13.4354 2.75159 14.4365 2.85315 15.1919C2.9518 15.9257 3.13225 16.3142 3.40901 16.591C3.74452 16.9265 4.23209 17.1109 5.25294 17.1929ZM17.25 12.4268C15.8731 12.0376 14.134 11.75 12 11.75C9.86596 11.75 8.12694 12.0376 6.75 12.4268V16C6.75 17.4354 6.75159 18.4365 6.85315 19.1919C6.9518 19.9257 7.13225 20.3142 7.40901 20.591C7.68577 20.8678 8.07435 21.0482 8.80812 21.1469C9.56347 21.2484 10.5646 21.25 12 21.25C13.4354 21.25 14.4365 21.2484 15.1919 21.1469C15.9257 21.0482 16.3142 20.8678 16.591 20.591C16.8678 20.3142 17.0482 19.9257 17.1469 19.1919C17.2484 18.4365 17.25 17.4354 17.25 16V12.4268Z" fill="currentColor" />
                      </svg>

                      <span>{t("sideBar.mainMenu.categore.payment")}</span>
                    </button>
                  </div>
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
                  <Link to='/emails' className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V6ZM5 5C4.44772 5 4 5.44772 4 6V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H5Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.29289 5.29289C2.68342 4.90237 3.31658 4.90237 3.70711 5.29289L12 13.5858L20.2929 5.29289C20.6834 4.90237 21.3166 4.90237 21.7071 5.29289C22.0976 5.68342 22.0976 6.31658 21.7071 6.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L2.29289 6.70711C1.90237 6.31658 1.90237 5.68342 2.29289 5.29289Z" fill="currentColor"/>
                    </svg>
                    <span>{t("sideBar.mainMenu.categore.emailManagement")}</span>
                  </Link>
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

              </ul>
            </nav>
          </div>
          <div className="mb-4">
            <h2 className="mb-2 px-3 text-sm font-medium text-dark-4 dark:text-dark-6 uppercase">{t("sideBar.support.title")} </h2>
            <nav role="navigation" aria-label="MAIN MENU">
              <ul className="space-y-2">
                <li>
                  <a className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3" href="/message">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]" >
                      <path fillRule="evenodd" clipRule="evenodd" d="M8.98899 5.30778C10.169 2.90545 12.6404 1.25 15.5 1.25C19.5041 1.25 22.75 4.49594 22.75 8.5C22.75 9.57209 22.5168 10.5918 22.0977 11.5093C21.9883 11.7488 21.967 11.975 22.0156 12.1568L22.143 12.6328C22.5507 14.1566 21.1566 15.5507 19.6328 15.143L19.1568 15.0156C19.0215 14.9794 18.8616 14.982 18.6899 15.0307C18.1798 19.3775 14.4838 22.75 10 22.75C8.65003 22.75 7.36949 22.4438 6.2259 21.8963C5.99951 21.7879 5.7766 21.7659 5.59324 21.815L4.3672 22.143C2.84337 22.5507 1.44927 21.1566 1.857 19.6328L2.18504 18.4068C2.2341 18.2234 2.21211 18.0005 2.10373 17.7741C1.55623 16.6305 1.25 15.35 1.25 14C1.25 9.50945 4.63273 5.80897 8.98899 5.30778ZM10.735 5.28043C15.0598 5.64011 18.4914 9.14511 18.736 13.5016C18.9986 13.4766 19.2714 13.4935 19.5445 13.5666L20.0205 13.694C20.4293 13.8034 20.8034 13.4293 20.694 13.0205L20.5666 12.5445C20.4095 11.9571 20.5119 11.3708 20.7333 10.8861C21.0649 10.1602 21.25 9.35275 21.25 8.5C21.25 5.32436 18.6756 2.75 15.5 2.75C13.5181 2.75 11.7692 3.75284 10.735 5.28043ZM10 6.75C5.99594 6.75 2.75 9.99594 2.75 14C2.75 15.121 3.00392 16.1807 3.45667 17.1264C3.69207 17.6181 3.79079 18.2087 3.63407 18.7945L3.30602 20.0205C3.19664 20.4293 3.57066 20.8034 3.97949 20.694L5.20553 20.3659C5.79126 20.2092 6.38191 20.3079 6.87362 20.5433C7.81932 20.9961 8.87896 21.25 10 21.25C14.0041 21.25 17.25 18.0041 17.25 14C17.25 9.99594 14.0041 6.75 10 6.75Z" fill="currentColor" />
                      <path d="M7.5 14C7.5 14.5523 7.05228 15 6.5 15C5.94772 15 5.5 14.5523 5.5 14C5.5 13.4477 5.94772 13 6.5 13C7.05228 13 7.5 13.4477 7.5 14Z" fill="currentColor" />
                      <path d="M11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14Z" fill="currentColor" />
                      <path d="M14.5 14C14.5 14.5523 14.0523 15 13.5 15C12.9477 15 12.5 14.5523 12.5 14C12.5 13.4477 12.9477 13 13.5 13C14.0523 13 14.5 13.4477 14.5 14Z" fill="currentColor" />
                    </svg>
                    <span>{t("sideBar.support.categore.msg")}</span>
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]" >
                      <rect y="0.5" width="18" height="19" rx="9" fill="#FEEBEB" />
                      <path d="M8.1 12.52C8.32667 12.4467 8.54333 12.3133 8.75 12.12C8.96333 11.9267 9.14 11.71 9.28 11.47C9.42667 11.2233 9.51333 10.9867 9.54 10.76C9.35333 10.8933 9.16333 10.9867 8.97 11.04C8.77667 11.0933 8.55333 11.12 8.3 11.12C7.96 11.12 7.68 11.0633 7.46 10.95C7.24 10.83 7.00667 10.66 6.76 10.44C6.72 10.4 6.67 10.3133 6.61 10.18C6.55 10.04 6.49667 9.87 6.45 9.67C6.40333 9.46333 6.38 9.25333 6.38 9.04C6.38 8.84667 6.44 8.64333 6.56 8.43C6.68 8.21667 6.83 8.02667 7.01 7.86C7.19667 7.68667 7.37333 7.56333 7.54 7.49C7.69333 7.42333 7.87 7.36667 8.07 7.32C8.27667 7.26667 8.45 7.24 8.59 7.24C9.06333 7.24 9.46 7.35 9.78 7.57C10.1067 7.79 10.3467 8.08333 10.5 8.45C10.6533 8.81667 10.73 9.22333 10.73 9.67C10.73 10.4367 10.56 11.1367 10.22 11.77C9.88 12.3967 9.45 12.8833 8.93 13.23C8.84333 13.29 8.69333 13.3567 8.48 13.43C8.27333 13.4967 8.08333 13.53 7.91 13.53C7.77667 13.53 7.66 13.47 7.56 13.35C7.46 13.23 7.41 13.0933 7.41 12.94C7.41 12.8333 7.44667 12.76 7.52 12.72C7.59333 12.6733 7.71333 12.6267 7.88 12.58L8.1 12.52ZM8.59 8.09C8.48333 8.09 8.35667 8.11333 8.21 8.16C8.07 8.2 7.95 8.25 7.85 8.31C7.73667 8.37667 7.62667 8.48 7.52 8.62C7.42 8.75333 7.37 8.85667 7.37 8.93C7.37 9.80333 7.72333 10.24 8.43 10.24C8.59 10.24 8.76667 10.2067 8.96 10.14C9.16 10.0667 9.32667 9.96667 9.46 9.84C9.59333 9.71333 9.66 9.57 9.66 9.41C9.66 8.97 9.56667 8.64 9.38 8.42C9.2 8.2 8.93667 8.09 8.59 8.09Z" fill="currentColor" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative flex items-center gap-3 py-3" href="/inbox">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]" >
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.9426 1.25H12.0574C14.3658 1.24999 16.1748 1.24998 17.5863 1.43975C19.031 1.63399 20.1711 2.03933 21.0659 2.93414C21.9607 3.82895 22.366 4.96897 22.5603 6.41371C22.75 7.82519 22.75 9.63423 22.75 11.9426V12.0574C22.75 12.3718 22.75 12.6769 22.7495 12.9731C22.7498 12.982 22.75 12.991 22.75 13C22.75 13.0099 22.7498 13.0197 22.7494 13.0296C22.746 14.8816 22.7225 16.3793 22.5603 17.5863C22.366 19.031 21.9607 20.1711 21.0659 21.0659C20.1711 21.9607 19.031 22.366 17.5863 22.5603C16.1748 22.75 14.3658 22.75 12.0574 22.75H11.9426C9.63423 22.75 7.82519 22.75 6.41371 22.5603C4.96897 22.366 3.82895 21.9607 2.93414 21.0659C2.03933 20.1711 1.63399 19.031 1.43975 17.5863C1.27747 16.3793 1.25397 14.8816 1.25057 13.0295C1.25019 13.0197 1.25 13.0099 1.25 13C1.25 12.991 1.25016 12.982 1.25047 12.9731C1.25 12.6769 1.25 12.3718 1.25 12.0574V11.9426C1.24999 9.63423 1.24998 7.82519 1.43975 6.41371C1.63399 4.96897 2.03933 3.82895 2.93414 2.93414C3.82895 2.03933 4.96897 1.63399 6.41371 1.43975C7.82519 1.24998 9.63423 1.24999 11.9426 1.25ZM2.7535 13.75C2.76294 15.2526 2.79778 16.43 2.92637 17.3864C3.09825 18.6648 3.42514 19.4355 3.9948 20.0052C4.56445 20.5749 5.33517 20.9018 6.61358 21.0736C7.91356 21.2484 9.62177 21.25 12 21.25C14.3782 21.25 16.0864 21.2484 17.3864 21.0736C18.6648 20.9018 19.4355 20.5749 20.0052 20.0052C20.5749 19.4355 20.9018 18.6648 21.0736 17.3864C21.2022 16.43 21.2371 15.2526 21.2465 13.75H18.8397C17.8659 13.75 17.6113 13.766 17.3975 13.8644C17.1838 13.9627 17.0059 14.1456 16.3722 14.8849L15.7667 15.5913C15.7372 15.6257 15.7082 15.6597 15.6794 15.6933C15.1773 16.2803 14.7796 16.7453 14.2292 16.9984C13.6789 17.2515 13.067 17.2509 12.2945 17.2501C12.2503 17.25 12.2056 17.25 12.1603 17.25H11.8397C11.7944 17.25 11.7497 17.25 11.7055 17.2501C10.933 17.2509 10.3211 17.2515 9.77076 16.9984C9.22039 16.7453 8.82271 16.2803 8.32059 15.6933C8.29184 15.6597 8.26275 15.6257 8.23327 15.5913L7.62784 14.8849C6.9941 14.1456 6.81622 13.9627 6.60245 13.8644C6.38869 13.766 6.13407 13.75 5.16026 13.75H2.7535ZM21.25 12.25H18.8397C18.7944 12.25 18.7497 12.25 18.7055 12.2499C17.933 12.2491 17.3211 12.2485 16.7708 12.5016C16.2204 12.7547 15.8227 13.2197 15.3206 13.8067C15.2918 13.8403 15.2628 13.8743 15.2333 13.9087L14.6278 14.6151C13.9941 15.3544 13.8162 15.5373 13.6025 15.6356C13.3887 15.734 13.1341 15.75 12.1603 15.75H11.8397C10.8659 15.75 10.6113 15.734 10.3975 15.6356C10.1838 15.5373 10.0059 15.3544 9.37216 14.6151L8.76673 13.9087C8.73725 13.8743 8.70816 13.8403 8.67941 13.8067C8.17729 13.2197 7.77961 12.7547 7.22924 12.5016C6.67886 12.2485 6.06705 12.2491 5.29454 12.2499C5.25031 12.25 5.20556 12.25 5.16026 12.25H2.75001C2.75 12.1675 2.75 12.0842 2.75 12C2.75 9.62177 2.75159 7.91356 2.92637 6.61358C3.09825 5.33517 3.42514 4.56445 3.9948 3.9948C4.56445 3.42514 5.33517 3.09825 6.61358 2.92637C7.91356 2.75159 9.62177 2.75 12 2.75C14.3782 2.75 16.0864 2.75159 17.3864 2.92637C18.6648 3.09825 19.4355 3.42514 20.0052 3.9948C20.5749 4.56445 20.9018 5.33517 21.0736 6.61358C21.2484 7.91356 21.25 9.62177 21.25 12C21.25 12.0842 21.25 12.1675 21.25 12.25Z" fill="currentColor" />
                    </svg>
                    <span>{t("sideBar.support.categore.inbo")}</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mb-4">
            <h2 className="mb-2 px-3 text-sm font-medium text-dark-4 dark:text-dark-6 uppercase">{t("sideBar.settings.title")} </h2>
            <nav role="navigation" aria-label="settings ">
              <ul className="space-y-2">

                <li>
                  <div>
                    <button aria-expanded="true" className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 bg-[rgba(87,80,241,0.07)] text-primary hover:bg-[rgba(87,80,241,0.07)] dark:bg-[#FFFFFF1A] dark:text-[rgb(255,255,255)] flex w-full items-center gap-3 py-3" onClick={() => setIsOpenSetting((prev) => !prev)}>
                      <div className="flex items-center justify-between gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 shrink-0 w-[19px] h-[19px]" >
                          <path d="M14.9453 1.25C13.5778 1.24998 12.4754 1.24996 11.6085 1.36652C10.7084 1.48754 9.95048 1.74643 9.34857 2.34835C8.82363 2.87328 8.55839 3.51836 8.41916 4.27635C8.28387 5.01291 8.25799 5.9143 8.25196 6.99583C8.24966 7.41003 8.58357 7.74768 8.99778 7.74999C9.41199 7.7523 9.74964 7.41838 9.75194 7.00418C9.75803 5.91068 9.78643 5.1356 9.89448 4.54735C9.99859 3.98054 10.1658 3.65246 10.4092 3.40901C10.686 3.13225 11.0746 2.9518 11.8083 2.85315C12.5637 2.75159 13.5648 2.75 15.0002 2.75H16.0002C17.4356 2.75 18.4367 2.75159 19.1921 2.85315C19.9259 2.9518 20.3144 3.13225 20.5912 3.40901C20.868 3.68577 21.0484 4.07435 21.1471 4.80812C21.2486 5.56347 21.2502 6.56459 21.2502 8V16C21.2502 17.4354 21.2486 18.4365 21.1471 19.1919C21.0484 19.9257 20.868 20.3142 20.5912 20.591C20.3144 20.8678 19.9259 21.0482 19.1921 21.1469C18.4367 21.2484 17.4356 21.25 16.0002 21.25H15.0002C13.5648 21.25 12.5637 21.2484 11.8083 21.1469C11.0746 21.0482 10.686 20.8678 10.4092 20.591C10.1658 20.3475 9.99859 20.0195 9.89448 19.4527C9.78643 18.8644 9.75803 18.0893 9.75194 16.9958C9.74964 16.5816 9.41199 16.2477 8.99778 16.25C8.58357 16.2523 8.24966 16.59 8.25196 17.0042C8.25799 18.0857 8.28387 18.9871 8.41916 19.7236C8.55839 20.4816 8.82363 21.1267 9.34857 21.6517C9.95048 22.2536 10.7084 22.5125 11.6085 22.6335C12.4754 22.75 13.5778 22.75 14.9453 22.75H16.0551C17.4227 22.75 18.525 22.75 19.392 22.6335C20.2921 22.5125 21.0499 22.2536 21.6519 21.6517C22.2538 21.0497 22.5127 20.2919 22.6337 19.3918C22.7503 18.5248 22.7502 17.4225 22.7502 16.0549V7.94513C22.7502 6.57754 22.7503 5.47522 22.6337 4.60825C22.5127 3.70814 22.2538 2.95027 21.6519 2.34835C21.0499 1.74643 20.2921 1.48754 19.392 1.36652C18.525 1.24996 17.4227 1.24998 16.0551 1.25H14.9453Z" fill="currentColor" />
                          <path d="M2.00098 11.249C1.58676 11.249 1.25098 11.5848 1.25098 11.999C1.25098 12.4132 1.58676 12.749 2.00098 12.749L13.9735 12.749L12.0129 14.4296C11.6984 14.6991 11.662 15.1726 11.9315 15.4871C12.2011 15.8016 12.6746 15.838 12.9891 15.5685L16.4891 12.5685C16.6553 12.426 16.751 12.218 16.751 11.999C16.751 11.7801 16.6553 11.5721 16.4891 11.4296L12.9891 8.42958C12.6746 8.16002 12.2011 8.19644 11.9315 8.51093C11.662 8.82543 11.6984 9.2989 12.0129 9.56847L13.9735 11.249L2.00098 11.249Z" fill="currentColor" />
                        </svg>
                        <span>{t("sideBar.settings.auth.title")}</span>
                      </div>
                      {
                        isOpenSetting ? <>
                          <svg width="16" height="8" viewBox="0 0 16 8" fill="currentColor" className={`${language == 'en' ? 'ml-auto' : 'mr-auto'} rotate-0 transition-transform duration-200`} aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M7.553.728a.687.687 0 01.895 0l6.416 5.5a.688.688 0 01-.895 1.044L8 2.155 2.03 7.272a.688.688 0 11-.894-1.044l6.417-5.5z"></path></svg>
                        </> : <>
                          <svg width="16" height="8" viewBox="0 0 16 8" fill="currentColor" className={`${language == 'en' ? 'ml-auto' : 'mr-auto'} rotate-180 transition-transform duration-200`} aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M7.553.728a.687.687 0 01.895 0l6.416 5.5a.688.688 0 01-.895 1.044L8 2.155 2.03 7.272a.688.688 0 11-.894-1.044l6.417-5.5z"></path></svg>
                        </>
                      }
                    </button>
                    {
                      isOpenSetting && (
                        <ul className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2" role="menu">
                          <li role="none">
                            <a className="text-[14px] rounded-lg px-3.5 font-medium transition-all duration-200 bg-[rgba(87,80,241,0.07)] text-primary hover:bg-[rgba(87,80,241,0.07)] dark:bg-[#FFFFFF1A] dark:text-[rgb(255,255,255)] relative block py-2" href="/login">
                              <span>{t("sideBar.settings.auth.categore.signIn")}</span>
                            </a>
                          </li>

                          <li role="none">
                            <a className="text-[14px] rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6 hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-[rgb(255,255,255)] relative block py-2" href="/analytics">
                              <span>{t("sideBar.settings.auth.categore.Reset")}</span>
                            </a>
                          </li>
                        </ul>
                      )
                    }

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