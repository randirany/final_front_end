import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/company`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

/**
 * Create a new insurance company
 * POST /api/v1/company/addInsuranceCompany
 */
export const createCompany = async (companyData) => {
  const response = await axios.post(
    `${BASE_URL}/addInsuranceCompany`,
    companyData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all insurance companies with pagination
 * GET /api/v1/company/all?page=&limit=
 */
export const getAllCompanies = async (filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 10
  };

  const response = await axios.get(`${BASE_URL}/all`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};

/**
 * Get company by ID
 * GET /api/v1/company/:id
 */
export const getCompanyById = async (id) => {
  const response = await axios.get(
    `${BASE_URL}/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update company
 * PATCH /api/v1/company/:id
 */
export const updateCompany = async (id, updateData) => {
  const response = await axios.patch(
    `${BASE_URL}/${id}`,
    updateData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Delete company
 * DELETE /api/v1/company/:id
 */
export const deleteCompany = async (id) => {
  const response = await axios.delete(
    `${BASE_URL}/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export default {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
