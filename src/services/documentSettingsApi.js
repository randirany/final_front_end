import axios from 'axios';

const BASE_URL = '/api/document-settings';

export const documentSettingsApi = {
  // Get all document settings with pagination and search
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = params;
      const response = await axios.get(BASE_URL, {
        params: {
          page,
          limit,
          search,
          sortBy,
          sortOrder
        }
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
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document settings by ID:', error);
      throw error;
    }
  },

  // Get active document settings
  getActive: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active document settings:', error);
      throw error;
    }
  },

  // Create new document settings
  create: async (documentSettingsData) => {
    try {
      const formData = new FormData();

      // Only append fields that are allowed by the backend validation schema
      // Based on the API validation error, only companyName is allowed
      if (documentSettingsData.companyName) {
        formData.append('companyName', documentSettingsData.companyName);
      }

      // Append logo file if present
      if (documentSettingsData.logo) {
        formData.append('logo', documentSettingsData.logo);
      }

      const response = await axios.post(BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating document settings:', error);
      throw error;
    }
  },

  // Update document settings
  update: async (id, documentSettingsData) => {
    try {
      const formData = new FormData();

      // Only append fields that are allowed by the backend validation schema
      // Based on the API validation error, only companyName is allowed
      if (documentSettingsData.companyName) {
        formData.append('companyName', documentSettingsData.companyName);
      }

      // Append logo file if present (for replacement)
      if (documentSettingsData.logo) {
        formData.append('logo', documentSettingsData.logo);
      }

      const response = await axios.put(`${BASE_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating document settings:', error);
      throw error;
    }
  },

  // Delete document settings
  delete: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document settings:', error);
      throw error;
    }
  },

  // Activate document settings (makes it the active one)
  activate: async (id) => {
    try {
      const response = await axios.patch(`${BASE_URL}/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating document settings:', error);
      throw error;
    }
  },

  // Deactivate document settings
  deactivate: async (id) => {
    try {
      const response = await axios.patch(`${BASE_URL}/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating document settings:', error);
      throw error;
    }
  },

  // Upload logo to Cloudinary
  uploadLogo: async (logoFile) => {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await axios.post(`${BASE_URL}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // Delete logo from Cloudinary
  deleteLogo: async (logoUrl) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete-logo`, {
        data: { logoUrl }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  },

  // Export document settings
  export: async (format = 'xlsx') => {
    try {
      const response = await axios.get(`${BASE_URL}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting document settings:', error);
      throw error;
    }
  },

  // Validate document settings data
  validate: async (documentSettingsData) => {
    try {
      const response = await axios.post(`${BASE_URL}/validate`, documentSettingsData);
      return response.data;
    } catch (error) {
      console.error('Error validating document settings:', error);
      throw error;
    }
  }
};

export default documentSettingsApi;