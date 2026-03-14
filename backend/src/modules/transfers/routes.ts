import { Router } from 'express';
import { TransferController } from './controller';
import { TransferService } from './service';
import { TransferRepository } from './repository';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { transferSchema, transferItemSchema } from '../inventory/validator';

const router = Router();

const repository = new TransferRepository();
const service = new TransferService(repository);
const controller = new TransferController(service);

router.use(authenticate);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(transferSchema), controller.create);
router.post('/:id/items', authorize('ADMIN', 'MANAGER'), validate(transferItemSchema), controller.addItem);
router.delete('/:id/items/:itemId', authorize('ADMIN', 'MANAGER'), controller.removeItem);
router.post('/:id/validate', authorize('ADMIN', 'MANAGER'), controller.validate);
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), controller.cancel);
router.delete('/:id', authorize('ADMIN'), controller.delete);

export default router;
