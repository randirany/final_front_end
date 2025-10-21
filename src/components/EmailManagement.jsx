import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip
} from '@mui/material';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import {
  Inbox,
  Send,
  Users,
  Mail,
  Search,
  Star,
  MoreVertical,
  Trash2,
  Reply,
  Forward,
  Archive,
  RefreshCw,
  Edit3,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { emailApi } from '../services/emailApi';
import Swal from 'sweetalert2';

// Email validation schema
const emailValidationSchema = Yup.object({
  to: Yup.string().email('Invalid email format').required('Recipient email is required'),
  subject: Yup.string().required('Subject is required'),
  message: Yup.string().required('Message content is required'),
});

// Bulk email validation schema
const bulkEmailValidationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  message: Yup.string().required('Message content is required'),
});

export default function EmailManagement() {
  const { t, i18n: { language } } = useTranslation();
  const [currentTab, setCurrentTab] = useState(0);
  const [emails, setEmails] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emailSearchText, setEmailSearchText] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailViewOpen, setEmailViewOpen] = useState(false);

  const isRTL = (language === 'ar' || language === 'he');

  // Initialize data
  useEffect(() => {
    fetchInbox();
    fetchCustomers();
  }, []);

  // Parse email address from "Name <email@domain.com>" format
  const parseEmailFrom = (fromString) => {
    if (!fromString) return { name: 'Unknown', email: '' };

    // Check if format is "Name <email@domain.com>"
    const match = fromString.match(/^"?([^"<]+)"?\s*<([^>]+)>$/);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim()
      };
    }

    // If no angle brackets, assume it's just an email
    return {
      name: fromString.split('@')[0],
      email: fromString
    };
  };

  // Fetch inbox from API
  const fetchInbox = async (page = 1) => {
    setLoading(true);
    try {
      const response = await emailApi.getInbox(page, pagination.limit);

      // Transform API data to match component structure
      const formattedEmails = response.data.map(email => {
        const fromParsed = parseEmailFrom(email.from);

        return {
          id: email.messageId,
          from: email.from,
          fromName: fromParsed.name,
          fromEmail: fromParsed.email,
          subject: email.subject || '(No Subject)',
          preview: email.text ? email.text.substring(0, 100).replace(/\n/g, ' ').trim() : '(No preview)',
          content: email.text || email.html || '',
          html: email.html || '',
          text: email.text || '',
          date: email.date,
          attachments: email.attachments || [],
          read: false,
          starred: false,
          important: false
        };
      });

      setEmails(formattedEmails);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching inbox:', error);
      Swal.fire({
        title: t('email.errors.fetchInbox', 'Failed to load inbox'),
        text: error.response?.data?.message || error.message,
        icon: 'error',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for bulk email
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
        email: item.email,
        mobile: item.phone_number,
      })).filter(customer => customer.email); // Only include customers with emails

      setCustomers(formattedData);
    } catch (err) {
      toast.error(t('email.errors.fetchCustomers', 'Failed to load customers'));
    } finally {
      setLoading(false);
    }
  };

  // Filter customers for bulk email
  const filteredCustomers = useMemo(() => {
    if (!searchText) return customers;
    const lowerSearch = searchText.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerSearch) ||
      customer.email?.toLowerCase().includes(lowerSearch)
    );
  }, [customers, searchText]);

  // Filter emails for inbox
  const filteredEmails = useMemo(() => {
    if (!emailSearchText) return emails;
    const lowerSearch = emailSearchText.toLowerCase();
    return emails.filter(email =>
      email.fromName.toLowerCase().includes(lowerSearch) ||
      email.subject.toLowerCase().includes(lowerSearch) ||
      email.preview.toLowerCase().includes(lowerSearch)
    );
  }, [emails, emailSearchText]);

  // Handle customer selection for bulk email
  const handleCustomerToggle = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle select all customers
  const handleSelectAllCustomers = (checked) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Handle email selection
  const handleEmailToggle = (emailId) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  // Handle select all emails
  const handleSelectAllEmails = (checked) => {
    if (checked) {
      setSelectedEmails(filteredEmails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  // Send single email
  const handleSendEmail = async (values, { setSubmitting, resetForm }) => {
    setSending(true);
    try {
      const emailData = {
        to: values.to,
        subject: values.subject,
        text: values.message,
        html: `<p>${values.message.replace(/\n/g, '<br>')}</p>`
      };

      const response = await emailApi.send(emailData);

      Swal.fire({
        title: t('email.success.sent', 'Email sent successfully!'),
        icon: 'success',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white'
        }
      });
      resetForm();
    } catch (error) {
      Swal.fire({
        title: t('email.errors.sendFailed', 'Failed to send email'),
        text: error.response?.data?.message || error.message,
        icon: 'error',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      });
    } finally {
      setSending(false);
      setSubmitting(false);
    }
  };

  // Send bulk email
  const handleSendBulkEmail = async (values, { setSubmitting, resetForm }) => {
    if (selectedCustomers.length === 0) {
      Swal.fire({
        title: t('email.errors.noRecipients', 'Please select at least one recipient'),
        icon: 'warning',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white'
        }
      });
      return;
    }

    setSending(true);
    try {
      const recipients = customers
        .filter(c => selectedCustomers.includes(c.id))
        .map(c => ({
          email: c.email,
          name: c.name
        }));

      const bulkEmailData = {
        recipients: recipients,
        subject: values.subject,
        text: values.message,
        html: `<p>${values.message.replace(/\n/g, '<br>')}</p>`
      };

      const response = await emailApi.sendBulk(bulkEmailData);

      Swal.fire({
        title: t('email.success.bulkSent', 'Bulk email sent successfully!'),
        html: `
          <div class="text-left">
            <p><strong>Total:</strong> ${response.summary.total}</p>
            <p class="text-green-600"><strong>Successful:</strong> ${response.summary.successful}</p>
            ${response.summary.failed > 0 ? `<p class="text-red-600"><strong>Failed:</strong> ${response.summary.failed}</p>` : ''}
          </div>
        `,
        icon: response.summary.failed === 0 ? 'success' : 'warning',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      });

      resetForm();
      setSelectedCustomers([]);
    } catch (error) {
      Swal.fire({
        title: t('email.errors.bulkSendFailed', 'Failed to send bulk email'),
        text: error.response?.data?.message || error.message,
        icon: 'error',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      });
    } finally {
      setSending(false);
      setSubmitting(false);
    }
  };

  // Toggle email star
  const toggleStar = (emailId) => {
    setEmails(prev => prev.map(email =>
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  // Mark email as read
  const markAsRead = (emailId) => {
    setEmails(prev => prev.map(email =>
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  // Open email view dialog
  const handleViewEmail = (email) => {
    setSelectedEmail(email);
    setEmailViewOpen(true);
    markAsRead(email.id);
  };

  // Close email view dialog
  const handleCloseEmailView = () => {
    setEmailViewOpen(false);
    setSelectedEmail(null);
  };

  // Delete emails
  const deleteSelectedEmails = async () => {
    if (selectedEmails.length === 0) return;

    Swal.fire({
      title: t('email.delete.confirm', 'Are you sure?'),
      text: t('email.delete.confirmText', `You are about to delete ${selectedEmails.length} email(s)`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('email.delete.yes', 'Yes, delete'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      reverseButtons: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete emails one by one
          const deletePromises = selectedEmails.map(emailId => emailApi.delete(emailId));
          await Promise.all(deletePromises);

          // Remove from local state
          setEmails(prev => prev.filter(email => !selectedEmails.includes(email.id)));
          setSelectedEmails([]);

          Swal.fire({
            title: t('email.success.deleted', 'Emails deleted successfully'),
            icon: 'success',
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white'
            }
          });
        } catch (error) {
          Swal.fire({
            title: t('email.errors.deleteFailed', 'Failed to delete emails'),
            text: error.response?.data?.message || error.message,
            icon: 'error',
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white',
              htmlContainer: 'dark:text-gray-300'
            }
          });
        }
      }
    });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && children}
    </div>
  );

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-6 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${isRTL ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">
            {t('email.breadcrumb.dashboard', 'Dashboard')}
          </NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">
            {t('email.breadcrumb.emails', 'Email Management')}
          </span>
        </div>
      </div>

      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-sm">
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'inherit',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6C5FFC',
              },
              '& .Mui-selected': {
                color: '#6C5FFC !important',
              },
            }}
          >
            <Tab
              icon={<Inbox className="w-4 h-4" />}
              label={
                <Box className="flex items-center gap-2">
                  {t('email.tabs.inbox', 'Inbox')}
                  <Badge badgeContent={emails.filter(e => !e.read).length} color="primary" />
                </Box>
              }
              iconPosition="start"
            />
            <Tab
              icon={<Send className="w-4 h-4" />}
              label={t('email.tabs.compose', 'Compose')}
              iconPosition="start"
            />
            <Tab
              icon={<Users className="w-4 h-4" />}
              label={t('email.tabs.bulk', 'Bulk Email')}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Inbox Tab */}
        <TabPanel value={currentTab} index={0}>
          <div className="p-4">
            {/* Email toolbar */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                  indeterminate={selectedEmails.length > 0 && selectedEmails.length < filteredEmails.length}
                  onChange={(e) => handleSelectAllEmails(e.target.checked)}
                  size="small"
                />
                <IconButton onClick={() => fetchInbox(pagination.page)} size="small">
                  <RefreshCw className="w-4 h-4" />
                </IconButton>
                {selectedEmails.length > 0 && (
                  <IconButton onClick={deleteSelectedEmails} size="small" color="error">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className={`absolute top-3 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <TextField
                    size="small"
                    placeholder={t('email.inbox.searchPlaceholder', 'Search emails...')}
                    value={emailSearchText}
                    onChange={(e) => setEmailSearchText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: isRTL ? '12px' : '40px',
                        paddingRight: isRTL ? '40px' : '12px',
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Email list */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">{t('common.loading', 'Loading...')}</p>
                </div>
              ) : filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      email.read
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-600 border-blue-200 dark:border-blue-700'
                    } hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleViewEmail(email)}
                  >
                    <Checkbox
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleEmailToggle(email.id);
                      }}
                      size="small"
                    />

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(email.id);
                      }}
                    >
                      <Star className={`w-4 h-4 ${email.starred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    </IconButton>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-sm truncate ${!email.read ? 'font-semibold' : 'font-normal'}`}>
                            {email.fromName}
                          </span>
                          {email.important && (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {toLocaleDateStringEN(email.date)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`text-sm ${!email.read ? 'font-medium' : 'font-normal'}`}>
                          {email.subject}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          - {email.preview}
                        </span>
                      </div>
                    </div>

                    <IconButton size="small">
                      <MoreVertical className="w-4 h-4" />
                    </IconButton>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('email.inbox.noEmails', 'No emails found')}</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('email.inbox.showing', 'Showing page {{page}} of {{totalPages}}', {
                    page: pagination.page,
                    totalPages: pagination.totalPages
                  })}
                </div>
                <div className="flex gap-2">
                  <IconButton
                    size="small"
                    disabled={pagination.page === 1}
                    onClick={() => fetchInbox(pagination.page - 1)}
                    sx={{
                      border: '1px solid #6C5FFC',
                      borderRadius: '6px',
                      color: '#6C5FFC',
                      '&:hover': {
                        borderColor: '#5a4fd8',
                        backgroundColor: 'rgba(108, 95, 252, 0.04)'
                      },
                      '&:disabled': {
                        borderColor: '#9ca3af',
                        color: '#9ca3af',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchInbox(pagination.page + 1)}
                    sx={{
                      border: '1px solid #6C5FFC',
                      borderRadius: '6px',
                      color: '#6C5FFC',
                      '&:hover': {
                        borderColor: '#5a4fd8',
                        backgroundColor: 'rgba(108, 95, 252, 0.04)'
                      },
                      '&:disabled': {
                        borderColor: '#9ca3af',
                        color: '#9ca3af',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </IconButton>
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Compose Tab */}
        <TabPanel value={currentTab} index={1}>
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <Typography variant="h6" className="dark:text-white">
                  {t('email.compose.title', 'Compose Email')}
                </Typography>
              </div>

              <Formik
                initialValues={{ to: '', subject: '', message: '' }}
                validationSchema={emailValidationSchema}
                onSubmit={handleSendEmail}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-4">
                    <Field name="to">
                      {({ field, meta }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('email.compose.to', 'To')}
                          type="email"
                          placeholder={t('email.compose.toPlaceholder', 'recipient@example.com')}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                              '&:hover fieldset': { borderColor: '#6C5FFC' },
                              '&.Mui-focused fieldset': { borderColor: '#6C5FFC' },
                            }
                          }}
                        />
                      )}
                    </Field>

                    <Field name="subject">
                      {({ field, meta }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('email.compose.subject', 'Subject')}
                          placeholder={t('email.compose.subjectPlaceholder', 'Email subject')}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                              '&:hover fieldset': { borderColor: '#6C5FFC' },
                              '&.Mui-focused fieldset': { borderColor: '#6C5FFC' },
                            }
                          }}
                        />
                      )}
                    </Field>

                    <Field name="message">
                      {({ field, meta }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={8}
                          label={t('email.compose.message', 'Message')}
                          placeholder={t('email.compose.messagePlaceholder', 'Type your message here...')}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                              '&:hover fieldset': { borderColor: '#6C5FFC' },
                              '&.Mui-focused fieldset': { borderColor: '#6C5FFC' },
                            }
                          }}
                        />
                      )}
                    </Field>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || sending}
                        startIcon={sending ? null : <Send className="w-4 h-4" />}
                        sx={{
                          background: '#6C5FFC',
                          color: '#fff',
                          px: 4,
                          py: 1,
                          '&:hover': { background: '#5a4fd8' },
                          '&:disabled': { background: '#9ca3af' }
                        }}
                      >
                        {sending
                          ? t('email.compose.sending', 'Sending...')
                          : t('email.compose.send', 'Send Email')
                        }
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </TabPanel>

        {/* Bulk Email Tab */}
        <TabPanel value={currentTab} index={2}>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Customer Selection - Left */}
              <div className="lg:col-span-4">
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <Typography variant="h6" className="dark:text-white">
                        {t('email.bulk.selectCustomers', 'Select Recipients')}
                      </Typography>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className={`absolute top-3 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                      <TextField
                        size="small"
                        fullWidth
                        placeholder={t('email.bulk.searchPlaceholder', 'Search customers...')}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            paddingLeft: isRTL ? '12px' : '40px',
                            paddingRight: isRTL ? '40px' : '12px',
                          }
                        }}
                      />
                    </div>

                    {/* Select All */}
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                      <Checkbox
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length}
                        onChange={(e) => handleSelectAllCustomers(e.target.checked)}
                        sx={{ color: '#6C5FFC', '&.Mui-checked': { color: '#6C5FFC' } }}
                      />
                      <Typography variant="body2" className="inline ml-2">
                        {t('email.bulk.selectAll', 'Select All')}
                      </Typography>
                    </div>

                    {/* Customer List */}
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                        </div>
                      ) : filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <div key={customer.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleCustomerToggle(customer.id)}
                              sx={{ color: '#6C5FFC', '&.Mui-checked': { color: '#6C5FFC' } }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {customer.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          {t('email.bulk.noCustomers', 'No customers with email addresses found')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email Compose - Right */}
              <div className="lg:col-span-8">
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <Typography variant="h6" className="dark:text-white">
                          {t('email.bulk.compose', 'Compose Bulk Email')}
                        </Typography>
                      </div>
                      <Badge badgeContent={selectedCustomers.length} color="primary" />
                    </div>

                    <Formik
                      initialValues={{ subject: '', message: '' }}
                      validationSchema={bulkEmailValidationSchema}
                      onSubmit={handleSendBulkEmail}
                    >
                      {({ errors, touched, isSubmitting }) => (
                        <Form className="space-y-4">
                          <Field name="subject">
                            {({ field, meta }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label={t('email.bulk.subject', 'Subject')}
                                placeholder={t('email.bulk.subjectPlaceholder', 'Email subject')}
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                                    '&:hover fieldset': { borderColor: '#6C5FFC' },
                                    '&.Mui-focused fieldset': { borderColor: '#6C5FFC' },
                                  }
                                }}
                              />
                            )}
                          </Field>

                          <Field name="message">
                            {({ field, meta }) => (
                              <TextField
                                {...field}
                                fullWidth
                                multiline
                                rows={10}
                                label={t('email.bulk.message', 'Message')}
                                placeholder={t('email.bulk.messagePlaceholder', 'Type your bulk email message here...')}
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                                    '&:hover fieldset': { borderColor: '#6C5FFC' },
                                    '&.Mui-focused fieldset': { borderColor: '#6C5FFC' },
                                  }
                                }}
                              />
                            )}
                          </Field>

                          <Alert severity="info">
                            {t('email.bulk.info', 'This email will be sent to {{count}} recipients', { count: selectedCustomers.length })}
                          </Alert>

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={isSubmitting || sending || selectedCustomers.length === 0}
                              startIcon={sending ? null : <Send className="w-4 h-4" />}
                              sx={{
                                background: '#6C5FFC',
                                color: '#fff',
                                px: 4,
                                py: 1,
                                '&:hover': { background: '#5a4fd8' },
                                '&:disabled': { background: '#9ca3af' }
                              }}
                            >
                              {sending
                                ? t('email.bulk.sending', 'Sending...')
                                : t('email.bulk.send', 'Send Bulk Email')
                              }
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabPanel>
      </div>

      {/* Email View Dialog */}
      <Dialog
        open={emailViewOpen}
        onClose={handleCloseEmailView}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none'
          },
          className: 'dark:bg-navbarBack'
        }}
      >
        {selectedEmail && (
          <>
            <DialogTitle className="dark:text-white border-b dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Typography variant="h6" className="dark:text-white font-semibold mb-2">
                    {selectedEmail.subject}
                  </Typography>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{selectedEmail.fromName}</span>
                    <span>&lt;{selectedEmail.fromEmail}&gt;</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {toLocaleDateStringEN(selectedEmail.date)}
                  </div>
                </div>
                <IconButton onClick={handleCloseEmailView} size="small">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>
            </DialogTitle>

            <DialogContent className="dark:bg-navbarBack" sx={{ mt: 2 }}>
              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mb-4">
                  <Typography variant="subtitle2" className="dark:text-white mb-2 flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    {t('email.attachments', 'Attachments')} ({selectedEmail.attachments.length})
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <Chip
                        key={index}
                        label={attachment.filename || t('email.attachmentFile', 'Attachment {{index}}', { index: index + 1 })}
                        size="small"
                        sx={{ bgcolor: '#6C5FFC', color: '#fff' }}
                      />
                    ))}
                  </div>
                  <Divider sx={{ my: 2 }} className="dark:bg-gray-700" />
                </div>
              )}

              {/* Email Content */}
              <div className="dark:text-gray-300">
                {selectedEmail.html ? (
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {selectedEmail.text || selectedEmail.content}
                  </div>
                )}
              </div>
            </DialogContent>

            <DialogActions className="dark:bg-navbarBack border-t dark:border-gray-700 p-4">
              <Button
                variant="outlined"
                startIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  handleCloseEmailView();
                  deleteSelectedEmails();
                }}
                sx={{
                  borderColor: '#d33',
                  color: '#d33',
                  '&:hover': { borderColor: '#b82828', backgroundColor: 'rgba(211, 51, 51, 0.04)' }
                }}
              >
                {t('email.deleteButton', 'Delete')}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseEmailView}
                sx={{
                  borderColor: '#6C5FFC',
                  color: '#6C5FFC',
                  '&:hover': { borderColor: '#5a4fd8', backgroundColor: 'rgba(108, 95, 252, 0.04)' }
                }}
              >
                {t('common.close', 'Close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}