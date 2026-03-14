import prisma from '../../utils/db';

export class DashboardRepository {
  async getKPIs() {
    const [totalProducts, totalWarehouses, totalLocations] = await Promise.all([
      prisma.product.count(),
      prisma.warehouse.count(),
      prisma.location.count(),
    ]);

    // Count documents by status
    const [pendingReceipts, pendingDeliveries, pendingTransfers] = await Promise.all([
      prisma.receipt.count({ where: { status: { in: ['DRAFT', 'WAITING', 'READY'] } } }),
      prisma.delivery.count({ where: { status: { in: ['DRAFT', 'WAITING', 'READY'] } } }),
      prisma.transfer.count({ where: { status: { in: ['DRAFT', 'WAITING', 'READY'] } } }),
    ]);

    // Compute total stock (sum of all incoming - outgoing movements)
    const totalIncoming = await prisma.stockMovement.aggregate({
      where: { toLocationId: { not: null } },
      _sum: { quantity: true },
    });
    const totalOutgoing = await prisma.stockMovement.aggregate({
      where: { fromLocationId: { not: null } },
      _sum: { quantity: true },
    });
    const totalStock = (totalIncoming._sum.quantity || 0) - (totalOutgoing._sum.quantity || 0);

    return {
      totalProducts,
      totalWarehouses,
      totalLocations,
      totalStock,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers,
    };
  }

  async getRecentActivity(limit: number = 10) {
    return prisma.stockMovement.findMany({
      include: {
        product: true,
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
