import { Request, Response } from 'express';
import { DeliveryService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';

export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  findAll = async (_req: Request, res: Response) => {
    try {
      const deliveries = await this.service.findAll();
      return sendSuccess(res, deliveries, 'Deliveries retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching deliveries', { error: error.message });
      return sendError(res, 'Failed to retrieve deliveries', 500);
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const delivery = await this.service.findById(req.params.id);
      return sendSuccess(res, delivery, 'Delivery retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Delivery not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to retrieve delivery', 500);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const delivery = await this.service.create(req.body);
      return sendSuccess(res, delivery, 'Delivery created successfully', 201);
    } catch (error: any) {
      logger.error('Error creating delivery', { error: error.message });
      return sendError(res, 'Failed to create delivery', 500);
    }
  };

  addItem = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const item = await this.service.addItem(req.params.id, req.body);
      return sendSuccess(res, item, 'Item added to delivery', 201);
    } catch (error: any) {
      if (error.message.includes('Cannot modify')) return sendError(res, error.message, 400);
      if (error.message === 'Delivery not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to add item', 500);
    }
  };

  removeItem = async (req: Request<{ id: string; itemId: string }>, res: Response) => {
    try {
      await this.service.removeItem(req.params.id, req.params.itemId);
      return sendSuccess(res, null, 'Item removed from delivery');
    } catch (error: any) {
      if (error.message.includes('Cannot modify')) return sendError(res, error.message, 400);
      return sendError(res, 'Failed to remove item', 500);
    }
  };

  validate = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await this.service.validate(req.params.id);
      return sendSuccess(res, result, 'Delivery validated and stock movements created');
    } catch (error: any) {
      if (error.message.includes('Insufficient stock') || error.message.includes('Cannot validate') ||
          error.message.includes('empty delivery') || error.message.includes('no locations') ||
          error.message.includes('only be validated')) {
        return sendError(res, error.message, 400);
      }
      if (error.message === 'Delivery not found') return sendError(res, error.message, 404);
      logger.error('Error validating delivery', { error: error.message });
      return sendError(res, 'Failed to validate delivery', 500);
    }
  };

  cancel = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const delivery = await this.service.cancel(req.params.id);
      return sendSuccess(res, delivery, 'Delivery canceled');
    } catch (error: any) {
      if (error.message.includes('Cannot cancel')) return sendError(res, error.message, 400);
      if (error.message === 'Delivery not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to cancel delivery', 500);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.service.delete(req.params.id);
      return sendSuccess(res, null, 'Delivery deleted');
    } catch (error: any) {
      if (error.message.includes('Cannot delete')) return sendError(res, error.message, 400);
      if (error.message === 'Delivery not found') return sendError(res, error.message, 404);
      return sendError(res, 'Failed to delete delivery', 500);
    }
  };
}
