import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/insured`;

export const vehicleApi = {
  // Get vehicle data by plate number from external API
  getVehicleDataByPlate: async (plateNumber) => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`${BASE_URL}/vehicle-data/${plateNumber}`, {
        headers: {
          token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      throw error;
    }
  },

  // Add vehicle to customer
  addVehicle: async (insuredId, vehicleData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/addCar/${insuredId}`,
        vehicleData,
        {
          headers: {
            Authorization: `islam__${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }
};

export default vehicleApi;
