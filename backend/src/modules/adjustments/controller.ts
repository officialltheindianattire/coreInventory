import { Request, Response } from 'express';
import { AdjustmentService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';

export class AdjustmentController {
  constructor(private readonly service: AdjustmentService) {}

  findAll = async (_req: Request, res: Response) => {
    try {
      const adjustments = await this.service.findAll();
      return sendSuccess(res, adjustments, 'Adjustments retrieved');
    } catch (error: any) {
      logger.error('Error fetching adjustments', { error: error.message });
      return sendError(res, 'Failed to retrieve adjustments', 500);
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const adjustment = await this.service.findById(req.params.id);
      return sendSuccess(res, adjustment, 'Adjustment retrieved');
    } catch (error: any) {
      if (error.message === 'Adjustment not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to retrieve adjustment', 500);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const adjustment = await this.service.create(req.body);
      return sendSuccess(res, adjustment, 'Adjustment created and stock updated', 201);
    } catch (error: any) {
      logger.error('Error creating adjustment', { error: error.message });
      return sendError(res, 'Failed to create adjustment', 500);
    }
  };
}
