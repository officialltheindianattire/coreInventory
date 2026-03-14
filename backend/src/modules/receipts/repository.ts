import prisma from '../../utils/db';
import { Prisma, DocumentStatus } from '@prisma/client';

export class ReceiptRepository {
  async findAll() {
    return prisma.receipt.findMany({
      include: {
        warehouse: true,
        location: true,
        creator: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.receipt.findUnique({
      where: { id },
      include: {
        warehouse: true,
        location: true,
        creator: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
  }

  async create(data: { supplierName: string; contact?: string; scheduleDate?: Date; toLocationId?: string; warehouseId: string; createdBy: string }) {
    // Generate Reference ID (WH/IN/XXXX)
    const count = await prisma.receipt.count();
    const sequence = String(count + 1).padStart(4, '0');
    const referenceId = `WH/IN/${sequence}`;

    return prisma.receipt.create({
      data: {
        ...data,
        referenceId,
      },
      include: {
        warehouse: true,
        location: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async addItem(receiptId: string, data: { productId: string; quantity: number }) {
    return prisma.receiptItem.create({
      data: { ...data, receiptId },
      include: { product: true },
    });
  }

  async removeItem(itemId: string) {
    return prisma.receiptItem.delete({ where: { id: itemId } });
  }

  async updateStatus(id: string, status: DocumentStatus) {
    return prisma.receipt.update({
      where: { id },
      data: { status },
    });
  }

  async validateReceipt(receiptId: string, warehouseId: string) {
    // Get receipt with items
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { items: true, warehouse: { include: { locations: true } } },
    });

    if (!receipt) throw new Error('Receipt not found');
    if (receipt.status !== 'DRAFT' && receipt.status !== 'READY') {
      throw new Error('Receipt can only be validated from DRAFT or READY status');
    }
    if (receipt.items.length === 0) {
      throw new Error('Cannot validate an empty receipt');
    }

    // Use the explicitly provided toLocationId if exists, otherwise fallback to warehouse's first location
    const defaultLocation = receipt.toLocationId 
      ? receipt.warehouse.locations.find(l => l.id === receipt.toLocationId) 
      : receipt.warehouse.locations[0];
      
    if (!defaultLocation) {
      throw new Error('No valid destination location found for this warehouse');
    }

    // Transaction: update status + create stock movements
    return prisma.$transaction(async (tx) => {
      // Update receipt status to DONE
      await tx.receipt.update({
        where: { id: receiptId },
        data: { status: 'DONE' },
      });

      // Create stock movements for each item  
      const movements = receipt.items.map((item) => ({
        productId: item.productId,
        toLocationId: defaultLocation.id,
        quantity: item.quantity,
        movementType: 'RECEIPT' as const,
        referenceId: receiptId,
        referenceType: 'Receipt',
      }));

      await tx.stockMovement.createMany({ data: movements });

      return { receipt, movementsCreated: movements.length };
    });
  }

  async delete(id: string) {
    return prisma.receipt.delete({ where: { id } });
  }
}
