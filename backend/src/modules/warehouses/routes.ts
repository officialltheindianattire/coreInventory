import { Router } from 'express';
import { warehouseController } from './controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { warehouseSchema, locationSchema } from './validator';

const router = Router();

// Protect all routes
router.use(authenticate);

// ── Warehouses ──────────────────────────────────────────

// GET all warehouses
router.get('/', warehouseController.getAllWarehouses);

// GET a single warehouse
router.get('/:id', warehouseController.getWarehouseById);

// POST create warehouse (Admin/Manager only)
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(warehouseSchema),
  warehouseController.createWarehouse
);

// PUT update warehouse
router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(warehouseSchema.partial()),
  warehouseController.updateWarehouse
);

// DELETE warehouse
router.delete(
  '/:id',
  authorize('ADMIN'),
  warehouseController.deleteWarehouse
);

// ── Locations ───────────────────────────────────────────

// GET locations by warehouse
router.get('/:warehouseId/locations', warehouseController.getLocations);

// POST create location
router.post(
  '/:warehouseId/locations',
  authorize('ADMIN', 'MANAGER'),
  validate(locationSchema.pick({ name: true, type: true })),
  warehouseController.createLocation
);

// DELETE location
router.delete(
  '/locations/:id',
  authorize('ADMIN', 'MANAGER'),
  warehouseController.deleteLocation
);

export default router;
