import { Router } from 'express';
import { DashboardController } from './controller';
import { DashboardService } from './service';
import { DashboardRepository } from './repository';
import { authenticate } from '../../middleware/auth';

const router = Router();

const repository = new DashboardRepository();
const service = new DashboardService(repository);
const controller = new DashboardController(service);

router.use(authenticate);

router.get('/kpis', controller.getKPIs);
router.get('/activity', controller.getRecentActivity);

export default router;
