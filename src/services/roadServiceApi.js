import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/roadService`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Create a new road service for a company
 * POST /api/v1/roadService/:companyId
 */
export const createRoadService = async (companyId, serviceData) => {
  const response = await axios.post(
    `${BASE_URL}/${companyId}`,
    serviceData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all road services with filters
 * GET /api/v1/roadService/all?company_id=&is_active=&page=&limit=
 */
export const getAllRoadServices = async (filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.company_id && { company_id: filters.company_id }),
    ...(filters.is_active !== undefined && { is_active: filters.is_active })
  };

  const response = await axios.get(`${BASE_URL}/all`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};

/**
 * Get road services by company
 * GET /api/v1/roadService/company/:companyId?is_active=
 */
export const getRoadServicesByCompany = async (companyId, isActive = undefined) => {
  const params = {};
  if (isActive !== undefined) {
    params.is_active = isActive;
  }

  const response = await axios.get(
    `${BASE_URL}/company/${companyId}`,
    {
      headers: getAuthHeaders(),
      params
    }
  );
  return response.data;
};

/**
 * Get single road service by ID
 * GET /api/v1/roadService/:id
 */
export const getRoadServiceById = async (id) => {
  const response = await axios.get(
    `${BASE_URL}/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update road service
 * PATCH /api/v1/roadService/:id
 */
export const updateRoadService = async (id, updateData) => {
  const response = await axios.patch(
    `${BASE_URL}/${id}`,
    updateData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Delete road service
 * DELETE /api/v1/roadService/:id
 */
export const deleteRoadService = async (id) => {
  const response = await axios.delete(
    `${BASE_URL}/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Calculate road service price based on vehicle year
 * POST /api/v1/roadService/calculate-price
 */
export const calculateRoadServicePrice = async (serviceId, vehicleYear) => {
  const response = await axios.post(
    `${BASE_URL}/calculate-price`,
    {
      service_id: serviceId,
      vehicle_year: vehicleYear
    },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Legacy API object for backward compatibility
export const roadServiceApi = {
  getAll: getAllRoadServices,
  getById: getRoadServiceById,
  create: (data) => {
    console.warn('roadServiceApi.create() requires companyId parameter. Use createRoadService(companyId, data) instead.');
    throw new Error('Missing companyId parameter');
  },
  update: updateRoadService,
  delete: deleteRoadService
};

export default {
  createRoadService,
  getAllRoadServices,
  getRoadServicesByCompany,
  getRoadServiceById,
  updateRoadService,
  deleteRoadService,
  calculateRoadServicePrice,
  // Legacy compatibility
  roadServiceApi
};
