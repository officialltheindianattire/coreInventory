import prisma from '../../utils/db';
import { CreateWarehousePayload, CreateLocationPayload } from './validator';

export class WarehouseRepository {
  // Warehouses
  async createWarehouse(data: CreateWarehousePayload) {
    return prisma.warehouse.create({ data });
  }

  async getAllWarehouses() {
    return prisma.warehouse.findMany({
      include: {
        locations: true,
        _count: {
          select: { locations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getWarehouseById(id: string) {
    return prisma.warehouse.findUnique({
      where: { id },
      include: { locations: true }
    });
  }

  async updateWarehouse(id: string, data: Partial<CreateWarehousePayload>) {
    return prisma.warehouse.update({
      where: { id },
      data
    });
  }

  async deleteWarehouse(id: string) {
    return prisma.warehouse.delete({
      where: { id }
    });
  }

  // Locations under a warehouse
  async createLocation(data: CreateLocationPayload) {
    return prisma.location.create({ data });
  }

  async getLocationsByWarehouse(warehouseId: string) {
    return prisma.location.findMany({
      where: { warehouseId },
      orderBy: { name: 'asc' }
    });
  }

  async deleteLocation(id: string) {
    return prisma.location.delete({
      where: { id }
    });
  }
}

export const warehouseRepository = new WarehouseRepository();
