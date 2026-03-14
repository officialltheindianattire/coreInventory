import { Router } from 'express';
import { InventoryController } from './controller';
import { InventoryService } from './service';
import { InventoryRepository } from './repository';
import { authenticate } from '../../middleware/auth';

const router = Router();

const repository = new InventoryRepository();
const service = new InventoryService(repository);
const controller = new InventoryController(service);

router.use(authenticate);
router.get('/stock', controller.getStockLevels);
router.get('/locations', controller.getStockByLocation);
router.get('/stock/:productId', controller.getStockByProduct);
router.get('/history', controller.getMovementHistory);

export default router;
