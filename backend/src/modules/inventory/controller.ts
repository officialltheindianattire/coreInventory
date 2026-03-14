import { Request, Response } from 'express';
import { InventoryService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  getStockLevels = async (_req: Request, res: Response) => {
    try {
      const stock = await this.service.getStockLevels();
      return sendSuccess(res, stock, 'Stock levels retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching stock levels', { error: error.message });
      return sendError(res, 'Failed to retrieve stock levels', 500);
    }
  };

  getStockByProduct = async (req: Request<{ productId: string }>, res: Response) => {
    try {
      const stock = await this.service.getStockByProduct(req.params.productId);
      return sendSuccess(res, stock, 'Product stock retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching product stock', { error: error.message });
      return sendError(res, 'Failed to retrieve product stock', 500);
    }
  };

  getMovementHistory = async (req: Request, res: Response) => {
    try {
      const { productId, movementType, limit } = req.query;
      const movements = await this.service.getMovementHistory({
        productId: productId as string,
        movementType: movementType as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      return sendSuccess(res, movements, 'Movement history retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching movement history', { error: error.message });
      return sendError(res, 'Failed to retrieve movement history', 500);
    }
  };

  getStockByLocation = async (_req: Request, res: Response) => {
    try {
      const stockLocations = await this.service.getStockByLocation();
      return sendSuccess(res, stockLocations, 'Stock by location retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching stock by location', { error: error.message });
      return sendError(res, 'Failed to retrieve stock by location', 500);
    }
  };
}
