import prisma from '../../utils/db';
import { DocumentStatus } from '@prisma/client';

export class DeliveryRepository {
  async findAll() {
    return prisma.delivery.findMany({
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
    });
  }

  async create(data: { customerName: string; warehouseId: string }) {
    return prisma.delivery.create({
      data,
      include: { warehouse: true },
    });
  }

  async addItem(deliveryId: string, data: { productId: string; quantity: number }) {
    return prisma.deliveryItem.create({
      data: { ...data, deliveryId },
      include: { product: true },
    });
  }

  async removeItem(itemId: string) {
    return prisma.deliveryItem.delete({ where: { id: itemId } });
  }

  async validateDelivery(deliveryId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { items: true, warehouse: { include: { locations: true } } },
    });

    if (!delivery) throw new Error('Delivery not found');
    if (delivery.status !== 'DRAFT' && delivery.status !== 'READY') {
      throw new Error('Delivery can only be validated from DRAFT or READY status');
    }
    if (delivery.items.length === 0) throw new Error('Cannot validate an empty delivery');

    const defaultLocation = delivery.warehouse.locations[0];
    if (!defaultLocation) throw new Error('Warehouse has no locations configured');

    // Check stock for each item
    for (const item of delivery.items) {
      const incoming = await prisma.stockMovement.aggregate({
        where: { productId: item.productId, toLocationId: defaultLocation.id },
        _sum: { quantity: true },
      });
      const outgoing = await prisma.stockMovement.aggregate({
        where: { productId: item.productId, fromLocationId: defaultLocation.id },
        _sum: { quantity: true },
      });
      const available = (incoming._sum.quantity || 0) - (outgoing._sum.quantity || 0);
      if (available < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        throw new Error(`Insufficient stock for ${product?.name || item.productId}. Available: ${available}, Requested: ${item.quantity}`);
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.delivery.update({ where: { id: deliveryId }, data: { status: 'DONE' } });

      const movements = delivery.items.map((item) => ({
        productId: item.productId,
        fromLocationId: defaultLocation.id,
        quantity: item.quantity,
        movementType: 'DELIVERY' as const,
        referenceId: deliveryId,
        referenceType: 'Delivery',
      }));

      await tx.stockMovement.createMany({ data: movements });
      return { delivery, movementsCreated: movements.length };
    });
  }

  async updateStatus(id: string, status: DocumentStatus) {
    return prisma.delivery.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    return prisma.delivery.delete({ where: { id } });
  }
}
