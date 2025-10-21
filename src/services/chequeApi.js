import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/v1/cheque';

// Get auth token
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem("token")}`;
  return { token };
};

// Get auth headers for FormData
const getAuthHeadersFormData = () => {
  const token = `islam__${localStorage.getItem("token")}`;
  return {
    token,
    'Content-Type': 'multipart/form-data'
  };
};

/**
 * CREATE - Add New Cheque (General - Customer)
 * POST /api/v1/cheque/customer/:customerId
 */
export const createCustomerCheque = async (customerId, formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/customer/${customerId}`,
      formData,
      { headers: getAuthHeadersFormData() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating customer cheque:', error);
    throw error.response?.data || error;
  }
};

/**
 * CREATE - Add Cheque to Insurance Payment
 * POST /api/v1/cheque/insurance/:insuranceId
 */
export const createInsuranceCheque = async (insuranceId, formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/insurance/${insuranceId}`,
      formData,
      { headers: getAuthHeadersFormData() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating insurance cheque:', error);
    throw error.response?.data || error;
  }
};

/**
 * READ - Get All Cheques
 * GET /api/v1/cheque/all
 * Query params: startDate, endDate, status, customerId, page, limit
 */
export const getAllCheques = async (filters = {}) => {
  try {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.status && filters.status !== 'all' && { status: filters.status }),
      ...(filters.customerId && { customerId: filters.customerId })
    };

    const response = await axios.get(`${API_BASE_URL}/all`, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cheques:', error);
    throw error.response?.data || error;
  }
};

/**
 * READ - Get Single Cheque
 * GET /api/v1/cheque/:chequeId
 */
export const getChequeById = async (chequeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${chequeId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cheque details:', error);
    throw error.response?.data || error;
  }
};

/**
 * READ - Get Customer Cheques
 * GET /api/v1/cheque/customer/:customerId
 * Query params: status (optional)
 */
export const getCustomerCheques = async (customerId, status = 'all') => {
  try {
    const params = status !== 'all' ? { status } : {};
    const response = await axios.get(`${API_BASE_URL}/customer/${customerId}`, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer cheques:', error);
    throw error.response?.data || error;
  }
};

/**
 * READ - Get Cheque Statistics
 * GET /api/v1/cheque/statistics
 */
export const getChequeStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cheque statistics:', error);
    throw error.response?.data || error;
  }
};

/**
 * UPDATE - Update Cheque Status
 * PATCH /api/v1/cheque/:chequeId/status
 */
export const updateChequeStatus = async (chequeId, statusData) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/${chequeId}/status`,
      statusData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating cheque status:', error);
    throw error.response?.data || error;
  }
};

/**
 * DELETE - Delete Cheque
 * DELETE /api/v1/cheque/:chequeId
 */
export const deleteCheque = async (chequeId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${chequeId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting cheque:', error);
    throw error.response?.data || error;
  }
};

// Helper function to create FormData from cheque object
export const createChequeFormData = (chequeData) => {
  const formData = new FormData();

  if (chequeData.chequeNumber) formData.append('chequeNumber', chequeData.chequeNumber);
  if (chequeData.chequeDate) formData.append('chequeDate', chequeData.chequeDate);
  if (chequeData.amount) formData.append('amount', chequeData.amount);
  if (chequeData.notes) formData.append('notes', chequeData.notes);
  if (chequeData.chequeImage && chequeData.chequeImage instanceof File) {
    formData.append('chequeImage', chequeData.chequeImage);
  }

  return formData;
};
