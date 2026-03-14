import { Router } from 'express';
import { AdjustmentController } from './controller';
import { AdjustmentService } from './service';
import { AdjustmentRepository } from './repository';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { adjustmentSchema } from '../inventory/validator';

const router = Router();

const repository = new AdjustmentRepository();
const service = new AdjustmentService(repository);
const controller = new AdjustmentController(service);

router.use(authenticate);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(adjustmentSchema), controller.create);

export default router;
