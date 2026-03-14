import { ReceiptRepository } from './repository';

export class ReceiptService {
  constructor(private readonly repository: ReceiptRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const receipt = await this.repository.findById(id);
    if (!receipt) throw new Error('Receipt not found');
    return receipt;
  }

  async create(data: { supplierName: string; warehouseId: string; createdBy: string }) {
    return this.repository.create(data);
  }

  async addItem(receiptId: string, data: { productId: string; quantity: number }) {
    const receipt = await this.findById(receiptId);
    if (receipt.status === 'DONE' || receipt.status === 'CANCELED') {
      throw new Error('Cannot add items to a completed or canceled receipt');
    }
    return this.repository.addItem(receiptId, data);
  }

  async removeItem(receiptId: string, itemId: string) {
    const receipt = await this.findById(receiptId);
    if (receipt.status === 'DONE' || receipt.status === 'CANCELED') {
      throw new Error('Cannot remove items from a completed or canceled receipt');
    }
    return this.repository.removeItem(itemId);
  }

  async validate(receiptId: string) {
    const receipt = await this.findById(receiptId);
    return this.repository.validateReceipt(receiptId, receipt.warehouseId);
  }

  async cancel(receiptId: string) {
    const receipt = await this.findById(receiptId);
    if (receipt.status === 'DONE') {
      throw new Error('Cannot cancel a completed receipt');
    }
    return this.repository.updateStatus(receiptId, 'CANCELED');
  }

  async delete(id: string) {
    const receipt = await this.findById(id);
    if (receipt.status === 'DONE') {
      throw new Error('Cannot delete a completed receipt');
    }
    return this.repository.delete(id);
  }
}
