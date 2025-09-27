/*import { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserContext } from '../context/User';
import avater from '../assets/Avatar.png';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeProvider';
import axios from 'axios';
import { io } from 'socket.io-client';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = 'http://localhost:3002/api/v1';
const SOCKET_URL = 'http://localhost:3002';

let socket;

function Navbar({ setSidebarOpen, sidebarOpen }) {
  const { logout, UserData } = useContext(UserContext);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t, i18n } = useTranslation(); 
  const { language } = i18n;
  const { isDarkMode, toggleDarkMode } = useTheme();

  
  const tokenForAPI = useMemo(() => {
    const rawToken = localStorage.getItem("token");
    if (rawToken && rawToken !== "null" && rawToken !== "undefined") {
      return `islam__${rawToken}`;
    }
    return null;
  }, []); 
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!tokenForAPI) return;
    setLoadingNotifications(true);
    setNotificationError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/notification/all`, {
        headers: { token: tokenForAPI } 
      });
      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      setNotificationError(t('nav.dropdown.fetchError', 'Failed to load notifications.'));
    } finally {
      setLoadingNotifications(false);
    }
  }, [tokenForAPI, t]); 

  useEffect(() => {
    if (tokenForAPI) {
      try {
        const decoded = jwtDecode(tokenForAPI);
      } catch {
            // Handle error silently
        }
      if (UserData?._id) {
        fetchNotifications();

        if (socket) {
            socket.disconnect();
        }
        
        socket = io(SOCKET_URL, {
          
        });

        socket.on('connect', () => {
          if (UserData?._id) {
            socket.emit('registerUser', UserData._id);
          } else {
          }
        });

        socket.on('newNotification', (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
          if (!newNotification.isRead) {
            setUnreadCount(prev => prev + 1);
          }
        });

        socket.on('notificationUpdated', (updatedNotification) => {
          setNotifications(prev =>
            prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
          );
          setUnreadCount(prev => prev.filter(n => !n.isRead).length);
        });

        socket.on('disconnect', (reason) => {
        });

        socket.on('connect_error', (err) => {
        });
      } else {
        if (socket && socket.connected) {
            socket.disconnect();
        }
      }

      return () => {
        if (socket) {
          socket.disconnect(); 
        }
      };
    } else { 
      if (socket && socket.connected) {
        socket.disconnect();
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [UserData?._id, tokenForAPI, fetchNotifications]);


  const handleMarkAsRead = async (notificationId) => {
    if (!tokenForAPI) return;
    const originalNotifications = [...notifications];
    const notificationToUpdate = notifications.find(n => n._id === notificationId);

    if (notificationToUpdate && !notificationToUpdate.isRead) {
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } else if (!notificationToUpdate) {
      return;
    }
   
    try {
      await axios.patch(`${API_BASE_URL}/notification/markAsRead/${notificationId}`, {}, {
        headers: { token: tokenForAPI },
      });
    } catch (error) {
      if (notificationToUpdate && !notificationToUpdate.isRead) {
        setNotifications(originalNotifications);
        setUnreadCount(prev => prev + 1);
      }
      alert(t('nav.dropdown.markReadError', 'Failed to mark as read.'));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!tokenForAPI || unreadCount === 0) return;
    const originalNotifications = [...notifications];
    const oldUnreadCount = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      
      await axios.put(`${API_BASE_URL}/notification/markAllAsRead`, {}, {
        headers: { token: tokenForAPI },
      });
    } catch (error) {
      setNotifications(originalNotifications);
      setUnreadCount(oldUnreadCount);
      alert(t('nav.dropdown.markAllReadError', 'Failed to mark all as read.'));
    }
  };

  const toggleNotification = () => {
    setNotificationOpen(prevState => !prevState);
    if (profileOpen) setProfileOpen(false);
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const toggleProfile = () => {
    setProfileOpen(prevState => !prevState);
    if (notificationOpen) setNotificationOpen(false);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return t('time.now', 'just now');
    if (minutes < 60) return t('time.minutesAgo', '{{count}}m ago', { count: minutes });
    if (hours < 24) return t('time.hoursAgo', '{{count}}h ago', { count: hours });
    return t('time.daysAgo', '{{count}}d ago', { count: days });
  };*/
import { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserContext } from '../context/User';
import avater from '../assets/Avatar.png';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeProvider';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3002/api/v1';
const SOCKET_URL = 'http://localhost:3002';

function Navbar({ setSidebarOpen, sidebarOpen }) {
  const { logout, UserData } = useContext(UserContext);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { language } = i18n;
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  // Customer search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (!UserData?.id) {
      return;
    }

    const rawToken = localStorage.getItem("token");
    if (!rawToken || rawToken === "null" || rawToken === "undefined") {
      return;
    }
    const token = `islam__${rawToken}`;

    // تحميل الإشعارات من API
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      setNotificationError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/notification/all`, {
          headers: { token }
        });

        const fetchedNotifications = response.data.notifications || [];
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        setNotificationError(t('nav.dropdown.fetchError', 'Failed to load notifications.'));
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();

    // إعداد socket
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      socket.emit('registerUser', UserData.id);
    });

    socket.on('newNotification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      if (!newNotification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    socket.on('notificationUpdated', (updatedNotification) => {
      setNotifications(prev =>
        prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
      );
      setUnreadCount(prev => {
        const unread = notifications.filter(n => !n.isRead).length;
        return unread;
      });
    });

    socket.on('disconnect', (reason) => {
    });

    socket.on('connect_error', (err) => {
    });

    // تنظيف عند تفكيك الكومبوننت
    return () => {
      socket.disconnect();
    };
  }, [UserData, t]);

  const handleMarkAsRead = async (notificationId) => {

    const rawToken = localStorage.getItem("token");
    if (!rawToken) {
      return;
    }
    const token = `islam__${rawToken}`;

    const originalNotifications = [...notifications];
    const notificationToUpdate = notifications.find(n => n._id === notificationId);

    if (notificationToUpdate && !notificationToUpdate.isRead) {
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } else {
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/notification/markAsRead/${notificationId}`, {}, {
        headers: { token },
      });
    } catch (error) {
      setNotifications(originalNotifications);
      setUnreadCount(prev => prev + 1);
      alert(t('nav.dropdown.markReadError', 'Failed to mark as read.'));
    }
  };

  const handleMarkAllAsRead = async () => {
    const rawToken = localStorage.getItem("token");
    if (!rawToken || unreadCount === 0) {
      return;
    }
    const token = `islam__${rawToken}`;

    const originalNotifications = [...notifications];
    const oldUnreadCount = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await axios.put(`${API_BASE_URL}/notification/markAllAsRead`, {}, {
        headers: { token },
      });
    } catch (error) {
      setNotifications(originalNotifications);
      setUnreadCount(oldUnreadCount);
      alert(t('nav.dropdown.markAllReadError', 'Failed to mark all as read.'));
    }
  };



  

  const toggleNotification = () => {
    setNotificationOpen(prev => !prev);
    if (profileOpen) setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(prev => !prev);
    if (notificationOpen) setNotificationOpen(false);
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return t('time.now', 'just now');
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  if (hours < 24) return t('time.hoursAgo', { count: hours });
  return t('time.daysAgo', { count: days });
};

// Fetch customers for search
const fetchCustomers = useCallback(async () => {
  try {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return;

    const token = `islam__${rawToken}`;
    const response = await axios.get(`${API_BASE_URL}/insured/allInsured`, {
      headers: { token }
    });

    const formattedCustomers = response.data.insuredList.map(item => ({
      id: item._id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      email: item.email,
      mobile: item.phone_number,
      idNumber: item.id_number,
      city: item.city,
      agentsName: item.agentsName
    }));

    setCustomers(formattedCustomers);
  } catch {
            // Handle error silently
        }
}, []);

// Load customers on component mount
useEffect(() => {
  fetchCustomers();
}, [fetchCustomers]);

// Debounced search function
const debouncedSearch = useCallback(
  useMemo(() => {
    let timeoutId;
    return (query) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (query.trim().length > 0) {
          const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.email?.toLowerCase().includes(query.toLowerCase()) ||
            customer.mobile?.includes(query) ||
            customer.idNumber?.includes(query)
          ).slice(0, 8); // Limit to 8 results
          setSearchResults(filtered);
        } else {
          setSearchResults([]);
        }
        setSearchLoading(false);
      }, 300);
    };
  }, [customers]),
  [customers]
);

