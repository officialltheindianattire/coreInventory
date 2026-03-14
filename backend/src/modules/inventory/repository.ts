import prisma from '../../utils/db';

export class InventoryRepository {
  async getStockByProduct(productId: string) {
    const movements = await prisma.stockMovement.groupBy({
      by: ['toLocationId'],
      where: { productId, toLocationId: { not: null } },
      _sum: { quantity: true },
    });

    const outgoing = await prisma.stockMovement.groupBy({
      by: ['fromLocationId'],
      where: { productId, fromLocationId: { not: null } },
      _sum: { quantity: true },
    });

    return { incoming: movements, outgoing };
  }

  async getStockLevels() {
    // Get all products with aggregated incoming and outgoing quantities
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const stockData = await Promise.all(
      products.map(async (product) => {
        const incoming = await prisma.stockMovement.aggregate({
          where: { productId: product.id, toLocationId: { not: null } },
          _sum: { quantity: true },
        });
        const outgoing = await prisma.stockMovement.aggregate({
          where: { productId: product.id, fromLocationId: { not: null } },
          _sum: { quantity: true },
        });
        const totalIn = incoming._sum.quantity || 0;
        const totalOut = outgoing._sum.quantity || 0;
        return {
          ...product,
          totalStock: totalIn - totalOut,
          totalIn,
          totalOut,
        };
      })
    );

    return stockData;
  }

  async getMovementHistory(filters?: { productId?: string; movementType?: string; limit?: number }) {
    return prisma.stockMovement.findMany({
      where: {
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.movementType && { movementType: filters.movementType as any }),
      },
      include: {
        product: true,
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
    });
  }

  async getStockByLocation() {
    const locations = await prisma.location.findMany({
      include: { warehouse: true },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
    const products = await prisma.product.findMany();
    const productMap = new Map(products.map(p => [p.id, p]));

    const incoming = await prisma.stockMovement.groupBy({
      by: ['toLocationId', 'productId'],
      where: { toLocationId: { not: null } },
      _sum: { quantity: true }
    });

    const outgoing = await prisma.stockMovement.groupBy({
      by: ['fromLocationId', 'productId'],
      where: { fromLocationId: { not: null } },
      _sum: { quantity: true }
    });

    // Map: locationId -> { productId -> quantity }
    const stockMap = new Map<string, Map<string, number>>();

    for (const inc of incoming) {
      if (!inc.toLocationId) continue;
      if (!stockMap.has(inc.toLocationId)) stockMap.set(inc.toLocationId, new Map());
      const locMap = stockMap.get(inc.toLocationId)!;
      locMap.set(inc.productId, (locMap.get(inc.productId) || 0) + (inc._sum.quantity || 0));
    }

    for (const out of outgoing) {
      if (!out.fromLocationId) continue;
      if (!stockMap.has(out.fromLocationId)) stockMap.set(out.fromLocationId, new Map());
      const locMap = stockMap.get(out.fromLocationId)!;
      locMap.set(out.productId, (locMap.get(out.productId) || 0) - (out._sum.quantity || 0));
    }

    // Build final result
    const result = locations.map(loc => {
      const locStock = stockMap.get(loc.id) || new Map();
      const items = Array.from(locStock.entries())
        .map(([productId, quantity]) => {
           const product = productMap.get(productId);
           return { product, quantity };
        })
        .filter(item => item.quantity > 0 && item.product); // Only show products with positive stock
      
      return {
        ...loc,
        items
      };
    }).filter(loc => loc.items.length > 0); // Only return locations that actually have stock

    return result;
  }
}
