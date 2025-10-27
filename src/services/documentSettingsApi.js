import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/documentSettings`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = `islam__${localStorage.getItem('token')}`;
  return { token };
};

export const documentSettingsApi = {
  // Get all document settings with pagination
  // GET /api/v1/documentSettings/
  // According to API spec, only accepts page and limit parameters
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await axios.get(`${BASE_URL}/`, {
        params: {
          page,
          limit
        },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching document settings:', error);
      throw error;
    }
  },

  // Get document settings by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching document settings by ID:', error);
      throw error;
    }
  },

  // Get active document settings
  getActive: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/active`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active document settings:', error);
      throw error;
    }
  },

  // Create new document settings
  // POST /api/v1/documentSettings/create
  create: async (documentSettingsData) => {
    try {
      // Check if we have a logo file
      const hasLogoFile = documentSettingsData.logo instanceof File;

      if (hasLogoFile) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append basic fields
        if (documentSettingsData.companyName) {
          formData.append('companyName', documentSettingsData.companyName);
        }

        // Append nested objects - need to be flattened for FormData
        if (documentSettingsData.header) {
          Object.keys(documentSettingsData.header).forEach(key => {
            formData.append(`header[${key}]`, documentSettingsData.header[key]);
          });
        }

        if (documentSettingsData.footer) {
          Object.keys(documentSettingsData.footer).forEach(key => {
            formData.append(`footer[${key}]`, documentSettingsData.footer[key]);
          });
        }

        if (documentSettingsData.documentTemplate) {
          Object.keys(documentSettingsData.documentTemplate).forEach(key => {
            formData.append(`documentTemplate[${key}]`, documentSettingsData.documentTemplate[key]);
          });
        }

        // Append logo file
        formData.append('logo', documentSettingsData.logo);

        const response = await axios.post(`${BASE_URL}/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
          },
        });
        return response.data;
      } else {
        // No file, send as JSON
        const response = await axios.post(`${BASE_URL}/create`, documentSettingsData, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error creating document settings:', error);
      throw error;
    }
  },

  // Update document settings
  // PUT /api/v1/documentSettings/update/:id
  update: async (id, documentSettingsData) => {
    try {
      // Check if we have a logo file
      const hasLogoFile = documentSettingsData.logo instanceof File;

      if (hasLogoFile) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append basic fields
        if (documentSettingsData.companyName) {
          formData.append('companyName', documentSettingsData.companyName);
        }

        // Append nested objects - need to be flattened for FormData
        if (documentSettingsData.header) {
          Object.keys(documentSettingsData.header).forEach(key => {
            formData.append(`header[${key}]`, documentSettingsData.header[key]);
          });
        }

        if (documentSettingsData.footer) {
          Object.keys(documentSettingsData.footer).forEach(key => {
            formData.append(`footer[${key}]`, documentSettingsData.footer[key]);
          });
        }

        if (documentSettingsData.documentTemplate) {
          Object.keys(documentSettingsData.documentTemplate).forEach(key => {
            formData.append(`documentTemplate[${key}]`, documentSettingsData.documentTemplate[key]);
          });
        }

        // Append logo file
        formData.append('logo', documentSettingsData.logo);

        const response = await axios.put(`${BASE_URL}/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
          },
        });
        return response.data;
      } else {
        // No file, send as JSON
        const response = await axios.put(`${BASE_URL}/update/${id}`, documentSettingsData, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error updating document settings:', error);
      throw error;
    }
  },

  // Delete document settings
  // DELETE /api/v1/documentSettings/delete/:id
  delete: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting document settings:', error);
      throw error;
    }
  },

  // Activate document settings (makes it the active one)
  // PATCH /api/v1/documentSettings/activate/:id
  activate: async (id) => {
    try {
      const response = await axios.patch(`${BASE_URL}/activate/${id}`, {}, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error activating document settings:', error);
      throw error;
    }
  },

};

export default documentSettingsApi;