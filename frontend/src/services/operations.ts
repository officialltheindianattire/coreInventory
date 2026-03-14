import api from './api';

export const inventoryService = {
  getStockLevels: async () => {
    const response = await api.get('/inventory/stock');
    return response.data;
  },
  getStockByLocation: async () => {
    const response = await api.get('/inventory/locations');
    return response.data;
  },
  getMovementHistory: async (params?: { productId?: string; movementType?: string; limit?: number }) => {
    const response = await api.get('/inventory/history', { params });
    return response.data;
  },
};

export const receiptService = {
  getAll: async () => {
    const response = await api.get('/receipts');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },
  create: async (data: { supplierName: string; warehouseId: string }) => {
    const response = await api.post('/receipts', data);
    return response.data;
  },
  addItem: async (receiptId: string, data: { productId: string; quantity: number }) => {
    const response = await api.post(`/receipts/${receiptId}/items`, data);
    return response.data;
  },
  removeItem: async (receiptId: string, itemId: string) => {
    await api.delete(`/receipts/${receiptId}/items/${itemId}`);
  },
  validate: async (receiptId: string) => {
    const response = await api.post(`/receipts/${receiptId}/validate`);
    return response.data;
  },
  cancel: async (receiptId: string) => {
    const response = await api.post(`/receipts/${receiptId}/cancel`);
    return response.data;
  },
  delete: async (receiptId: string) => {
    await api.delete(`/receipts/${receiptId}`);
  },
};

export const deliveryService = {
  getAll: async () => {
    const response = await api.get('/deliveries');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },
  create: async (data: { customerName: string; warehouseId: string }) => {
    const response = await api.post('/deliveries', data);
    return response.data;
  },
  addItem: async (deliveryId: string, data: { productId: string; quantity: number }) => {
    const response = await api.post(`/deliveries/${deliveryId}/items`, data);
    return response.data;
  },
  removeItem: async (deliveryId: string, itemId: string) => {
    await api.delete(`/deliveries/${deliveryId}/items/${itemId}`);
  },
  validate: async (deliveryId: string) => {
    const response = await api.post(`/deliveries/${deliveryId}/validate`);
    return response.data;
  },
  cancel: async (deliveryId: string) => {
    const response = await api.post(`/deliveries/${deliveryId}/cancel`);
    return response.data;
  },
  delete: async (deliveryId: string) => {
    await api.delete(`/deliveries/${deliveryId}`);
  },
};

export const transferService = {
  getAll: async () => {
    const response = await api.get('/transfers');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },
  create: async (data: { fromLocationId: string; toLocationId: string }) => {
    const response = await api.post('/transfers', data);
    return response.data;
  },
  addItem: async (transferId: string, data: { productId: string; quantity: number }) => {
    const response = await api.post(`/transfers/${transferId}/items`, data);
    return response.data;
  },
  removeItem: async (transferId: string, itemId: string) => {
    await api.delete(`/transfers/${transferId}/items/${itemId}`);
  },
  validate: async (transferId: string) => {
    const response = await api.post(`/transfers/${transferId}/validate`);
    return response.data;
  },
  cancel: async (transferId: string) => {
    const response = await api.post(`/transfers/${transferId}/cancel`);
    return response.data;
  },
  delete: async (transferId: string) => {
    await api.delete(`/transfers/${transferId}`);
  },
};

export const adjustmentService = {
  getAll: async () => {
    const response = await api.get('/adjustments');
    return response.data;
  },
  create: async (data: { productId: string; locationId: string; quantityChange: number; reason: string }) => {
    const response = await api.post('/adjustments', data);
    return response.data;
  },
};

export const dashboardService = {
  getKPIs: async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
  },
  getRecentActivity: async (limit?: number) => {
    const response = await api.get('/dashboard/activity', { params: { limit } });
    return response.data;
  },
};
