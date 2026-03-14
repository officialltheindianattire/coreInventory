import { Request, Response } from 'express';
import { DashboardService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  getKPIs = async (_req: Request, res: Response) => {
    try {
      const kpis = await this.service.getKPIs();
      return sendSuccess(res, kpis, 'Dashboard KPIs retrieved');
    } catch (error: any) {
      logger.error('Error fetching KPIs', { error: error.message });
      return sendError(res, 'Failed to retrieve KPIs', 500);
    }
  };

  getRecentActivity = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activity = await this.service.getRecentActivity(limit);
      return sendSuccess(res, activity, 'Recent activity retrieved');
    } catch (error: any) {
      logger.error('Error fetching activity', { error: error.message });
      return sendError(res, 'Failed to retrieve activity', 500);
    }
  };
}
