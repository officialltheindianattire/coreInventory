import prisma from '../../utils/db';
import { DocumentStatus } from '@prisma/client';

export class TransferRepository {
  async findAll() {
    return prisma.transfer.findMany({
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.transfer.findUnique({
      where: { id },
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        items: { include: { product: true } },
      },
    });
  }

  async create(data: { fromLocationId: string; toLocationId: string }) {
    return prisma.transfer.create({
      data,
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
      },
    });
  }

  async addItem(transferId: string, data: { productId: string; quantity: number }) {
    return prisma.transferItem.create({
      data: { ...data, transferId },
      include: { product: true },
    });
  }

  async removeItem(itemId: string) {
    return prisma.transferItem.delete({ where: { id: itemId } });
  }

  async validateTransfer(transferId: string) {
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: { items: true },
    });

    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status !== 'DRAFT' && transfer.status !== 'READY') {
      throw new Error('Transfer can only be validated from DRAFT or READY status');
    }
    if (transfer.items.length === 0) throw new Error('Cannot validate an empty transfer');
    if (transfer.fromLocationId === transfer.toLocationId) {
      throw new Error('Source and destination locations cannot be the same');
    }

    // Check stock at source
    for (const item of transfer.items) {
      const incoming = await prisma.stockMovement.aggregate({
        where: { productId: item.productId, toLocationId: transfer.fromLocationId },
        _sum: { quantity: true },
      });
      const outgoing = await prisma.stockMovement.aggregate({
        where: { productId: item.productId, fromLocationId: transfer.fromLocationId },
        _sum: { quantity: true },
      });
      const available = (incoming._sum.quantity || 0) - (outgoing._sum.quantity || 0);
      if (available < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        throw new Error(`Insufficient stock for ${product?.name || item.productId} at source. Available: ${available}`);
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.transfer.update({ where: { id: transferId }, data: { status: 'DONE' } });

      // Two movements per item: OUT from source, IN to destination
      const movements = transfer.items.flatMap((item) => [
        {
          productId: item.productId,
          fromLocationId: transfer.fromLocationId,
          quantity: item.quantity,
          movementType: 'TRANSFER' as const,
          referenceId: transferId,
          referenceType: 'Transfer',
        },
        {
          productId: item.productId,
          toLocationId: transfer.toLocationId,
          quantity: item.quantity,
          movementType: 'TRANSFER' as const,
          referenceId: transferId,
          referenceType: 'Transfer',
        },
      ]);

      await tx.stockMovement.createMany({ data: movements });
      return { transfer, movementsCreated: movements.length };
    });
  }

  async updateStatus(id: string, status: DocumentStatus) {
    return prisma.transfer.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    return prisma.transfer.delete({ where: { id } });
  }
}
