import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/accident`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Create a new accident ticket
 * POST /api/v1/accident/addAccident/:insuredId/:vehicleId
 */
export const createAccidentTicket = async (insuredId, vehicleId, formData) => {
  const response = await axios.post(
    `${BASE_URL}/addAccident/${insuredId}/${vehicleId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

/**
 * Get all accident tickets with pagination and filters
 * GET /api/v1/accident/all
 */
export const getAllAccidents = async (filters = {}) => {
  const params = new URLSearchParams();

  // Pagination
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  // Filters
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);

  // Search
  if (filters.search) params.append('search', filters.search);

  // Sorting
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await axios.get(
    `${BASE_URL}/all?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get ticket by ticket number
 * GET /api/v1/accident/ticket/:ticketNumber
 */
export const getAccidentByTicketNumber = async (ticketNumber) => {
  const response = await axios.get(
    `${BASE_URL}/ticket/${ticketNumber}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update ticket status
 * PATCH /api/v1/accident/status/:id
 */
export const updateAccidentStatus = async (id, statusData) => {
  const response = await axios.patch(
    `${BASE_URL}/status/${id}`,
    statusData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Assign ticket to user
 * PATCH /api/v1/accident/assign/:id
 */
export const assignAccident = async (id, userId) => {
  const response = await axios.patch(
    `${BASE_URL}/assign/${id}`,
    { userId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Add comment to ticket
 * POST /api/v1/accident/comment/:accidentId
 */
export const addAccidentComment = async (accidentId, commentData) => {
  const response = await axios.post(
    `${BASE_URL}/comment/${accidentId}`,
    commentData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

/**
 * Get all comments for a ticket
 * GET /api/v1/accident/comments/:accidentId
 */
export const getAccidentComments = async (accidentId, includeInternal = true) => {
  const response = await axios.get(
    `${BASE_URL}/comments/${accidentId}?includeInternal=${includeInternal}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get accident statistics
 * GET /api/v1/accident/stats
 */
export const getAccidentStats = async () => {
  const response = await axios.get(
    `${BASE_URL}/stats`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update accident (legacy)
 * PATCH /api/v1/accident/updateAccident/:id
 */
export const updateAccident = async (id, updateData) => {
  const response = await axios.patch(
    `${BASE_URL}/updateAccident/${id}`,
    updateData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Delete accident ticket
 * DELETE /api/v1/accident/deleteAccident/:id
 */
export const deleteAccident = async (id) => {
  const response = await axios.delete(
    `${BASE_URL}/deleteAccident/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get accident report by date range
 * GET /api/v1/accident/accidentReport
 */
export const getAccidentReport = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axios.get(
    `${BASE_URL}/accidentReport?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get total accidents count
 * GET /api/v1/accident/totalAccidents
 */
export const getTotalAccidents = async () => {
  const response = await axios.get(
    `${BASE_URL}/totalAccidents`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export default {
  createAccidentTicket,
  getAllAccidents,
  getAccidentByTicketNumber,
  updateAccidentStatus,
  assignAccident,
  addAccidentComment,
  getAccidentComments,
  getAccidentStats,
  updateAccident,
  deleteAccident,
  getAccidentReport,
  getTotalAccidents
};
