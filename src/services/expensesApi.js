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

  // Get all expenses with filters (for reports)
  getAllWithFilters: async (filters = {}) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.paidBy) params.paidBy = filters.paidBy;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await axios.get(`${BASE_URL}/all`, {
        headers: { token },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses with filters:', error);
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
