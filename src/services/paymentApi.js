import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/payment/tranzila`;

/**
 * Payment API Service for Tranzila integration
 */
export const paymentApi = {
  /**
   * Create a one-time payment using Tranzila
   *
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Payment amount (required)
   * @param {string} paymentData.currency - Currency code (e.g., "ILS", "USD") (required)
   * @param {Object} paymentData.card - Card information (required)
   * @param {string} paymentData.card.number - Card number (required)
   * @param {number} paymentData.card.expiryMonth - Expiry month 1-12 (required)
   * @param {number} paymentData.card.expiryYear - Expiry year YYYY (required)
   * @param {string} paymentData.card.cvv - Card CVV (required)
   * @param {string} [paymentData.orderId] - Your internal order ID
   * @param {string} [paymentData.description] - Payment description
   * @param {Object} [paymentData.customer] - Customer details
   * @param {string} [paymentData.customer.name] - Customer name
   * @param {string} [paymentData.customer.email] - Customer email
   * @param {string} [paymentData.customer.phone] - Customer phone
   * @param {string} [paymentData.customer.address] - Customer address
   * @param {Object} [paymentData.installments] - Installment settings
   * @param {number} [paymentData.installments.numberOfPayments] - Number of payments
   * @param {boolean} [paymentData.threeDSecure=true] - Enable 3D Secure
   * @param {Object} [paymentData.metadata] - Custom metadata
   *
   * @returns {Promise<Object>} Payment response
   * @example
   * const payment = await paymentApi.createPayment({
   *   amount: 100.50,
   *   currency: "ILS",
   *   card: {
   *     number: "4580458045804580",
   *     expiryMonth: 12,
   *     expiryYear: 2025,
   *     cvv: "123"
   *   },
   *   orderId: "ORD-12345",
   *   description: "Insurance payment",
   *   customer: {
   *     name: "John Doe",
   *     email: "john@example.com",
   *     phone: "+972501234567",
   *     address: "123 Main St, Tel Aviv"
   *   },
   *   installments: {
   *     numberOfPayments: 3
   *   },
   *   threeDSecure: true,
   *   metadata: {
   *     policyNumber: "POL-123",
   *     agentId: "AG-456"
   *   }
   * });
   *
   * // Success response:
   * // {
   * //   "success": true,
   * //   "message": "Payment processed successfully",
   * //   "data": {
   * //     "transaction_id": "TRZ-789456123",
   * //     "status": "approved",
   * //     "amount": 100.50,
   * //     "currency": "ILS",
   * //     "authorization_code": "123456",
   * //     "maskedCardNumber": "4580********4580",
   * //     "requiresThreeDS": false,
   * //     "redirectUrl": null,
   * //     "transactionId": "TRZ-789456123"
   * //   }
   * // }
   */
  createPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      // Re-throw with enhanced error information
      if (error.response) {
        throw {
          success: false,
          message: error.response.data?.message || 'Payment creation failed',
          details: error.response.data?.details || error.response.data,
          status: error.response.status
        };
      }
      throw {
        success: false,
        message: 'Network error. Please check your connection.',
        details: error.message
      };
    }
  },

  /**
   * Verify transaction status
   *
   * @param {string} transactionId - The transaction ID to verify (e.g., "TRZ-789456123") (required)
   *
   * @returns {Promise<Object>} Transaction verification response
   * @example
   * const verification = await paymentApi.verifyTransaction("TRZ-789456123");
   *
   * // Success response:
   * // {
   * //   "success": true,
   * //   "message": "Transaction verified successfully",
   * //   "data": {
   * //     "transaction_id": "TRZ-789456123",
   * //     "status": "approved",
   * //     "amount": 100.50,
   * //     "currency": "ILS",
   * //     "card": {
   * //       "last_four": "4580",
   * //       "brand": "Visa",
   * //       "expiry_month": 12,
   * //       "expiry_year": 2025
   * //     },
   * //     "customer": {
   * //       "name": "John Doe",
   * //       "email": "john@example.com"
   * //     },
   * //     "order_id": "ORD-12345",
   * //     "description": "Insurance payment",
   * //     "authorization_code": "123456",
   * //     "created_at": "2025-10-07T10:30:00Z",
   * //     "updated_at": "2025-10-07T10:30:05Z",
   * //     "three_ds_verified": true,
   * //     "metadata": {
   * //       "policyNumber": "POL-123",
   * //       "agentId": "AG-456"
   * //     }
   * //   }
   * // }
   *
   * // Transaction Statuses:
   * // - approved: Payment successful
   * // - pending: Payment in progress (e.g., waiting for 3D Secure)
   * // - declined: Payment declined
   * // - failed: Payment failed
   * // - voided: Payment cancelled/voided
   * // - refunded: Payment refunded
   */
  verifyTransaction: async (transactionId) => {
    try {
      if (!transactionId) {
        throw {
          success: false,
          message: 'Transaction ID is required'
        };
      }

      const response = await axios.get(`${BASE_URL}/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      // Re-throw with enhanced error information
      if (error.response) {
        throw {
          success: false,
          message: error.response.data?.message || 'Transaction verification failed',
          details: error.response.data?.details || error.response.data,
          status: error.response.status
        };
      }
      // Handle pre-validation errors
      if (error.success === false) {
        throw error;
      }
      throw {
        success: false,
        message: 'Network error. Please check your connection.',
        details: error.message
      };
    }
  },

  /**
   * Validate payment data before submitting
   *
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result { isValid: boolean, errors: string[] }
   */
  validatePaymentData: (paymentData) => {
    const errors = [];

    // Required fields validation
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Amount is required and must be greater than 0');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    // Card validation
    if (!paymentData.card) {
      errors.push('Card information is required');
    } else {
      if (!paymentData.card.number || paymentData.card.number.length < 13) {
        errors.push('Valid card number is required');
      }

      if (!paymentData.card.expiryMonth ||
          paymentData.card.expiryMonth < 1 ||
          paymentData.card.expiryMonth > 12) {
        errors.push('Valid expiry month (1-12) is required');
      }

      const currentYear = new Date().getFullYear();
      if (!paymentData.card.expiryYear || paymentData.card.expiryYear < currentYear) {
        errors.push('Valid expiry year is required');
      }

      if (!paymentData.card.cvv || paymentData.card.cvv.length < 3) {
        errors.push('Valid CVV is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format card number for display (mask sensitive digits)
   *
   * @param {string} cardNumber - Full card number
   * @returns {string} Masked card number (e.g., "4580********4580")
   */
  maskCardNumber: (cardNumber) => {
    if (!cardNumber || cardNumber.length < 8) return '****';
    const firstFour = cardNumber.substring(0, 4);
    const lastFour = cardNumber.substring(cardNumber.length - 4);
    return `${firstFour}${'*'.repeat(cardNumber.length - 8)}${lastFour}`;
  },

  /**
   * Get payment status badge color
   *
   * @param {string} status - Transaction status
   * @returns {string} Color class name
   */
  getStatusColor: (status) => {
    const statusColors = {
      approved: 'green',
      pending: 'yellow',
      declined: 'red',
      failed: 'red',
      voided: 'gray',
      refunded: 'blue'
    };
    return statusColors[status] || 'gray';
  },

  /**
   * Get payment status display text
   *
   * @param {string} status - Transaction status
   * @returns {string} Display text
   */
  getStatusText: (status) => {
    const statusTexts = {
      approved: 'Approved',
      pending: 'Pending',
      declined: 'Declined',
      failed: 'Failed',
      voided: 'Voided',
      refunded: 'Refunded'
    };
    return statusTexts[status] || 'Unknown';
  }
};

export default paymentApi;
