import { warehouseRepository } from './repository';
import { CreateWarehousePayload, CreateLocationPayload } from './validator';

export class WarehouseService {
  async createWarehouse(data: CreateWarehousePayload) {
    return warehouseRepository.createWarehouse(data);
  }

  async getAllWarehouses() {
    return warehouseRepository.getAllWarehouses();
  }

  async getWarehouseById(id: string) {
    const warehouse = await warehouseRepository.getWarehouseById(id);
    if (!warehouse) throw new Error('Warehouse not found');
    return warehouse;
  }

  async updateWarehouse(id: string, data: Partial<CreateWarehousePayload>) {
    await this.getWarehouseById(id); // verify existence
    return warehouseRepository.updateWarehouse(id, data);
  }

  async deleteWarehouse(id: string) {
    await this.getWarehouseById(id); // verify existence
    return warehouseRepository.deleteWarehouse(id);
  }

  // Locations
  async createLocation(warehouseId: string, data: Omit<CreateLocationPayload, 'warehouseId'>) {
    await this.getWarehouseById(warehouseId); // verify warehouse exists
    return warehouseRepository.createLocation({ ...data, warehouseId });
  }

  async getLocations(warehouseId: string) {
    await this.getWarehouseById(warehouseId);
    return warehouseRepository.getLocationsByWarehouse(warehouseId);
  }

  async deleteLocation(id: string) {
    return warehouseRepository.deleteLocation(id);
  }
}

export const warehouseService = new WarehouseService();
