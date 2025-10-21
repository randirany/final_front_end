import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/pricing`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Create or update pricing configuration for a company
 * POST /api/v1/pricing/:companyId
 */
export const createOrUpdatePricing = async (companyId, pricingData) => {
  const response = await axios.post(
    `${BASE_URL}/${companyId}`,
    pricingData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all pricing configurations with filters
 * GET /api/v1/pricing/all?company_id=&pricing_type_id=&page=&limit=
 */
export const getAllPricing = async (filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.company_id && { company_id: filters.company_id }),
    ...(filters.pricing_type_id && { pricing_type_id: filters.pricing_type_id })
  };

  const response = await axios.get(`${BASE_URL}/all`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};

/**
 * Get all pricing configurations for a specific company
 * GET /api/v1/pricing/company/:companyId
 */
export const getPricingByCompany = async (companyId) => {
  const response = await axios.get(
    `${BASE_URL}/company/${companyId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get specific pricing configuration
 * GET /api/v1/pricing/:companyId/:pricingTypeId
 */
export const getSpecificPricing = async (companyId, pricingTypeId) => {
  const response = await axios.get(
    `${BASE_URL}/${companyId}/${pricingTypeId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Calculate price based on pricing rules
 * POST /api/v1/pricing/calculate
 */
export const calculatePrice = async (calculationData) => {
  const response = await axios.post(
    `${BASE_URL}/calculate`,
    calculationData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Delete pricing configuration
 * DELETE /api/v1/pricing/:companyId/:pricingTypeId
 */
export const deletePricing = async (companyId, pricingTypeId) => {
  const response = await axios.delete(
    `${BASE_URL}/${companyId}/${pricingTypeId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export default {
  createOrUpdatePricing,
  getAllPricing,
  getPricingByCompany,
  getSpecificPricing,
  calculatePrice,
  deletePricing
};
