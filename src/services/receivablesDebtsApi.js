import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/insured/due-items`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Get all due items (insurances and cheques)
 * GET /api/v1/insured/due-items/all
 *
 * @param {Object} params - Query parameters
 * @param {string} params.customerId - Filter by customer ID (optional)
 * @param {string} params.type - Type of items: 'all', 'insurances', 'cheques' (default: 'all')
 * @param {string} params.startDate - Start date filter (optional)
 * @param {string} params.endDate - End date filter (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 50)
 * @param {string} params.sortBy - Sort field: 'dueDate', 'amount', 'status' (default: 'dueDate')
 * @param {string} params.sortOrder - Sort order: 'asc', 'desc' (default: 'asc')
 * @returns {Promise} Response with due items, summary, and pagination
 */
export const getAllDueItems = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/all`, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching due items:', error);
    throw error;
  }
};

/**
 * Get due items for a specific customer
 *
 * @param {string} customerId - Customer ID
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise} Response with customer's due items
 */
export const getCustomerDueItems = async (customerId, additionalParams = {}) => {
  return getAllDueItems({ customerId, ...additionalParams });
};

/**
 * Get only overdue items
 *
 * @param {Object} params - Query parameters
 * @returns {Promise} Response with overdue items
 */
export const getOverdueItems = async (params = {}) => {
  return getAllDueItems({
    sortBy: 'status',
    sortOrder: 'asc',
    ...params
  });
};

/**
 * Get due items by type
 *
 * @param {string} type - Type: 'insurances' or 'cheques'
 * @param {Object} params - Additional query parameters
 * @returns {Promise} Response with filtered items
 */
export const getDueItemsByType = async (type, params = {}) => {
  return getAllDueItems({ type, ...params });
};

/**
 * Get due items for a date range
 *
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} params - Additional query parameters
 * @returns {Promise} Response with items in date range
 */
export const getDueItemsByDateRange = async (startDate, endDate, params = {}) => {
  return getAllDueItems({ startDate, endDate, ...params });
};

export default {
  getAllDueItems,
  getCustomerDueItems,
  getOverdueItems,
  getDueItemsByType,
  getDueItemsByDateRange
};
