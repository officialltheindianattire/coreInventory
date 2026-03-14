import { TransferRepository } from './repository';

export class TransferService {
  constructor(private readonly repository: TransferRepository) {}

  async findAll() { return this.repository.findAll(); }

  async findById(id: string) {
    const transfer = await this.repository.findById(id);
    if (!transfer) throw new Error('Transfer not found');
    return transfer;
  }

  async create(data: { fromLocationId: string; toLocationId: string }) {
    if (data.fromLocationId === data.toLocationId) {
      throw new Error('Source and destination locations must be different');
    }
    return this.repository.create(data);
  }

  async addItem(transferId: string, data: { productId: string; quantity: number }) {
    const transfer = await this.findById(transferId);
    if (transfer.status === 'DONE' || transfer.status === 'CANCELED') {
      throw new Error('Cannot modify a completed or canceled transfer');
    }
    return this.repository.addItem(transferId, data);
  }

  async removeItem(transferId: string, itemId: string) {
    const transfer = await this.findById(transferId);
    if (transfer.status === 'DONE' || transfer.status === 'CANCELED') {
      throw new Error('Cannot modify a completed or canceled transfer');
    }
    return this.repository.removeItem(itemId);
  }

  async validate(transferId: string) {
    return this.repository.validateTransfer(transferId);
  }

  async cancel(transferId: string) {
    const transfer = await this.findById(transferId);
    if (transfer.status === 'DONE') throw new Error('Cannot cancel a completed transfer');
    return this.repository.updateStatus(transferId, 'CANCELED');
  }

  async delete(id: string) {
    const transfer = await this.findById(id);
    if (transfer.status === 'DONE') throw new Error('Cannot delete a completed transfer');
    return this.repository.delete(id);
  }
}