// Handle search input change
const handleSearchChange = (e) => {
  const query = e.target.value;
  setSearchQuery(query);
  setSearchDropdownOpen(true);

  if (query.trim().length > 0) {
    setSearchLoading(true);
    debouncedSearch(query);
  } else {
    setSearchResults([]);
    setSearchDropdownOpen(false);
    setSearchLoading(false);
  }
};

// Handle customer selection
const handleCustomerSelect = (customer) => {
  setSearchQuery('');
  setSearchResults([]);
  setSearchDropdownOpen(false);
  navigate(`/profile/${customer.id}`);
};

// Close search dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.customer-search-container')) {
      setSearchDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);



  
  return (
    <div className={` bg-[rgb(255,255,255)] border-b-2 dark:border-b-zinc-800 dark:bg-navbarBack dark:text-dark3  z-20 fixed top-0 ${language === "en" ? "right-0" : "left-0"} 2md:[width:calc(100%-259px)] w-full`}>
      <div className='navblayout'>
        <div className={`flex justify-between  py-2  items-center`} dir={language === "ar" ? "rtl" : "ltr"}>
          <div className='flex justify-between grow items-center'>
            <div className='hidden 2md:block' >
              <p className='text-[24px]'>
                {t("nav.fisrtTitle")}
              </p>
              <span className='text-[16px] text-graySpan'>{t("nav.secondTitle")}</span>
            </div>
            <button
              className={`dark:bg-dark4 z-50 p-2 text-rgb(255,255,255) rounded shadow-md cursor-pointer 2md:hidden`}
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? t('sidebar.closeMenu', 'Close Menu') : t('sidebar.openMenu', 'Open Menu')}
            >
              <svg width="25" height="24" viewBox="0 0 25 24" fill="currentColor"><path d="M3.5625 6C3.5625 5.58579 3.89829 5.25 4.3125 5.25H20.3125C20.7267 5.25 21.0625 5.58579 21.0625 6C21.0625 6.41421 20.7267 6.75 20.3125 6.75L4.3125 6.75C3.89829 6.75 3.5625 6.41422 3.5625 6Z"></path><path d="M3.5625 18C3.5625 17.5858 3.89829 17.25 4.3125 17.25L20.3125 17.25C20.7267 17.25 21.0625 17.5858 21.0625 18C21.0625 18.4142 20.7267 18.75 20.3125 18.75L4.3125 18.75C3.89829 18.75 3.5625 18.4142 3.5625 18Z"></path><path d="M4.3125 11.25C3.89829 11.25 3.5625 11.5858 3.5625 12C3.5625 12.4142 3.89829 12.75 4.3125 12.75L20.3125 12.75C20.7267 12.75 21.0625 12.4142 21.0625 12C21.0625 11.5858 20.7267 11.25 20.3125 11.25L4.3125 11.25Z"></path></svg>
            </button>

            {/* Customer Search Input */}
            <div className="customer-search-container relative hidden md:block mx-4 flex-1 max-w-md">
              <div className="relative">
                <svg
                  className={`absolute top-3 w-4 h-4 text-gray-400 dark:text-gray-500 ${language === 'ar' ? 'right-3' : 'left-3'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('nav.search.placeholder', 'Search customers...')}
                  className={`w-full py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                  onFocus={() => searchQuery && setSearchDropdownOpen(true)}
                />
                {searchLoading && (
                  <div className={`absolute top-3 w-4 h-4 ${language === 'ar' ? 'left-3' : 'right-3'}`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchDropdownOpen && (searchResults.length > 0 || searchLoading) && (
                <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto ${searchDropdownOpen ? "block animate-in fade-in-0 zoom-in-95" : "hidden"}`}>
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {t('nav.search.searching', 'Searching...')}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                        {t('nav.search.results', 'Search Results')}
                      </div>
                      {searchResults.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {customer.email && (
                                  <span className="mr-2">{customer.email}</span>
                                )}
                                {customer.mobile && (
                                  <span className="text-blue-600 dark:text-blue-400">{customer.mobile}</span>
                                )}
                              </div>
                              {customer.city && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {customer.city}
                                </div>
                              )}
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {t('nav.search.noResults', 'No customers found')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className=''>
            <div className='flex justify-center items-center gap-2'> {/* Increased gap slightly if needed */}
              {/* Theme Toggle Button */}
              <button onClick={handleThemeToggle} title={isDarkMode ? t('nav.switchToLight') : t('nav.switchToDark')} className="group rounded-full bg-gray-3 p-[5px] text-[#111928] outline-1 outline-primary focus-visible:outline bg-[#F3F4F6]  dark:bg-dark2">
                <span className="sr-only">{isDarkMode ? t('nav.switchToLight') : t('nav.switchToDark')}</span>
                <span aria-hidden="true" className="relative flex gap-2.5">
                  <span className={`absolute size-[38px] rounded-full border dark:border-gray-200 bg-[rgb(255,255,255)] transition-all duration-300 ease-in-out dark:border dark:border-borderNav-none dark:bg-dark-2 dark:group-hover:bg-dark-3 ${isDarkMode && language === 'en' ? 'translate-x-[48px]' : ''} ${isDarkMode && language === 'ar' ? '-translate-x-[48px]' : ''}`}></span>
                  <span className="relative grid size-[38px] place-items-center rounded-full"><svg className='dark:text-dark3' width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.042c.345 0 .625.28.625.625V2.5a.625.625 0 11-1.25 0v-.833c0-.346.28-.625.625-.625zM3.666 3.665a.625.625 0 01.883 0l.328.328a.625.625 0 01-.884.884l-.327-.328a.625.625 0 010-.884zm12.668 0a.625.625 0 010 .884l-.327.328a.625.625 0 01-.884-.884l.327-.327a.625.625 0 01.884 0zM10 5.626a4.375 4.375 0 100 8.75 4.375 4.375 0 000-8.75zM4.375 10a5.625 5.625 0 1111.25 0 5.625 5.625 0 01-11.25 0zm-3.333 0c0-.345.28-.625.625-.625H2.5a.625.625 0 110 1.25h-.833A.625.625 0 011.042 10zm15.833 0c0-.345.28-.625.625-.625h.833a.625.625 0 010 1.25H17.5a.625.625 0 01-.625-.625zm-1.752 5.123a.625.625 0 01.884 0l.327.327a.625.625 0 11-.884.884l-.327-.327a.625.625 0 010-.884zm-10.246 0a.625.625 0 010 .884l-.328.327a.625.625 0 11-.883-.884l.327-.327a.625.625 0 01.884 0zM10 16.875c.345 0 .625.28.625.625v.833a.625.625 0 01-1.25 0V17.5c0-.345.28-.625.625-.625z"></path></svg></span>
                  <span className="relative grid size-[38px] place-items-center rounded-full dark:text-[rgb(255,255,255)] dark:bg-dark3"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M9.18 2.334a7.71 7.71 0 108.485 8.485A6.042 6.042 0 119.18 2.335zM1.042 10a8.958 8.958 0 018.958-8.958c.598 0 .896.476.948.855.049.364-.086.828-.505 1.082a4.792 4.792 0 106.579 6.579c.253-.42.717-.555 1.081-.506.38.052.856.35.856.948A8.958 8.958 0 011.04 10z"></path></svg></span>
                </span>
              </button>

              <button
                onClick={handleLanguageToggle}
                title={t('nav.toggleLanguage', 'Change Language')}
                aria-label={t('nav.toggleLanguage', 'Change Language')}
                className="grid dark:bg-dark4 dark:border dark:border-borderNav size-12 w-12 h-12 place-items-center rounded-full border bg-gray-2 outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-[rgb(255,255,255)] dark:focus-visible:border-primary"
              >
                <span className="font-semibold text-sm uppercase">
                  {language === 'en' ? t('language.ar', 'AR') : t('language.en', 'EN')}
                </span>
              </button>

              <div className="relative">
                <button
                  className="grid dark:bg-dark4 dark:border dark:border-borderNav size-12 place-items-center rounded-full border bg-gray-2 outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-[rgb(255,255,255)] dark:focus-visible:border-primary"
                  aria-expanded={notificationOpen}
                  aria-haspopup="menu"
                  onClick={toggleNotification}
                >
                  <span className="relative top-0">
                    <svg className='dark:text-[rgb(255,255,255)]' width="20" height="20" viewBox="0 0 20 20" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M10 1.042A6.458 6.458 0 003.542 7.5v.587c0 .58-.172 1.148-.495 1.631l-.957 1.436a2.934 2.934 0 001.67 4.459c.63.171 1.264.316 1.903.435l.002.005c.64 1.71 2.353 2.905 4.335 2.905 1.982 0 3.694-1.196 4.335-2.905l.002-.005a23.736 23.736 0 001.903-.435 2.934 2.934 0 001.67-4.459l-.958-1.436a2.941 2.941 0 01-.494-1.631V7.5A6.458 6.458 0 0010 1.042zm2.813 15.239a23.71 23.71 0 01-5.627 0c.593.85 1.623 1.427 2.814 1.427 1.19 0 2.221-.576 2.813-1.427zM4.792 7.5a5.208 5.208 0 1110.416 0v.587c0 .827.245 1.636.704 2.325l.957 1.435c.638.957.151 2.257-.958 2.56a22.467 22.467 0 01-11.822 0 1.684 1.684 0 01-.959-2.56l.958-1.435a4.192 4.192 0 00.704-2.325V7.5z" fill="currentColor"></path></svg>
                    {unreadCount > 0 && (
                      <span className="absolute left-4 top-[-7px] z-1 size-4 rounded-full bg-red-500 text-[rgb(255,255,255)] text-xs flex items-center justify-center ring-2 ring-gray-2 dark:ring-navbarBack">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                </button>
                {notificationOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className={`px-3.5 py-3 z-50 pointer-events-auto absolute mt-2 min-w-[8rem] origin-top-right rounded-lg border bg-[rgb(255,255,255)] shadow-lg dark:border-navbarBack dark:bg-dark2 min-[350px]:min-w-[17rem] 2md:w-[21rem] ${language === 'ar' ? 'left-0 2md:left-auto 2md:right-[-110px]' : 'right-[-20px] 2md:right-auto 2md:left-[-111px]'}  ${notificationOpen ? "block animate-in fade-in-0 zoom-in-95" : "hidden"}`}
                  >
                    <div className="mb-1 flex items-center justify-between px-2 py-1.5">
                      <span className="text-lg font-medium dark:text-[rgb(255,255,255)]">{t("nav.dropdown.title")}</span>
                      {unreadCount > 0 && (
                        <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-[rgb(255,255,255)]">
                          {t('nav.dropdown.newCount', '{{count}} new', { count: unreadCount })}
                        </span>
                      )}
                    </div>
                    {loadingNotifications ? (
                      <div className="text-center py-4 dark:text-gray-400">{t('loading', 'Loading...')}</div>
                    ) : notificationError ? (
                      <div className="text-center py-4 text-red-500">{notificationError}</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-4 dark:text-gray-400">{t('nav.dropdown.noNotifications', 'No new notifications.')}</div>
                    ) : (
                      <ul className='mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto'>
                        {notifications.map((notification) => (
                          <li key={notification._id} role="menuitem">
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              disabled={notification.isRead} 
                              className={`w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left outline-none hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-gray-500 dark:focus-visible:bg-dark-3 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : 'opacity-70 dark:opacity-60'}`}
                            >
                              <img
                                alt={notification.sender?.name || 'Sender'}
                                src={notification.sender?.avatar || avater}
                                loading="lazy"
                                className="size-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className={`block text-sm font-medium dark:text-[rgb(255,255,255)] ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.message}
                                </p>
                                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                              {!notification.isRead && (
                                <span className="ml-auto size-2.5 rounded-full bg-primary shrink-0"></span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {notifications.length > 0 && ( 
                      <div className="flex flex-col gap-2">
                        {unreadCount > 0 && ( 
                          <button
                            onClick={handleMarkAllAsRead}
                            className="block w-full rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:text-primary dark:border-primary dark:text-primary dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
                          >
                            {t("nav.dropdown.markAllRead", "Mark all as read")}
                          </button>
                        )}
                         {/* For example:
                         <button
                            className="block w-full rounded-lg p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-3"
                          >
                            {t("nav.dropdown.seeAll", "See all notifications")}
                          </button>
                         */}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark" aria-expanded={profileOpen} aria-haspopup="menu" onClick={toggleProfile}>
                  <figure className="flex items-center gap-3">
                    <img alt="Avatar" width="48" height="48" className="size-12 object-cover rounded-full" src={UserData?.avatar || avater} />
                    <figcaption className="dark:text-textNav flex items-center gap-1 font-medium max-[1024px]:sr-only">
                      <span className='dark:text-textNav '>{UserData?.name || t('user', 'User')} </span>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true" className={`dark:text-textNav transform transition-transform ${profileOpen ? "rotate-0" : "rotate-180"}`} strokeWidth="1.5"><path fillRule="evenodd" clipRule="evenodd" d="M10.551 7.728a.687.687 0 01.895 0l6.417 5.5a.687.687 0 11-.895 1.044l-5.97-5.117-5.969 5.117a.687.687 0 01-.894-1.044l6.416-5.5z"></path></svg>
                    </figcaption>
                  </figure>
                </button>
                {profileOpen && (
                  <div className={`z-50 pointer-events-auto absolute mt-2 min-w-[8rem] origin-top-right rounded-lg border bg-[rgb(255,255,255)] shadow-md dark:border-navbarBack dark:bg-dark2 min-[230px]:min-w-[17.5rem] ${language === "ar" ? "left-0" : "right-0"} ${profileOpen ? "block animate-in fade-in-0 zoom-in-95" : "hidden"}`}>
                    <h2 className="sr-only">User information</h2>
                    <figure className="flex items-center gap-2.5 px-[1.25rem] py-[.875rem]">
                      <img alt="Avatar" width="48" height="48" className="size-12 object-cover rounded-full" src={UserData?.avatar || avater} />
                      <figcaption className="space-y-1 text-base font-medium">
                        <div className="mb-1 leading-none text-gray-700 dark:text-gray-300">{UserData?.name || t('user', 'User')}  </div>
                        <div className="text-sm leading-none text-gray-500 dark:text-gray-400">{UserData?.email}</div>
                      </figcaption>
                    </figure>
                    <hr className="border-gray-200 dark:border-zinc-700 "></hr>
                    <div className="p-2 text-base text-gray-700 dark:text-dark-6 [&>*]:cursor-pointer">
                      <a className={`flex w-full ${language=='ar'?'justify-start':'justify-end'} items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-100 hover:text-black  dark:hover:bg-gray-500 dark:hover:bg-dark-3 dark:text-[rgb(255,255,255)] dark:hover:text-[rgb(255,255,255)]`} href="/profile">
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M9 .938a3.562 3.562 0 100 7.124A3.562 3.562 0 009 .938zM6.562 4.5a2.437 2.437 0 114.875 0 2.437 2.437 0 01-4.875 0zM9 9.188c-1.735 0-3.334.394-4.518 1.06-1.167.657-2.045 1.652-2.045 2.877v.076c0 .872-.001 1.965.958 2.747.472.384 1.132.657 2.025.838.894.181 2.06.276 3.58.276s2.685-.095 3.58-.276c.893-.18 1.553-.454 2.025-.838.96-.782.958-1.875.957-2.747v-.076c0-1.226-.877-2.22-2.044-2.877-1.184-.666-2.783-1.06-4.518-1.06zm-5.438 3.937c0-.639.467-1.331 1.471-1.896.987-.555 2.388-.916 3.967-.916 1.579 0 2.98.36 3.967.916 1.004.565 1.47 1.258 1.47 1.896 0 .98-.03 1.533-.542 1.95-.278.227-.743.448-1.538.609-.793.16-1.876.254-3.357.254-1.48 0-2.564-.094-3.357-.255-.795-.16-1.26-.381-1.538-.608-.512-.417-.543-.97-.543-1.95z"></path></svg>
                        <span className={`${language=='ar'?'me-auto':'mr-auto'} text-base font-medium`}>{t("nav.profileInf.view")}</span>
                      </a>
                      <a className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-100 dark:hover:bg-gray-500 hover:text-black dark:hover:bg-dark-3 dark:text-[rgb(255,255,255)] dark:hover:text-[rgb(255,255,255)]" href="/settings">
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M9 6.188a2.813 2.813 0 100 5.625 2.813 2.813 0 000-5.626zM7.312 9a1.688 1.688 0 113.376 0 1.688 1.688 0 01-3.376 0z"></path><path fillRule="evenodd" clipRule="evenodd" d="M8.981.938c-.333 0-.612 0-.84.015a2.117 2.117 0 00-.68.142c-.506.209-.907.61-1.117 1.116-.108.263-.138.54-.15.841a.65.65 0 01-.311.55.65.65 0 01-.631-.005c-.267-.141-.522-.254-.804-.291a2.063 2.063 0 00-1.525.408c-.187.144-.33.32-.462.519-.128.19-.267.43-.434.72l-.019.032c-.166.289-.306.53-.406.735a2.117 2.117 0 00-.218.66c-.071.543.076 1.091.409 1.525.173.226.398.39.654.55A.65.65 0 012.766 9a.65.65 0 01-.32.544c-.255.16-.48.325-.653.55-.333.435-.48.983-.409 1.526.03.233.113.445.218.66.1.205.24.446.406.735l.02.033c.166.288.305.53.433.72.133.197.275.374.462.518.434.333.983.48 1.525.408.282-.037.537-.15.804-.29a.65.65 0 01.63-.005.65.65 0 01.313.549c.011.3.04.578.15.841.209.506.61.907 1.116 1.117.217.09.442.125.68.14.228.017.507.017.84.017h.038c.333 0 .612 0 .84-.016.238-.016.463-.051.68-.142.506-.209.907-.61 1.117-1.116.108-.263.138-.54.15-.841a.65.65 0 01.311-.55.65.65 0 01.631.005c.267.141.522.254.804.291a2.062 2.062 0 001.525-.408c.187-.144.33-.32.462-.519.128-.19.267.43.434-.72l-.019-.032c.166-.289.305-.53.406-.736.105-.214.187-.426.218-.66a2.062 2.062 0 00-.409-1.524c-.173-.226-.398-.39-.654-.55A.65.65 0 0115.234 9a.65.65 0 01.32-.544c.255-.16.48-.325.653-.55.333-.435.48-.983-.409-1.526a2.117 2.117 0 00-.218-.66c-.1-.205-.24-.446-.406-.735l-.02-.033c-.166-.288-.305-.53-.433-.72a2.117 2.117 0 00-.462-.518 2.062 2.062 0 00-1.525-.408c-.282-.037-.537-.15-.804-.29a.65.65 0 01-.63.005.65.65 0 01-.313-.549c-.011-.3-.04-.578-.15-.841a2.063 2.063 0 00-1.116-1.116 2.118 2.118 0 00-.68-.142c-.228-.016-.507-.016-.84-.015H8.98zm-1.09 1.196c.058-.024.146-.046.327-.059.185-.012.425-.013.782-.013.357 0 .597 0 .782.013.181.013.269.035.327.059.23.095.412.278.507.507.03.073.055.186.065.453.022.595.329 1.167.874 1.481a1.775 1.775 0 001.719.016c.237-.125.347-.16.425-.17a.938.938 0 01.693.186c.05.038.113.103.214.253.103.155.223.362.402.671.179.31.298.517.38.684.08.163.104.25.113.312a.937.937 0 01-.186.693c-.048.062-.133.14-.36.283A1.775 1.775 0 0014.109 9c0 .629.342 1.18.846 1.497.227.143.312.22.36.283a.938.938 0 01.186.693c-.009.062-.033.15-.113.312-.082.167-.201.374-.38.684-.179.309-.299.516-.402.67-.101.151-.165.216-.214.254a.937.937 0 01-.693.186c-.078-.01-.188-.045-.425-.17a1.775 1.775 0 00-1.72.016 1.775 1.775 0 00-.873 1.48c-.01.268-.035.381-.065.454a.937.937 0 01-.507.507 1.034 1.034 0 01-.327.059c-.185.012-.425.012-.782.012-.357 0-.597 0-.782-.012a1.033 1.033 0 01-.327-.059.937.937 0 01-.507-.507c-.03-.073-.055-.186-.065-.454a1.775 1.775 0 00-.874-1.48 1.775 1.775 0 00-1.719-.016c-.237-.125-.347-.16-.425-.17a.937.937 0 01-.693-.186 1.034 1.034 0 01-.214-.253 12.818 12.818 0 01-.402-.671c-.179-.31-.298-.517-.38-.684a1.035 1.035 0 01-.113-.312.937.937 0 01.186-.693c.048-.063.133-.14.36-.283.504-.316.846-.868.846-1.497 0-.629-.342-1.18-.846-1.497-.227-.143-.312-.22-.36-.283a.937.937 0 01-.186-.693c.009-.062.033-.15.113-.312.082-.167.201.375.38-.684.179-.31.299-.517.402-.67.101-.151.165-.216.214-.254a.938.938 0 01.693.186c.078.01.188.045.425.17a1.775 1.775 0 001.72-.016c.544-.314.85-.886.873-1.48.01-.268.035-.381.065-.454a.937.937 0 01.507-.507z"></path></svg>
                        <span  className={`${language=='ar'?'me-auto':'mr-auto'} text-base font-medium`}>{t("nav.profileInf.setting")} </span>
                      </a>
                    </div>
                    <hr className="border-gray-200 dark:border-zinc-700 "></hr>
                    <div className="p-2 text-base text-gray-700 dark:text-dark-6">
                      <button onClick={logout} className="flex w-full items-center gap-2.5  dark:hover:bg-gray-500 rounded-lg px-2.5 py-[9px] hover:bg-gray-100 dark:text-[rgb(255,255,255)] hover:text-black dark:hover:bg-dark-3 dark:hover:text-[rgb(255,255,255)]">
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor"><g clipPath="url(#clip0_7095_11691)"><path d="M11.209.938c-1.026 0-1.852 0-2.503.087-.675.09-1.243.285-1.695.736-.393.394-.592.878-.697 1.446-.101.553-.12 1.229-.125 2.04a.562.562 0 101.125.006c.005-.82.026-1.401.107-1.842.078-.426.203-.672.386-.854.207-.208.499-.343 1.05-.417.566-.076 1.317-.078 2.393-.078H12c1.077 0 1.828.002 2.394.078.55.074.842.21 1.05.417.207.207.342.499.416 1.05.077.566.078 1.316.078 2.393v6c0 1.077-.002 1.827-.078 2.394-.074.55-.209.842-.417 1.05-.207.207-.499.342-1.049.416-.566.076-1.317.078-2.394.078h-.75c-1.076 0-1.827-.002-2.394-.078-.55-.074-.842-.21-1.05-.417-.182-.182-.307-.428-.385-.854-.081-.44-.102-1.022-.107-1.842a.563.563 0 00-1.125.006c.004.811.024 1.487.125 2.04.105.568.304 1.052.697 1.446.452.451 1.02.645 1.695.736.65.087 1.477.087 2.503.087h.832c1.026 0 1.853 0 2.503-.087.675-.09 1.243-.285 1.695-.736.451-.452.645-1.02.736-1.695.088-.65.088-1.477.088-2.503V5.96c0-1.026 0-1.853-.088-2.503-.09-.675-.285-1.243-.736-1.695-.452-.451-1.02-.645-1.695-.736-.65-.088-1.477-.088-2.503-.087h-.832z"></path><path d="M11.25 8.438a.562.562 0 110 1.124H3.02l1.471 1.26a.563.563 0 01-.732.855l-2.625-2.25a.562.562 0 010-.854l2.625-2.25a.562.562 0 11.732.854l-1.47 1.26h8.229z"></path></g><defs><clipPath id="clip0_7095_11691"><rect width="18" height="18" rx="5"></rect></clipPath></defs></svg>
                        <span className="text-base font-medium">{t("nav.profileInf.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;