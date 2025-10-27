import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import logo from '../assets/logo.png';
import { paymentApi } from '../services/paymentApi';

export default function OnlinePayment() {
  const { t, i18n: { language } } = useTranslation();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const isRTL = (language === 'ar' || language === 'he');

  // Check for 3D Secure callback
  useEffect(() => {
    const txnId = searchParams.get('transaction_id');
    if (txnId) {
      verifyTransactionAfter3DS(txnId);
    }
  }, [searchParams]);

  // Verify transaction after 3D Secure authentication
  const verifyTransactionAfter3DS = async (txnId) => {
    setVerifying(true);
    try {
      const result = await paymentApi.verifyTransaction(txnId);

      if (result.success && result.data.status === 'approved') {
        setTransactionId(txnId);
        setPaymentSuccess(true);
        toast.success(t('payment.success.message', 'Payment processed successfully!'));
      } else {
        toast.error(t('payment.error.verificationFailed', 'Payment verification failed. Please contact support.'));
      }
    } catch (error) {
      console.error('3DS verification error:', error);
      toast.error(error.message || t('payment.error.verificationFailed', 'Payment verification failed.'));
    } finally {
      setVerifying(false);
    }
  };

  // Validation schema - updated to match Tranzila API requirements
  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .required(t('payment.validation.cardNumberRequired', 'Card number is required'))
      .matches(/^[0-9]{13,19}$/, t('payment.validation.cardNumberInvalid', 'Card number must be 13-19 digits')),
    cardName: Yup.string()
      .required(t('payment.validation.cardNameRequired', 'Cardholder name is required'))
      .min(3, t('payment.validation.cardNameMin', 'Name must be at least 3 characters')),
    expiryMonth: Yup.number()
      .required(t('payment.validation.expiryMonthRequired', 'Expiry month is required'))
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12'),
    expiryYear: Yup.number()
      .required(t('payment.validation.expiryYearRequired', 'Expiry year is required'))
      .min(new Date().getFullYear(), 'Card has expired'),
    cvv: Yup.string()
      .required(t('payment.validation.cvvRequired', 'CVV is required'))
      .matches(/^[0-9]{3,4}$/, t('payment.validation.cvvInvalid', 'CVV must be 3 or 4 digits')),
    amount: Yup.number()
      .required(t('payment.validation.amountRequired', 'Amount is required'))
      .positive(t('payment.validation.amountPositive', 'Amount must be positive'))
      .min(1, t('payment.validation.amountMin', 'Minimum amount is 1')),
    currency: Yup.string()
      .required('Currency is required')
      .oneOf(['ILS', 'USD', 'EUR'], 'Invalid currency'),
  });

  const initialValues = {
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: '',
    currency: 'ILS', // Default currency
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Get card type from number
  const getCardType = (number) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    return 'generic';
  };

  // Generate years for select options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' },
  ];

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setProcessing(true);

    try {
      // Step 1: Prepare payment data according to Tranzila API
      const paymentData = {
        amount: parseFloat(values.amount),
        currency: values.currency,
        card: {
          number: values.cardNumber,
          expiryMonth: parseInt(values.expiryMonth),
          expiryYear: parseInt(values.expiryYear),
          cvv: values.cvv
        },
        orderId: `ORD-${Date.now()}`, // Generate unique order ID
        description: t('payment.form.description', 'Insurance payment'),
        customer: {
          name: values.cardName,
          // Add more customer details if available from user profile
        },
        threeDSecure: true, // Enable 3D Secure by default
        metadata: {
          source: 'online_payment_portal',
          timestamp: new Date().toISOString()
        }
      };

      // Step 2: Create payment through Tranzila API
      const result = await paymentApi.createPayment(paymentData);

      if (result.success) {
        // Check if 3D Secure authentication is required
        if (result.data.requiresThreeDS && result.data.redirectUrl) {
          toast.info(t('payment.info.redirecting3DS', 'Redirecting to secure authentication...'));
          // Redirect to 3D Secure authentication page
          window.location.href = result.data.redirectUrl;
        } else if (result.data.status === 'approved') {
          // Payment approved without 3DS
          setTransactionId(result.data.transactionId);
          setPaymentSuccess(true);
          toast.success(t('payment.success.message', 'Payment processed successfully!'));
          resetForm();
        } else {
          // Payment not approved
          toast.error(t('payment.error.notApproved', 'Payment was not approved. Please try again.'));
          setProcessing(false);
        }
      } else {
        throw new Error(result.message || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);

      // Handle specific error types
      if (error.details?.code) {
        switch (error.details.code) {
          case 'INVALID_CARD_NUMBER':
            toast.error(t('payment.error.invalidCard', 'Invalid card number. Please check and try again.'));
            break;
          case 'CARD_DECLINED':
            toast.error(t('payment.error.cardDeclined', 'Card declined. Please use a different card.'));
            break;
          case 'INSUFFICIENT_FUNDS':
            toast.error(t('payment.error.insufficientFunds', 'Insufficient funds. Please use a different card.'));
            break;
          case 'EXPIRED_CARD':
            toast.error(t('payment.error.expiredCard', 'Card has expired. Please use a different card.'));
            break;
          case 'INVALID_CVV':
            toast.error(t('payment.error.invalidCVV', 'Invalid CVV. Please check and try again.'));
            break;
          default:
            toast.error(error.message || t('payment.error.processingFailed', 'Payment processing failed. Please try again.'));
        }
      } else {
        toast.error(error.message || t('payment.error.processingFailed', 'Payment processing failed. Please try again.'));
      }

      setProcessing(false);
    }

    setSubmitting(false);
  };

  // Show verifying screen during 3DS callback verification
  if (verifying) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="dark:bg-navbarBack shadow-lg max-w-md w-full">
          <CardContent className="text-center p-8">
            <CircularProgress size={60} sx={{ color: '#6C5FFC', mb: 3 }} />
            <Typography variant="h5" className="dark:text-white mb-2">
              {t('payment.verifying.title', 'Verifying Payment...')}
            </Typography>
            <Typography variant="body1" className="text-gray-600 dark:text-gray-300">
              {t('payment.verifying.description', 'Please wait while we verify your payment.')}
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 min-h-screen flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-2xl w-full">
          <Card className="dark:bg-navbarBack shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg animate-bounce">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
              <Typography variant="h4" className="text-white font-bold mb-2">
                {t('payment.success.title', 'Payment Successful!')}
              </Typography>
              <Typography variant="body1" className="text-green-50">
                {t('payment.success.description', 'Your payment has been processed successfully.')}
              </Typography>
            </div>

            <CardContent className="p-8">
              {transactionId && (
                <Box className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-2xl mb-6 border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">
                      {t('payment.success.transactionId', 'Transaction ID')}
                    </Typography>
                    <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Typography variant="h6" className="dark:text-white font-mono font-bold text-purple-900 dark:text-purple-200 break-all">
                    {transactionId}
                  </Typography>
                </Box>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Typography variant="body2" className="font-semibold dark:text-white">
                      {t('payment.success.confirmation', 'Payment Confirmed')}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      {t('payment.success.receiptSent', 'Receipt will be sent to your email')}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Typography variant="body2" className="font-semibold dark:text-white">
                      {t('payment.success.secure', 'Secure Transaction')}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      {t('payment.success.encrypted', 'Your data is protected')}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setPaymentSuccess(false);
                    setTransactionId(null);
                  }}
                  sx={{
                    borderColor: '#6C5FFC',
                    color: '#6C5FFC',
                    borderRadius: '12px',
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#5a4fd8',
                      backgroundColor: 'rgba(108, 95, 252, 0.05)'
                    }
                  }}
                >
                  {t('payment.success.newPayment', 'Make Another Payment')}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  component={NavLink}
                  to="/home"
                  sx={{
                    background: 'linear-gradient(135deg, #6C5FFC 0%, #5a4fd8 100%)',
                    color: '#fff',
                    borderRadius: '12px',
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(108, 95, 252, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a4fd8 0%, #4a3fc8 100%)',
                    }
                  }}
                >
                  {t('payment.success.returnHome', 'Return to Dashboard')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 dark:bg-dark2 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-navbarBack rounded-xl shadow-sm p-4 mb-6">
          <div className={`flex gap-2 items-center text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <NavLink className="hover:underline text-[#6C5FFC] font-medium transition-colors" to="/home">
              {t('payment.breadcrumb.dashboard', 'Dashboard')}
            </NavLink>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {t('payment.breadcrumb.payment', 'Online Payment')}
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6C5FFC] to-[#5a4fd8] rounded-2xl mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('payment.form.title', 'Secure Payment')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('payment.form.subtitle', 'Complete your payment safely and securely')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar - 1/4 */}
          <div className="lg:col-span-3 space-y-6">

            {/* Tranzila Payment Provider Card */}
            <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Typography variant="caption" className="text-white font-semibold">
                      {t('payment.provider.poweredBy', 'Powered by')}
                    </Typography>
                  </div>
                  <Shield className="w-6 h-6 text-white/80" />
                </div>

                <div className="bg-white rounded-xl p-4 mb-4">
                  <Typography variant="h4" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 text-center">
                    Tranzila
                  </Typography>
                  <Typography variant="caption" className="text-gray-600 text-center block mt-1">
                    {t('payment.provider.subtitle', 'Secure Payment Gateway')}
                  </Typography>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('payment.provider.feature1', 'Real-time processing')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('payment.provider.feature2', '3D Secure authentication')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('payment.provider.feature3', 'Trusted by thousands')}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Company Info */}
            <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#6C5FFC] to-[#5a4fd8] p-6 text-center">
                <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <img
                    src={logo}
                    alt="Al-Basheer Insurance"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <Typography variant="h6" className="text-white font-bold mb-1">
                  Al-Basheer Insurance
                </Typography>
                <Typography variant="body2" className="text-blue-100">
                  {t('payment.company.description', 'Secure online payment processing')}
                </Typography>
              </div>
            </Card>

          </div>

          {/* Payment Form - Center (2/4) */}
          <div className="lg:col-span-6">
            <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-8">

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-6">
                      {/* Section 1: Payment Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {t('payment.form.amount', 'Payment Amount')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Box className="md:col-span-2">
                            <Field name="amount">
                              {({ field, meta }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="0.00"
                                  type="number"
                                  error={meta.touched && !!meta.error}
                                  helperText={meta.touched && meta.error}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '12px',
                                      backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                      '& fieldset': { borderColor: 'rgba(108, 95, 252, 0.2)', borderWidth: '2px' },
                                      '&:hover fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                      '&.Mui-focused fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                      '& input': {
                                        fontSize: '1.125rem',
                                        fontWeight: 600,
                                        padding: '16px 14px'
                                      }
                                    }
                                  }}
                                />
                              )}
                            </Field>
                          </Box>

                          <Field name="currency">
                            {({ field, meta }) => (
                              <FormControl fullWidth error={meta.touched && !!meta.error}>
                                <Select
                                  {...field}
                                  displayEmpty
                                  sx={{
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(108, 95, 252, 0.2)',
                                      borderWidth: '2px'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6C5FFC',
                                      borderWidth: '2px'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6C5FFC',
                                      borderWidth: '2px'
                                    },
                                    '& .MuiSelect-select': {
                                      padding: '16px 14px',
                                      fontWeight: 600
                                    }
                                  }}
                                >
                                  <MenuItem value="ILS">ILS (₪)</MenuItem>
                                  <MenuItem value="USD">USD ($)</MenuItem>
                                  <MenuItem value="EUR">EUR (€)</MenuItem>
                                </Select>
                                {meta.touched && meta.error && (
                                  <Typography variant="caption" color="error" className="mt-1 mx-3">
                                    {meta.error}
                                  </Typography>
                                )}
                              </FormControl>
                            )}
                          </Field>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

                      {/* Section 2: Card Information */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {t('payment.form.cardDetails', 'Card Information')}
                        </label>

                        {/* Card Number */}
                        <Field name="cardNumber">
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              fullWidth
                              placeholder="1234 5678 9012 3456"
                              value={formatCardNumber(field.value)}
                              onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                setFieldValue('cardNumber', formatted.replace(/\s/g, ''));
                              }}
                              inputProps={{ maxLength: 23 }}
                              error={meta.touched && !!meta.error}
                              helperText={meta.touched && meta.error}
                              InputProps={{
                                startAdornment: (
                                  <div className="mr-2">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                  </div>
                                ),
                                endAdornment: (
                                  <div className="flex items-center">
                                    {getCardType(field.value) === 'visa' && (
                                      <span className="text-blue-600 font-bold text-sm px-2 py-1 bg-blue-50 rounded">VISA</span>
                                    )}
                                    {getCardType(field.value) === 'mastercard' && (
                                      <span className="text-red-500 font-bold text-sm px-2 py-1 bg-red-50 rounded">MC</span>
                                    )}
                                    {getCardType(field.value) === 'amex' && (
                                      <span className="text-blue-700 font-bold text-sm px-2 py-1 bg-blue-50 rounded">AMEX</span>
                                    )}
                                  </div>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                  '& fieldset': { borderColor: 'rgba(108, 95, 252, 0.2)', borderWidth: '2px' },
                                  '&:hover fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                  '&.Mui-focused fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                  '& input': {
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    padding: '16px 14px',
                                    letterSpacing: '0.05em'
                                  }
                                }
                              }}
                            />
                          )}
                        </Field>

                        {/* Cardholder Name */}
                        <Field name="cardName">
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              fullWidth
                              placeholder={t('payment.form.cardNamePlaceholder', 'Name as shown on card')}
                              error={meta.touched && !!meta.error}
                              helperText={meta.touched && meta.error}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                  '& fieldset': { borderColor: 'rgba(108, 95, 252, 0.2)', borderWidth: '2px' },
                                  '&:hover fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                  '&.Mui-focused fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                  '& input': {
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    padding: '16px 14px'
                                  }
                                }
                              }}
                            />
                          )}
                        </Field>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-3 gap-4">
                          <Field name="expiryMonth">
                            {({ field, meta }) => (
                              <FormControl fullWidth error={meta.touched && !!meta.error}>
                                <Select
                                  {...field}
                                  displayEmpty
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return <span className="text-gray-400">MM</span>;
                                    }
                                    return selected;
                                  }}
                                  sx={{
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(108, 95, 252, 0.2)',
                                      borderWidth: '2px'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6C5FFC',
                                      borderWidth: '2px'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6C5FFC',
                                      borderWidth: '2px'
                                    },
                                    '& .MuiSelect-select': {
                                      padding: '16px 14px',
                                      fontWeight: 500
                                    }
                                  }}
                                >
                                  {months.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                      {month.value}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {meta.touched && meta.error && (
                                  <Typography variant="caption" color="error" className="mt-1 mx-3">
                                    {meta.error}
                                  </Typography>
                                )}
                              </FormControl>
                            )}
                          </Field>

                          <Field name="expiryYear">
                            {({ field, meta }) => (
                              <FormControl fullWidth error={meta.touched && !!meta.error}>
                                <Select
                                  {...field}
                                  displayEmpty
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return <span className="text-gray-400">YYYY</span>;
                                    }
                                    return selected;
                                  }}
                                  sx={{
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(108, 95, 252, 0.2)',
                                      borderWidth: '2px'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6C5FFC',
                                      borderWidth: '2px'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6C5FFC',
                                      borderWidth: '2px'
                                    },
                                    '& .MuiSelect-select': {
                                      padding: '16px 14px',
                                      fontWeight: 500
                                    }
                                  }}
                                >
                                  {years.map((year) => (
                                    <MenuItem key={year} value={year.toString()}>
                                      {year}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {meta.touched && meta.error && (
                                  <Typography variant="caption" color="error" className="mt-1 mx-3">
                                    {meta.error}
                                  </Typography>
                                )}
                              </FormControl>
                            )}
                          </Field>

                          <Field name="cvv">
                            {({ field, meta }) => (
                              <TextField
                                {...field}
                                fullWidth
                                placeholder="CVV"
                                type="password"
                                inputProps={{ maxLength: 4 }}
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(108, 95, 252, 0.03)',
                                    '& fieldset': { borderColor: 'rgba(108, 95, 252, 0.2)', borderWidth: '2px' },
                                    '&:hover fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                    '&.Mui-focused fieldset': { borderColor: '#6C5FFC', borderWidth: '2px' },
                                    '& input': {
                                      fontSize: '1rem',
                                      fontWeight: 500,
                                      padding: '16px 14px'
                                    }
                                  }
                                }}
                              />
                            )}
                          </Field>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isSubmitting || processing}
                        startIcon={processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Lock className="w-5 h-5" />}
                        sx={{
                          background: 'linear-gradient(135deg, #6C5FFC 0%, #5a4fd8 100%)',
                          color: '#fff',
                          py: 2,
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 4px 20px rgba(108, 95, 252, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a4fd8 0%, #4a3fc8 100%)',
                            boxShadow: '0 6px 25px rgba(108, 95, 252, 0.4)',
                          },
                          '&:disabled': {
                            background: '#9ca3af',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        {processing
                          ? t('payment.form.processing', 'Processing Payment...')
                          : t('payment.form.submit', 'Complete Payment')
                        }
                      </Button>

                      {/* Security Notice */}
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span>{t('payment.security.encrypted', 'Secured with 256-bit SSL encryption')}</span>
                      </div>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - 1/4 */}
          <div className="lg:col-span-3 space-y-6">

            {/* Accepted Cards */}
            <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <Typography variant="h6" className="dark:text-white font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('payment.cards.title', 'Accepted Cards')}
                </Typography>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-white font-bold text-sm">VISA</span>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-white font-bold text-sm">MC</span>
                  </div>
                  <div className="bg-gradient-to-br from-blue-700 to-blue-800 p-4 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-white font-bold text-sm">AMEX</span>
                  </div>
                </div>

                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 text-center block">
                  {t('payment.cards.support', 'All major credit cards supported')}
                </Typography>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Typography variant="h6" className="dark:text-white font-bold">
                    {t('payment.security.title', 'Security Features')}
                  </Typography>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <Typography variant="body2" className="font-semibold text-gray-800 dark:text-gray-200">
                        {t('payment.security.ssl', '256-bit SSL encryption')}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                        {t('payment.security.sslDesc', 'Bank-level security')}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <Typography variant="body2" className="font-semibold text-gray-800 dark:text-gray-200">
                        {t('payment.security.pci', 'PCI DSS compliant')}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                        {t('payment.security.pciDesc', 'Industry standard')}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <Typography variant="body2" className="font-semibold text-gray-800 dark:text-gray-200">
                        {t('payment.security.data', 'Data protection')}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                        {t('payment.security.dataDesc', 'Never stored')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}