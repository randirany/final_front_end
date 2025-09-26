import Navbar from './src/components/Navbar'
import { useState } from "react";
import { Outlet } from 'react-router-dom'
import Sidebar from './src/components/Sidebar'
import { useTranslation } from 'react-i18next';
import { useTheme } from './src/context/ThemeProvider';

function Root() {
  const { t, i18n: { language } } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRTL = language === 'ar'; // Helper for RTL languages
  const { isDarkMode } = useTheme();
  return (
    <div>
      {
        language == "en" ? <>
        </> : <>
        </>
      }
      <div className='flex sidebarCompo' style={{ direction: 'ltr!important' }}>
        <Sidebar sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className={` ${language == 'en' ? 'paddingCompEn' : 'paddingCompAr'} ${isDarkMode? 'secondcomponent':'secondcomponentLight'}`} style={{ width: '100%',background:" rgb(241, 242, 242);" }}>
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            t={t}
          />          <div style={{ marginTop: '59px' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
export function AuthLayout() {
  return <Outlet />;
}
export default Root