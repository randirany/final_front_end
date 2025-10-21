import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/sms`;

export const smsApi = {
  // Send single SMS
  sendSingle: async (phoneNumber, message, dlr = null) => {
    try {
      const payload = {
        phoneNumber,
        message
      };

      if (dlr) {
        payload.dlr = dlr;
      }

      const response = await axios.post(`${BASE_URL}/send`, payload);
      return response.data;
    } catch (error) {
      console.error('Error sending single SMS:', error);
      throw error;
    }
  },

  // Send bulk SMS
  sendBulk: async (recipients, message) => {
    try {
      const response = await axios.post(`${BASE_URL}/send-bulk`, {
        recipients,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      throw error;
    }
  }
};

export default smsApi;
