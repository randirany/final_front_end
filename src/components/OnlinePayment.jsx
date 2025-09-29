import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Typography, Box, Alert } from '@mui/material';
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import logo from '../assets/logo.png';

export default function OnlinePayment() {
  const { t, i18n: { language } } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const isRTL = (language === 'ar' || language === 'he');

  // Validation schema
  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .required(t('payment.validation.cardNumberRequired', 'Card number is required'))
      .matches(/^[0-9]{16}$/, t('payment.validation.cardNumberInvalid', 'Card number must be 16 digits')),
    cardName: Yup.string()
      .required(t('payment.validation.cardNameRequired', 'Cardholder name is required'))
      .min(3, t('payment.validation.cardNameMin', 'Name must be at least 3 characters')),
    expiryMonth: Yup.string()
      .required(t('payment.validation.expiryMonthRequired', 'Expiry month is required')),
    expiryYear: Yup.string()
      .required(t('payment.validation.expiryYearRequired', 'Expiry year is required')),
    cvv: Yup.string()
      .required(t('payment.validation.cvvRequired', 'CVV is required'))
      .matches(/^[0-9]{3,4}$/, t('payment.validation.cvvInvalid', 'CVV must be 3 or 4 digits')),
    amount: Yup.number()
      .required(t('payment.validation.amountRequired', 'Amount is required'))
      .positive(t('payment.validation.amountPositive', 'Amount must be positive'))
      .min(1, t('payment.validation.amountMin', 'Minimum amount is 1')),
  });

  const initialValues = {
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: '',
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

  const handleSubmit = async (values, { setSubmitting }) => {
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate success
      setPaymentSuccess(true);
      toast.success(t('payment.success.message', 'Payment processed successfully!'));

      // Reset form after success
      setTimeout(() => {
        setPaymentSuccess(false);
        setProcessing(false);
      }, 3000);

    } catch (error) {
      toast.error(t('payment.error.processingFailed', 'Payment processing failed. Please try again.'));
      setProcessing(false);
    }
    setSubmitting(false);
  };

  if (paymentSuccess) {
    return (
      <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-md mx-auto">
          <Card className="dark:bg-navbarBack shadow-lg">
            <CardContent className="text-center p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <Typography variant="h5" className="dark:text-white mb-2">
                {t('payment.success.title', 'Payment Successful!')}
              </Typography>
              <Typography variant="body1" className="text-gray-600 dark:text-gray-300 mb-4">
                {t('payment.success.description', 'Your payment has been processed successfully.')}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setPaymentSuccess(false)}
                sx={{ background: '#6C5FFC', color: '#fff' }}
              >
                {t('payment.success.newPayment', 'Make Another Payment')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-6 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${isRTL ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">
            {t('payment.breadcrumb.dashboard', 'Dashboard')}
          </NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">
            {t('payment.breadcrumb.payment', 'Online Payment')}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Payment Form - Left Side */}
          <div className="lg:col-span-8">
            <Card className="dark:bg-navbarBack shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Typography variant="h5" className="dark:text-white font-semibold">
                      {t('payment.form.title', 'Payment Details')}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                      {t('payment.form.subtitle', 'Enter your card information securely')}
                    </Typography>
                  </div>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                    <Form>
                      {/* Amount */}
                      <Box className="mb-4">
                        <Field name="amount">
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('payment.form.amount', 'Payment Amount')}
                              type="number"
                              InputProps={{
                                startAdornment: <span className="text-gray-500 mr-2">$</span>,
                              }}
                              error={meta.touched && !!meta.error}
                              helperText={meta.touched && meta.error}
                              className="dark:text-white"
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
                      </Box>

                      {/* Card Number */}
                      <Box className="mb-4">
                        <Field name="cardNumber">
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('payment.form.cardNumber', 'Card Number')}
                              placeholder="1234 5678 9012 3456"
                              value={formatCardNumber(field.value)}
                              onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                setFieldValue('cardNumber', formatted.replace(/\s/g, ''));
                              }}
                              inputProps={{ maxLength: 19 }}
                              error={meta.touched && !!meta.error}
                              helperText={meta.touched && meta.error}
                              InputProps={{
                                endAdornment: (
                                  <div className="flex items-center">
                                    {getCardType(field.value) === 'visa' && (
                                      <span className="text-blue-600 font-bold text-sm">VISA</span>
                                    )}
                                    {getCardType(field.value) === 'mastercard' && (
                                      <span className="text-red-500 font-bold text-sm">MC</span>
                                    )}
                                    {getCardType(field.value) === 'amex' && (
                                      <span className="text-blue-700 font-bold text-sm">AMEX</span>
                                    )}
                                  </div>
                                ),
                              }}
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
                      </Box>

                      {/* Cardholder Name */}
                      <Box className="mb-4">
                        <Field name="cardName">
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('payment.form.cardName', 'Cardholder Name')}
                              placeholder="John Doe"
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
                      </Box>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Field name="expiryMonth">
                          {({ field, meta }) => (
                            <FormControl fullWidth error={meta.touched && !!meta.error}>
                              <InputLabel>{t('payment.form.expiryMonth', 'Month')}</InputLabel>
                              <Select
                                {...field}
                                label={t('payment.form.expiryMonth', 'Month')}
                                sx={{
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6C5FFC' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C5FFC' },
                                }}
                              >
                                {months.map((month) => (
                                  <MenuItem key={month.value} value={month.value}>
                                    {month.label}
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
                              <InputLabel>{t('payment.form.expiryYear', 'Year')}</InputLabel>
                              <Select
                                {...field}
                                label={t('payment.form.expiryYear', 'Year')}
                                sx={{
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6C5FFC' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C5FFC' },
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
                              label={t('payment.form.cvv', 'CVV')}
                              placeholder="123"
                              type="password"
                              inputProps={{ maxLength: 4 }}
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
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isSubmitting || processing}
                        startIcon={processing ? null : <Lock className="w-4 h-4" />}
                        sx={{
                          background: '#6C5FFC',
                          color: '#fff',
                          py: 1.5,
                          '&:hover': { background: '#5a4fd8' },
                          '&:disabled': { background: '#9ca3af' }
                        }}
                      >
                        {processing
                          ? t('payment.form.processing', 'Processing Payment...')
                          : t('payment.form.submit', 'Pay Securely')
                        }
                      </Button>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary & Security - Right Side */}
          <div className="lg:col-span-4 space-y-6">

            {/* Company Info */}
            <Card className="dark:bg-navbarBack shadow-lg">
              <CardContent className="p-6 text-center">
                <img
                  src={logo}
                  alt="Al-Basheer Insurance"
                  className="w-16 h-16 mx-auto mb-4 object-contain"
                />
                <Typography variant="h6" className="dark:text-white font-semibold mb-2">
                  Al-Basheer Insurance
                </Typography>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  {t('payment.company.description', 'Secure online payment processing')}
                </Typography>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="dark:bg-navbarBack shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-green-500" />
                  <Typography variant="h6" className="dark:text-white font-semibold">
                    {t('payment.security.title', 'Secure Payment')}
                  </Typography>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                      {t('payment.security.ssl', '256-bit SSL encryption')}
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                      {t('payment.security.pci', 'PCI DSS compliant')}
                    </Typography>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                      {t('payment.security.data', 'Your data is never stored')}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accepted Cards */}
            {/* <Card className="dark:bg-navbarBack shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" className="dark:text-white font-semibold mb-4">
                  {t('payment.cards.title', 'Accepted Cards')}
                </Typography>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <span className="text-blue-600 font-bold text-sm">VISA</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <span className="text-red-500 font-bold text-sm">MC</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <span className="text-blue-700 font-bold text-sm">AMEX</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Help */}
            {/* <Alert severity="info" className="dark:bg-blue-900 dark:text-blue-100">
              <Typography variant="body2">
                {t('payment.help.text', 'Need help? Contact our support team for assistance with your payment.')}
              </Typography>
            </Alert> */}
          </div>
        </div>
      </div>
    </div>
  );
}