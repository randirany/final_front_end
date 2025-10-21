import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import avater from '../assets/Avatar.png';
import PropTypes from 'prop-types';

const API_BASE_URL = 'http://localhost:3002/api/v1';

// Filter buttons component
const FilterButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
    }`}
  >
    {children}
  </button>
);

FilterButton.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const { language } = i18n;

  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (page = 1, isReadFilter = null) => {
    setLoading(true);
    setError(null);

    try {
      const rawToken = localStorage.getItem("token");
      if (!rawToken || rawToken === "null" || rawToken === "undefined") {
        setError(t('notifications.noToken', 'Authentication required'));
        return;
      }

      const token = `islam__${rawToken}`;
      const params = {
        page,
        limit: pagination.limit
      };

      // Add isRead filter if specified
      if (isReadFilter !== null) {
        params.isRead = isReadFilter;
      }

      const response = await axios.get(`${API_BASE_URL}/notification/all`, {
        headers: { token },
        params
      });

      const fetchedNotifications = response.data.data || [];
      setNotifications(fetchedNotifications);
      setFilteredNotifications(fetchedNotifications);
      setUnreadCount(response.data.unreadCount || 0);
      setPagination(response.data.pagination || pagination);
    } catch {
      setError(t('notifications.fetchError', 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [t, pagination.limit]);

  // Apply search filter locally (client-side)
  useEffect(() => {
    let filtered = [...notifications];

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(n =>
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery]);

  // Handle filter changes - fetch from backend
  useEffect(() => {
    let isReadFilter = null;
    if (filter === 'unread') {
      isReadFilter = false;
    } else if (filter === 'read') {
      isReadFilter = true;
    }
    fetchNotifications(1, isReadFilter);
  }, [filter]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return;

    const token = `islam__${rawToken}`;
    const notificationToUpdate = notifications.find(n => n._id === notificationId);

    if (notificationToUpdate && !notificationToUpdate.isRead) {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );

      try {
        await axios.patch(`${API_BASE_URL}/notification/markAsRead/${notificationId}`, {}, {
          headers: { token },
        });
      } catch {
        // Revert on error
        setNotifications(prev =>
          prev.map(n => (n._id === notificationId ? { ...n, isRead: false } : n))
        );
      }
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return;

    const token = `islam__${rawToken}`;
    const unreadNotifications = notifications.filter(n => !n.isRead);

    if (unreadNotifications.length === 0) return;

    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      await axios.put(`${API_BASE_URL}/notification/markAllAsRead`, {}, {
        headers: { token },
      });
    } catch {
      // Revert on error
      fetchNotifications();
    }
  };

  // Format time ago
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
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications(1);
  }, []);

  return (
    <div className="py-4 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-[20px] rounded-md justify-between items-center mb-6">
        <div className="flex gap-[14px] items-center">
          <NavLink to="/home" className="text-gray-600 hover:text-primary">
            {t('nav.home', 'Home')}
          </NavLink>
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
              fill="#6B7280"
            />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium">
            {t('notifications.title', 'Notifications')}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('notifications.title', 'Notifications')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('notifications.subtitle', 'Stay updated with your latest notifications')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                {t('notifications.markAllRead', 'Mark All Read')} ({unreadCount})
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              title={t('notifications.refresh', 'Refresh')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filter buttons */}
          <div className="flex gap-2">
            <FilterButton
              isActive={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              {t('notifications.filter.all', 'All')} ({pagination.total})
            </FilterButton>
            <FilterButton
              isActive={filter === 'unread'}
              onClick={() => setFilter('unread')}
            >
              {t('notifications.filter.unread', 'Unread')} ({unreadCount})
            </FilterButton>
            <FilterButton
              isActive={filter === 'read'}
              onClick={() => setFilter('read')}
            >
              {t('notifications.filter.read', 'Read')} ({pagination.total - unreadCount})
            </FilterButton>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className={`absolute top-3 w-4 h-4 text-gray-400 ${(language === 'ar' || language === 'he') ? 'right-3' : 'left-3'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('notifications.search.placeholder', 'Search notifications...')}
                className={`w-full py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent ${(language === 'ar' || language === 'he') ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loading', 'Loading...')}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('notifications.retry', 'Try Again')}
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5C2.5 6.5 5 4 8 4s5.5 2.5 5.5 5.5c0 1.5-.5 3-1.5 4" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? t('notifications.noResults', 'No notifications match your search')
                : filter === 'unread'
                ? t('notifications.noUnread', 'No unread notifications')
                : filter === 'read'
                ? t('notifications.noRead', 'No read notifications')
                : t('notifications.empty', 'No notifications yet')
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={notification.sender?.avatar || avater}
                    alt={notification.sender?.name || 'Sender'}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.message}
                        </p>
                        {notification.sender?.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('notifications.from', 'From')}: {notification.sender.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <>
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              {t('notifications.markRead', 'Mark Read')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page info */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.showing', 'Showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('notifications.of', 'of')} {pagination.total} {t('notifications.notifications', 'notifications')}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const isReadFilter = filter === 'unread' ? false : filter === 'read' ? true : null;
                    fetchNotifications(pagination.page - 1, isReadFilter);
                  }}
                  disabled={!pagination.hasPrevPage}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pagination.hasPrevPage
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {t('notifications.previous', 'Previous')}
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const isReadFilter = filter === 'unread' ? false : filter === 'read' ? true : null;
                          fetchNotifications(pageNum, isReadFilter);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const isReadFilter = filter === 'unread' ? false : filter === 'read' ? true : null;
                    fetchNotifications(pagination.page + 1, isReadFilter);
                  }}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pagination.hasNextPage
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {t('notifications.next', 'Next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;