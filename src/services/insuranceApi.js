import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/insured`;
const AGENT_BASE_URL = `${API_BASE_URL}/agents`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Add Insurance to Vehicle - NEW VERSION with Multi-Payment & Agent Flow
 * POST /api/v1/insured/addInsurance/:insuredId/:vehicleId
 *
 * @param {string} insuredId - The insured customer ID
 * @param {string} vehicleId - The vehicle ID
 * @param {Object} insuranceData - Insurance data including payments and agent flow
 * @param {File[]} files - Array of insurance files (optional)
 * @returns {Promise} Response with insurance details
 */
export const addInsuranceToVehicle = async (insuredId, vehicleId, insuranceData, files = []) => {
  // Check if we have files - determines if we use FormData or JSON
  const hasFiles = files && files.length > 0;

  if (hasFiles) {
    // Use FormData when files are present
    const formData = new FormData();

    // Append basic insurance fields
    formData.append('insuranceType', insuranceData.insuranceType);
    formData.append('insuranceCompany', insuranceData.insuranceCompany);
    formData.append('insuranceAmount', insuranceData.insuranceAmount);
    formData.append('isUnder24', insuranceData.isUnder24 || false);

    // Optional fields
    if (insuranceData.agent) formData.append('agent', insuranceData.agent);
    if (insuranceData.agentId) formData.append('agentId', insuranceData.agentId);
    if (insuranceData.insuranceStartDate) formData.append('insuranceStartDate', insuranceData.insuranceStartDate);
    if (insuranceData.insuranceEndDate) formData.append('insuranceEndDate', insuranceData.insuranceEndDate);
    if (insuranceData.priceisOnTheCustomer) formData.append('priceisOnTheCustomer', insuranceData.priceisOnTheCustomer);

    // Agent flow fields
    if (insuranceData.agentFlow) formData.append('agentFlow', insuranceData.agentFlow);
    if (insuranceData.agentAmount) formData.append('agentAmount', insuranceData.agentAmount);

    // Payments array - send as FormData array notation per documentation
    if (insuranceData.payments && Array.isArray(insuranceData.payments) && insuranceData.payments.length > 0) {
      // Clean up payments - remove empty/null/undefined fields
      const cleanedPayments = insuranceData.payments.map(payment => {
        const cleaned = {};
        Object.keys(payment).forEach(key => {
          const value = payment[key];
          // Only include non-empty values
          if (value !== '' && value !== undefined && value !== null) {
            cleaned[key] = value;
          }
        });
        return cleaned;
      });

      console.log('Sending payments (FormData):', cleanedPayments);

      // Send each payment field using array notation
      cleanedPayments.forEach((payment, index) => {
        Object.keys(payment).forEach(key => {
          formData.append(`payments[${index}][${key}]`, payment[key]);
        });
      });
    }

    // Append files
    files.forEach(file => {
      formData.append('insuranceFiles', file);
    });

    const response = await axios.post(
      `${BASE_URL}/addInsurance/${insuredId}/${vehicleId}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;

  } else {
    // Use JSON when no files - cleaner and more reliable
    const payload = {
      insuranceType: insuranceData.insuranceType,
      insuranceCompany: insuranceData.insuranceCompany,
      insuranceAmount: insuranceData.insuranceAmount,
      isUnder24: insuranceData.isUnder24 || false,
    };

    // Add optional fields
    if (insuranceData.agent) payload.agent = insuranceData.agent;
    if (insuranceData.agentId) payload.agentId = insuranceData.agentId;
    if (insuranceData.insuranceStartDate) payload.insuranceStartDate = insuranceData.insuranceStartDate;
    if (insuranceData.insuranceEndDate) payload.insuranceEndDate = insuranceData.insuranceEndDate;
    if (insuranceData.priceisOnTheCustomer) payload.priceisOnTheCustomer = insuranceData.priceisOnTheCustomer;

    // Agent flow
    if (insuranceData.agentFlow) payload.agentFlow = insuranceData.agentFlow;
    if (insuranceData.agentAmount) payload.agentAmount = insuranceData.agentAmount;

    // Payments array - send as proper JSON array
    if (insuranceData.payments && Array.isArray(insuranceData.payments) && insuranceData.payments.length > 0) {
      // Clean up payments
      const cleanedPayments = insuranceData.payments.map(payment => {
        const cleaned = {};
        Object.keys(payment).forEach(key => {
          const value = payment[key];
          if (value !== '' && value !== undefined && value !== null) {
            cleaned[key] = value;
          }
        });
        return cleaned;
      });

      console.log('Sending payments (JSON):', cleanedPayments);
      payload.payments = cleanedPayments;
    }

    const response = await axios.post(
      `${BASE_URL}/addInsurance/${insuredId}/${vehicleId}`,
      payload,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }
};

