import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/expense`;

export const expensesApi = {
  // Get all expenses
  getAll: async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`${BASE_URL}/getExpenses`, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Create new expense
  create: async (expenseData) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.post(`${BASE_URL}/addExpense`, expenseData, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  // Update expense
  update: async (id, expenseData) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.put(`${BASE_URL}/${id}`, expenseData, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Delete expense
  delete: async (id) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};

export default expensesApi;
