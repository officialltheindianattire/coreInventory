import { Router } from 'express';
import { DeliveryController } from './controller';
import { DeliveryService } from './service';
import { DeliveryRepository } from './repository';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { deliverySchema, deliveryItemSchema } from '../inventory/validator';

const router = Router();

const repository = new DeliveryRepository();
const service = new DeliveryService(repository);
const controller = new DeliveryController(service);

router.use(authenticate);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', authorize('ADMIN', 'MANAGER', 'STAFF'), validate(deliverySchema), controller.create);
router.post('/:id/items', authorize('ADMIN', 'MANAGER', 'STAFF'), validate(deliveryItemSchema), controller.addItem);
router.delete('/:id/items/:itemId', authorize('ADMIN', 'MANAGER'), controller.removeItem);
router.post('/:id/validate', authorize('ADMIN', 'MANAGER'), controller.validate);
router.post('/:id/ready', authorize('ADMIN', 'MANAGER'), controller.markReady);
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), controller.cancel);
router.delete('/:id', authorize('ADMIN'), controller.delete);

export default router;
