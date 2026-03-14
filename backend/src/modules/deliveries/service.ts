import { DeliveryRepository } from './repository';

export class DeliveryService {
  constructor(private readonly repository: DeliveryRepository) {}

  async findAll() { return this.repository.findAll(); }

  async findById(id: string) {
    const delivery = await this.repository.findById(id);
    if (!delivery) throw new Error('Delivery not found');
    return delivery;
  }

  async create(data: { customerName: string; contact?: string; scheduleDate?: Date; fromLocationId?: string; warehouseId: string; createdBy: string }) {
    return this.repository.create(data);
  }

  async addItem(deliveryId: string, data: { productId: string; quantity: number }) {
    const delivery = await this.findById(deliveryId);
    if (delivery.status === 'DONE' || delivery.status === 'CANCELED') {
      throw new Error('Cannot modify a completed or canceled delivery');
    }
    return this.repository.addItem(deliveryId, data);
  }

  async removeItem(deliveryId: string, itemId: string) {
    const delivery = await this.findById(deliveryId);
    if (delivery.status === 'DONE' || delivery.status === 'CANCELED') {
      throw new Error('Cannot modify a completed or canceled delivery');
    }
    return this.repository.removeItem(itemId);
  }

  async validate(deliveryId: string) {
    return this.repository.validateDelivery(deliveryId);
  }

  async markReady(deliveryId: string) {
    const delivery = await this.findById(deliveryId);
    if (delivery.status !== 'DRAFT') {
      throw new Error('Status must be DRAFT to mark as READY');
    }
    return this.repository.updateStatus(deliveryId, 'READY');
  }

  async cancel(deliveryId: string) {
    const delivery = await this.findById(deliveryId);
    if (delivery.status === 'DONE') throw new Error('Cannot cancel a completed delivery');
    return this.repository.updateStatus(deliveryId, 'CANCELED');
  }

  async delete(id: string) {
    const delivery = await this.findById(id);
    if (delivery.status === 'DONE') throw new Error('Cannot delete a completed delivery');
    return this.repository.delete(id);
  }
}
