import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/email`;

export const emailApi = {
  // Get inbox emails from Gmail
  getInbox: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${BASE_URL}/inbox`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inbox:', error);
      throw error;
    }
  },

  // Send single email
  send: async (emailData) => {
    try {
      const response = await axios.post(`${BASE_URL}/send`, emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Send bulk emails
  sendBulk: async (bulkEmailData) => {
    try {
      const response = await axios.post(`${BASE_URL}/send-bulk`, bulkEmailData);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  },

  // Get all emails from database
  getAll: async (page = 1, limit = 10, status = null) => {
    try {
      const params = { page, limit };
      if (status) {
        params.status = status;
      }
      const response = await axios.get(`${BASE_URL}/all`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all emails:', error);
      throw error;
    }
  },

  // Get email by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      throw error;
    }
  },

  // Delete email
  delete: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }
};

export default emailApi;