/**
 * Add Payment to Existing Insurance
 * POST /api/v1/insured/addPayment/:insuredId/:vehicleId/:insuranceId
 *
 * @param {string} insuredId - The insured customer ID
 * @param {string} vehicleId - The vehicle ID
 * @param {string} insuranceId - The insurance ID
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Payment amount (required)
 * @param {string} paymentData.paymentMethod - Payment method: cash, card, cheque, bank_transfer (required)
 * @param {string} paymentData.paymentDate - Date of payment (optional)
 * @param {string} paymentData.notes - Additional notes (optional, max 500 chars)
 * @param {string} paymentData.receiptNumber - Receipt number (optional)
 * @param {string} paymentData.chequeNumber - Cheque number (required if paymentMethod is cheque)
 * @param {string} paymentData.chequeDate - Cheque date (required if paymentMethod is cheque)
 * @param {string} paymentData.chequeStatus - Cheque status: pending, cleared, returned, cancelled (optional)
 * @returns {Promise} Response with updated insurance details
 */
export const addPaymentToInsurance = async (insuredId, vehicleId, insuranceId, paymentData) => {
  const response = await axios.post(
    `${BASE_URL}/addPayment/${insuredId}/${vehicleId}/${insuranceId}`,
    paymentData,
    { headers: getAuthHeaders() }
  );

  return response.data;
};

/**
 * Get Agent Statement (كشف الوكيل)
 * GET /api/v1/agents/:agentId/statement
 *
 * @param {string} agentId - The agent ID
 * @param {Object} filters - Optional filters (startDate, endDate, status)
 * @returns {Promise} Response with agent statement
 */
export const getAgentStatement = async (agentId, filters = {}) => {
  const params = {};

  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.status) params.status = filters.status; // pending, settled, or all

  const response = await axios.get(
    `${AGENT_BASE_URL}/${agentId}/statement`,
    {
      headers: getAuthHeaders(),
      params
    }
  );

  return response.data;
};

/**
 * Get Agent Transactions
 * GET /api/v1/agents/:agentId/transactions
 *
 * @param {string} agentId - The agent ID
 * @param {Object} filters - Optional filters
 * @returns {Promise} Response with agent transactions
 */
export const getAgentTransactions = async (agentId, filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 20
  };

  if (filters.type) params.type = filters.type; // credit, debit, or all
  if (filters.status) params.status = filters.status; // pending, settled, cancelled, or all
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await axios.get(
    `${AGENT_BASE_URL}/${agentId}/transactions`,
    {
      headers: getAuthHeaders(),
      params
    }
  );

  return response.data;
};

/**
 * Settle Agent Transaction
 * PATCH /api/v1/agents/transactions/:transactionId/settle
 *
 * @param {string} transactionId - The transaction ID
 * @param {string} notes - Optional notes
 * @returns {Promise} Response with settled transaction
 */
export const settleAgentTransaction = async (transactionId, notes = '') => {
  const response = await axios.patch(
    `${AGENT_BASE_URL}/transactions/${transactionId}/settle`,
    { notes },
    { headers: getAuthHeaders() }
  );

  return response.data;
};

/**
 * Get All Agents
 * GET /api/v1/agents/all
 *
 * @returns {Promise} Response with all agents
 */
export const getAllAgents = async () => {
  const response = await axios.get(
    `${AGENT_BASE_URL}/all`,
    { headers: getAuthHeaders() }
  );

  return response.data;
};

/**
 * Get Payments and Debts by Agent (كشف حساب الوكيل)
 * GET /api/v1/insured/getPaymentsAndDebtsByAgent/:agentName
 *
 * This endpoint provides a financial statement for a specific agent, showing:
 * - All insurances sold by the agent
 * - Total payments collected
 * - Total outstanding debts
 * - Detailed breakdown per insurance
 *
 * @param {string} agentName - The agent name
 * @returns {Promise} Response with agent statement including insurances
 * @example
 * Response structure:
 * {
 *   agent: "John Smith",
 *   totalPaid: 15000,
 *   totalDebts: 5000,
 *   insuranceList: [
 *     {
 *       customer: "Ahmed Ali",
 *       insuranceCompany: "ABC Insurance",
 *       insuranceType: "Comprehensive",
 *       insuranceAmount: 5000,
 *       paidAmount: 3000,
 *       remainingDebt: 2000,
 *       paymentMethod: "cash",
 *       insuranceStartDate: "2024-01-01T00:00:00.000Z",
 *       insuranceEndDate: "2025-01-01T00:00:00.000Z",
 *       summary: { total: 5000, paid: 3000, remaining: 2000 }
 *     }
 *   ]
 * }
 */
export const getPaymentsAndDebtsByAgent = async (agentName) => {
  const response = await axios.get(
    `${BASE_URL}/getPaymentsAndDebtsByAgent/${encodeURIComponent(agentName)}`,
    { headers: getAuthHeaders() }
  );

  return response.data;
};

export default {
  addInsuranceToVehicle,
  addPaymentToInsurance,
  getAgentStatement,
  getAgentTransactions,
  settleAgentTransaction,
  getAllAgents,
  getPaymentsAndDebtsByAgent
};
