import { Request, Response } from 'express';
import { ReceiptService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';
import { AuthRequest } from '../../middleware/auth';

export class ReceiptController {
  constructor(private readonly service: ReceiptService) {}

  findAll = async (_req: Request, res: Response) => {
    try {
      const receipts = await this.service.findAll();
      return sendSuccess(res, receipts, 'Receipts retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching receipts', { error: error.message });
      return sendError(res, 'Failed to retrieve receipts', 500);
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const receipt = await this.service.findById(req.params.id);
      return sendSuccess(res, receipt, 'Receipt retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Receipt not found') return sendError(res, error.message, 404);
      logger.error('Error fetching receipt', { error: error.message });
      return sendError(res, 'Failed to retrieve receipt', 500);
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const receipt = await this.service.create({
        ...req.body,
        createdBy: req.user!.userId,
      });
      return sendSuccess(res, receipt, 'Receipt created successfully', 201);
    } catch (error: any) {
      logger.error('Error creating receipt', { error: error.message });
      return sendError(res, 'Failed to create receipt', 500);
    }
  };

  addItem = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const item = await this.service.addItem(req.params.id, req.body);
      return sendSuccess(res, item, 'Item added to receipt', 201);
    } catch (error: any) {
      if (error.message.includes('Cannot add items')) return sendError(res, error.message, 400);
      if (error.message === 'Receipt not found') return sendError(res, error.message, 404);
      logger.error('Error adding receipt item', { error: error.message });
      return sendError(res, 'Failed to add item', 500);
    }
  };

  removeItem = async (req: Request<{ id: string; itemId: string }>, res: Response) => {
    try {
      await this.service.removeItem(req.params.id, req.params.itemId);
      return sendSuccess(res, null, 'Item removed from receipt');
    } catch (error: any) {
      if (error.message.includes('Cannot remove items')) return sendError(res, error.message, 400);
      logger.error('Error removing receipt item', { error: error.message });
      return sendError(res, 'Failed to remove item', 500);
    }
  };

  validate = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await this.service.validate(req.params.id);
      return sendSuccess(res, result, 'Receipt validated and stock movements created');
    } catch (error: any) {
      if (error.message.includes('Cannot validate') || error.message.includes('only be validated') ||
          error.message.includes('empty receipt') || error.message.includes('no locations')) {
        return sendError(res, error.message, 400);
      }
      if (error.message === 'Receipt not found') return sendError(res, error.message, 404);
      logger.error('Error validating receipt', { error: error.message });
      return sendError(res, 'Failed to validate receipt', 500);
    }
  };

  markReady = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const receipt = await this.service.markReady(req.params.id);
      return sendSuccess(res, receipt, 'Receipt marked as ready');
    } catch (error: any) {
      if (error.message.includes('Status must be DRAFT')) return sendError(res, error.message, 400);
      if (error.message === 'Receipt not found') return sendError(res, error.message, 404);
      logger.error('Error marking receipt ready', { error: error.message });
      return sendError(res, 'Failed to mark receipt ready', 500);
    }
  };

  cancel = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const receipt = await this.service.cancel(req.params.id);
      return sendSuccess(res, receipt, 'Receipt canceled');
    } catch (error: any) {
      if (error.message.includes('Cannot cancel')) return sendError(res, error.message, 400);
      if (error.message === 'Receipt not found') return sendError(res, error.message, 404);
      logger.error('Error canceling receipt', { error: error.message });
      return sendError(res, 'Failed to cancel receipt', 500);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.service.delete(req.params.id);
      return sendSuccess(res, null, 'Receipt deleted');
    } catch (error: any) {
      if (error.message.includes('Cannot delete')) return sendError(res, error.message, 400);
      if (error.message === 'Receipt not found') return sendError(res, error.message, 404);
      logger.error('Error deleting receipt', { error: error.message });
      return sendError(res, 'Failed to delete receipt', 500);
    }
  };
}
