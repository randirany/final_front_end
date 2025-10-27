import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/user`;

export const userApi = {
  // Reset employee password (Admin only)
  resetEmployeePassword: async (userId, newPassword) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.patch(
        `${BASE_URL}/reset-employee-password/${userId}`,
        { newPassword },
        {
          headers: {
            token
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error resetting employee password:', error);
      throw error;
    }
  }
};

export default userApi;
