import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/pricing-type`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Initialize/seed the 5 standard pricing types
 * POST /api/v1/pricing-type/initialize
 */
export const initializePricingTypes = async () => {
  const response = await axios.post(
    `${BASE_URL}/initialize`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all pricing types
 * GET /api/v1/pricing-type/all
 */
export const getAllPricingTypes = async () => {
  const response = await axios.get(
    `${BASE_URL}/all`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get pricing type by ID
 * GET /api/v1/pricing-type/:typeId
 */
export const getPricingTypeById = async (typeId) => {
  const response = await axios.get(
    `${BASE_URL}/${typeId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export default {
  initializePricingTypes,
  getAllPricingTypes,
  getPricingTypeById
};
