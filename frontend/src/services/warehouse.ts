import api from './api';
import { Warehouse, Location, CreateWarehouseDto, CreateLocationDto } from '../types/warehouse';

export const warehouseService = {
  // Warehouses
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const response = await api.get('/warehouses');
    return response.data;
  },

  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  createWarehouse: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    const response = await api.post('/warehouses', data);
    return response.data;
  },

  updateWarehouse: async (id: string, data: Partial<CreateWarehouseDto>): Promise<Warehouse> => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
  },

  deleteWarehouse: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },

  // Locations
  getLocations: async (warehouseId: string): Promise<Location[]> => {
    const response = await api.get(`/warehouses/${warehouseId}/locations`);
    return response.data;
  },

  createLocation: async (warehouseId: string, data: CreateLocationDto): Promise<Location> => {
    const response = await api.post(`/warehouses/${warehouseId}/locations`, data);
    return response.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/locations/${id}`); // Note: ID is passed directly based on backend route
  },
};
