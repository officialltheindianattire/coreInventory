import { Request, Response } from 'express';
import { TransferService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';

export class TransferController {
  constructor(private readonly service: TransferService) {}

  findAll = async (_req: Request, res: Response) => {
    try {
      const transfers = await this.service.findAll();
      return sendSuccess(res, transfers, 'Transfers retrieved');
    } catch (error: any) {
      logger.error('Error fetching transfers', { error: error.message });
      return sendError(res, 'Failed to retrieve transfers', 500);
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const transfer = await this.service.findById(req.params.id);
      return sendSuccess(res, transfer, 'Transfer retrieved');
    } catch (error: any) {
      if (error.message === 'Transfer not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to retrieve transfer', 500);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const transfer = await this.service.create(req.body);
      return sendSuccess(res, transfer, 'Transfer created', 201);
    } catch (error: any) {
      if (error.message.includes('must be different')) return sendError(res, error.message, 400);
      logger.error('Error creating transfer', { error: error.message });
      return sendError(res, 'Failed to create transfer', 500);
    }
  };

  addItem = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const item = await this.service.addItem(req.params.id, req.body);
      return sendSuccess(res, item, 'Item added', 201);
    } catch (error: any) {
      if (error.message.includes('Cannot modify')) return sendError(res, error.message, 400);
      if (error.message === 'Transfer not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to add item', 500);
    }
  };

  removeItem = async (req: Request<{ id: string; itemId: string }>, res: Response) => {
    try {
      await this.service.removeItem(req.params.id, req.params.itemId);
      return sendSuccess(res, null, 'Item removed');
    } catch (error: any) {
      if (error.message.includes('Cannot modify')) return sendError(res, error.message, 400);
      return sendError(res, 'Failed to remove item', 500);
    }
  };

  validate = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await this.service.validate(req.params.id);
      return sendSuccess(res, result, 'Transfer validated and stock moved');
    } catch (error: any) {
      if (error.message.includes('Insufficient') || error.message.includes('Cannot') ||
          error.message.includes('empty') || error.message.includes('same') ||
          error.message.includes('only be validated')) {
        return sendError(res, error.message, 400);
      }
      if (error.message === 'Transfer not found') return sendError(res, error.message, 404);
      logger.error('Error validating transfer', { error: error.message });
      return sendError(res, 'Failed to validate transfer', 500);
    }
  };

  cancel = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const transfer = await this.service.cancel(req.params.id);
      return sendSuccess(res, transfer, 'Transfer canceled');
    } catch (error: any) {
      if (error.message.includes('Cannot cancel')) return sendError(res, error.message, 400);
      if (error.message === 'Transfer not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to cancel transfer', 500);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.service.delete(req.params.id);
      return sendSuccess(res, null, 'Transfer deleted');
    } catch (error: any) {
      if (error.message.includes('Cannot delete')) return sendError(res, error.message, 400);
      if (error.message === 'Transfer not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to delete transfer', 500);
    }
  };
}
