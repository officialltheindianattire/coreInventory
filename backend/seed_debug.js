const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Starting seed...');
    const u = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN'
      }
    });
    console.log('User created/found:', u.id);

    const w = await prisma.warehouse.create({
      data: {
        name: 'Central Warehouse',
        location: 'New York'
      }
    });
    console.log('Warehouse created:', w.id);

    const l = await prisma.location.create({
      data: {
        name: 'Bin A1',
        type: 'STORAGE',
        warehouseId: w.id
      }
    });
    console.log('Location created:', l.id);

    const r = await prisma.receipt.create({
      data: {
        referenceId: 'WH/IN/0001',
        supplierName: 'Global Supplies',
        contact: 'John Doe',
        warehouseId: w.id,
        toLocationId: l.id,
        createdBy: u.id
      },
      include: {
        warehouse: true,
        location: true
      }
    });
    console.log('Receipt created:', r.referenceId);
    console.log('Receipt Warehouse:', r.warehouse?.name);
    console.log('Receipt Location:', r.location?.name);

  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
