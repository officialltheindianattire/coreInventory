import { Router } from 'express';
import { ReceiptController } from './controller';
import { ReceiptService } from './service';
import { ReceiptRepository } from './repository';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { receiptSchema, receiptItemSchema } from '../inventory/validator';

const router = Router();

const repository = new ReceiptRepository();
const service = new ReceiptService(repository);
const controller = new ReceiptController(service);

router.use(authenticate);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', authorize('ADMIN', 'MANAGER', 'STAFF'), validate(receiptSchema), controller.create);
router.post('/:id/items', authorize('ADMIN', 'MANAGER', 'STAFF'), validate(receiptItemSchema), controller.addItem);
router.delete('/:id/items/:itemId', authorize('ADMIN', 'MANAGER'), controller.removeItem);
router.post('/:id/validate', authorize('ADMIN', 'MANAGER'), controller.validate);
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), controller.cancel);
router.delete('/:id', authorize('ADMIN'), controller.delete);

export default router;
