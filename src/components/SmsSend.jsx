import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { Search, Send, Users, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { NavLink } from 'react-router-dom';

const MAX_SMS_LENGTH = 160;

export default function SmsSend() {
  const { t, i18n: { language } } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isRTL = language === 'ar';

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const res = await axios.get(`http://localhost:3002/api/v1/insured/allInsured`, {
        headers: { token }
      });
      const formattedData = res.data.insuredList.map(item => ({
        id: item._id,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        mobile: item.phone_number,
        email: item.email,
        address: item.city,
        agent: item.agentsName
      }));
      setCustomers(formattedData);
    } catch (err) {
      toast.error(t('sms.errors.fetchCustomers', 'Failed to load customers'));
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search text
  const filteredCustomers = useMemo(() => {
    if (!searchText) return customers;
    const lowerSearch = searchText.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerSearch) ||
      customer.mobile?.toLowerCase().includes(lowerSearch) ||
      customer.email?.toLowerCase().includes(lowerSearch)
    );
  }, [customers, searchText]);

  // Handle individual customer selection
  const handleCustomerToggle = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle select all customers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Remove selected customer
  const removeSelectedCustomer = (customerId) => {
    setSelectedCustomers(prev => prev.filter(id => id !== customerId));
  };

  // Get selected customers data
  const selectedCustomersData = useMemo(() => {
    return customers.filter(customer => selectedCustomers.includes(customer.id));
  }, [customers, selectedCustomers]);

  // Calculate character count and SMS parts
  const characterCount = message.length;
  const smsPartsCount = Math.ceil(characterCount / MAX_SMS_LENGTH) || 1;

  // Handle sending SMS
  const handleSendSMS = async () => {
    if (!message.trim()) {
      toast.error(t('sms.errors.emptyMessage', 'Please enter a message'));
      return;
    }

    if (selectedCustomers.length === 0) {
      toast.error(t('sms.errors.noRecipients', 'Please select at least one recipient'));
      return;
    }

    const result = await Swal.fire({
      title: t('sms.confirmSend.title', 'Send SMS'),
      text: t('sms.confirmSend.text', 'Are you sure you want to send this message to {{count}} recipients?', { count: selectedCustomers.length }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6C5FFC',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('sms.confirmSend.confirm', 'Yes, Send'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      reverseButtons: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    });

    if (result.isConfirmed) {
      setSending(true);
      try {
        const token = `islam__${localStorage.getItem("token")}`;

        // Simulate SMS sending API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // TODO: Replace with actual SMS API endpoint
        // await axios.post('http://localhost:3002/api/v1/sms/send', {
        //   message: message,
        //   recipients: selectedCustomers
        // }, { headers: { token } });

        toast.success(t('sms.success.sent', 'SMS sent successfully to {{count}} recipients', { count: selectedCustomers.length }));
        setMessage('');
        setSelectedCustomers([]);
      } catch (err) {
        toast.error(t('sms.errors.sendFailed', 'Failed to send SMS'));
      } finally {
        setSending(false);
      }
    }
  };

  const isSelectAllChecked = filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length;
  const isSelectAllIndeterminate = selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length;

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${isRTL ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">
            {t('sms.breadcrumb.dashboard', 'Dashboard')}
          </NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">
            {t('sms.breadcrumb.sms', 'Send SMS')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer List - Left Side */}
        <div className="lg:col-span-4">
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold">
                {t('sms.customerList.title', 'Select Recipients')}
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className={`absolute top-3 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('sms.customerList.searchPlaceholder', 'Search customers...')}
                className={`w-full p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isRTL ? 'pr-10' : 'pl-10'}`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Select All Checkbox */}
            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelectAllChecked}
                    indeterminate={isSelectAllIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    sx={{ color: '#6C5FFC', '&.Mui-checked': { color: '#6C5FFC' } }}
                  />
                }
                label={t('sms.customerList.selectAll', 'Select All')}
                className="text-sm font-medium"
              />
            </div>

            {/* Customer List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">{t('common.loading', 'Loading...')}</p>
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Checkbox
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleCustomerToggle(customer.id)}
                      sx={{ color: '#6C5FFC', '&.Mui-checked': { color: '#6C5FFC' }, mt: 0 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {customer.mobile}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t('sms.customerList.noResults', 'No customers found')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message Compose - Middle */}
        <div className="lg:col-span-4">
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold">
                {t('sms.compose.title', 'Compose Message')}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Message Textarea */}
              <div>
                <textarea
                  placeholder={t('sms.compose.placeholder', 'Type your message here...')}
                  className="w-full h-64 p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Character Counter */}
              <div className="flex justify-between items-center text-sm">
                <span className={`${characterCount > MAX_SMS_LENGTH ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {characterCount} / {MAX_SMS_LENGTH} {t('sms.compose.characters', 'characters')}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {smsPartsCount} {t('sms.compose.parts', 'part(s)')}
                </span>
              </div>

              {/* Send Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendSMS}
                disabled={!message.trim() || selectedCustomers.length === 0 || sending}
                startIcon={sending ? null : <Send className="w-4 h-4" />}
                sx={{
                  background: '#6C5FFC',
                  color: '#fff',
                  py: 1.5,
                  '&:hover': { background: '#5a4fd8' },
                  '&:disabled': { background: '#9ca3af' }
                }}
              >
                {sending
                  ? t('sms.compose.sending', 'Sending...')
                  : t('sms.compose.send', 'Send SMS')
                }
              </Button>

              {/* Message Stats */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{t('sms.compose.recipients', 'Recipients')}: {selectedCustomers.length}</p>
                {characterCount > MAX_SMS_LENGTH && (
                  <p className="text-orange-500">
                    {t('sms.compose.longMessage', 'Message will be sent as multiple parts')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Recipients - Right Side */}
        <div className="lg:col-span-4">
          <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold">
                  {t('sms.recipients.title', 'Selected Recipients')}
                </h2>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {selectedCustomers.length}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {selectedCustomersData.length > 0 ? (
                selectedCustomersData.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {customer.mobile}
                      </p>
                    </div>
                    <IconButton
                      size="small"
                      onClick={() => removeSelectedCustomer(customer.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </IconButton>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t('sms.recipients.empty', 'No recipients selected')}
                </p>
              )}
            </div>

            {/* Clear All Button */}
            {selectedCustomers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedCustomers([])}
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(239, 68, 68, 0.04)'
                    }
                  }}
                >
                  {t('sms.recipients.clearAll', 'Clear All')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}