import Navbar from './src/components/Navbar'
import { useState, useEffect } from "react";
import { Outlet } from 'react-router-dom'
import Sidebar from './src/components/Sidebar'
import { useTranslation } from 'react-i18next';
import { useTheme } from './src/context/ThemeProvider';

function Root() {
  const { t, i18n: { language } } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();

  // Update document lang and dir attributes when language changes
  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = (language === 'ar' || language === 'he') ? 'rtl' : 'ltr';

    // Add font class to body based on language
    document.body.className = document.body.className.replace(/font-(arabic|english)/g, '');
    document.body.classList.add((language === 'ar' || language === 'he') ? 'font-arabic' : 'font-english');
  }, [language]);

  return (
    <div>
      <div className='flex sidebarCompo' style={{ direction: 'ltr!important' }}>
        <Sidebar sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className={` ${language == 'en' ? 'paddingCompEn' : 'paddingCompAr'} ${isDarkMode? 'secondcomponent':'secondcomponentLight'}`} style={{ width: '100%',background:"rgb(241, 242, 242)" }}>
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