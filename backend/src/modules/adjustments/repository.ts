import prisma from '../../utils/db';

export class AdjustmentRepository {
  async findAll() {
    return prisma.adjustment.findMany({
      include: {
        product: true,
        location: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.adjustment.findUnique({
      where: { id },
      include: {
        product: true,
        location: { include: { warehouse: true } },
      },
    });
  }

  async create(data: { productId: string; locationId: string; quantityChange: number; reason: string }) {
    // Transaction: create adjustment + stock movement
    return prisma.$transaction(async (tx) => {
      const adjustment = await tx.adjustment.create({
        data,
        include: { product: true, location: true },
      });

      // Create stock movement for the adjustment
      const movementData: any = {
        productId: data.productId,
        quantity: Math.abs(data.quantityChange),
        movementType: 'ADJUSTMENT',
        referenceId: adjustment.id,
        referenceType: 'Adjustment',
      };

      if (data.quantityChange > 0) {
        movementData.toLocationId = data.locationId; // Adding stock
      } else {
        movementData.fromLocationId = data.locationId; // Removing stock
      }

      await tx.stockMovement.create({ data: movementData });

      return adjustment;
    });
  }
}
