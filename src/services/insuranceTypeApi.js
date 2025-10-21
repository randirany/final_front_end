import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/insuranceType`;

export const insuranceTypeApi = {
  // Get all insurance types
  getAll: async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`${BASE_URL}/all`, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching insurance types:', error);
      throw error;
    }
  },

  // Get insurance type by ID
  getById: async (id) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching insurance type:', error);
      throw error;
    }
  },

  // Create new insurance type
  create: async (insuranceTypeData) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.post(`${BASE_URL}/add`, insuranceTypeData, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating insurance type:', error);
      throw error;
    }
  },

  // Update insurance type
  update: async (id, insuranceTypeData) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.patch(`${BASE_URL}/${id}`, insuranceTypeData, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating insurance type:', error);
      throw error;
    }
  },

  // Delete insurance type
  delete: async (id) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting insurance type:', error);
      throw error;
    }
  }
};

export default insuranceTypeApi;
