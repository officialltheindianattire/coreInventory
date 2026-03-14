import { InventoryRepository } from './repository';

export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async getStockLevels() {
    return this.repository.getStockLevels();
  }

  async getStockByProduct(productId: string) {
    return this.repository.getStockByProduct(productId);
  }

  async getMovementHistory(filters?: { productId?: string; movementType?: string; limit?: number }) {
    return this.repository.getMovementHistory(filters);
  }

  async getStockByLocation() {
    return this.repository.getStockByLocation();
  }
}
