import { AdjustmentRepository } from './repository';

export class AdjustmentService {
  constructor(private readonly repository: AdjustmentRepository) {}

  async findAll() { return this.repository.findAll(); }

  async findById(id: string) {
    const adj = await this.repository.findById(id);
    if (!adj) throw new Error('Adjustment not found');
    return adj;
  }

  async create(data: { productId: string; locationId: string; quantityChange: number; reason: string }) {
    return this.repository.create(data);
  }
}
