import { Request, Response } from 'express';
import { warehouseService } from './service';
import { warehouseSchema, locationSchema } from './validator';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';
import { z } from 'zod';

export class WarehouseController {
  // Warehouses
  async createWarehouse(req: Request, res: Response) {
    try {
      const validatedData = warehouseSchema.parse(req.body);
      const warehouse = await warehouseService.createWarehouse(validatedData);
      return sendSuccess(res, warehouse, 'Warehouse created successfully', 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');
        return sendError(res, messages, 400);
      }
      logger.error('Error creating warehouse', { error: error.message });
      return sendError(res, 'Failed to create warehouse', 500);
    }
  }

  async getAllWarehouses(req: Request, res: Response) {
    try {
      const warehouses = await warehouseService.getAllWarehouses();
      return sendSuccess(res, warehouses, 'Warehouses fetched successfully');
    } catch (error: any) {
      logger.error('Error fetching warehouses', { error: error.message });
      return sendError(res, 'Failed to fetch warehouses', 500);
    }
  }

  async getWarehouseById(req: Request<{ id: string }>, res: Response) {
    try {
      const warehouse = await warehouseService.getWarehouseById(req.params.id);
      return sendSuccess(res, warehouse, 'Warehouse fetched successfully');
    } catch (error: any) {
      if (error.message === 'Warehouse not found') {
        return sendError(res, error.message, 404);
      }
      logger.error('Error fetching warehouse', { error: error.message });
      return sendError(res, 'Failed to fetch warehouse', 500);
    }
  }

  async updateWarehouse(req: Request<{ id: string }>, res: Response) {
    try {
      const validatedData = warehouseSchema.partial().parse(req.body);
      const warehouse = await warehouseService.updateWarehouse(req.params.id, validatedData);
      return sendSuccess(res, warehouse, 'Warehouse updated successfully');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
         const messages = error.issues.map((issue) => issue.message).join(', ');
         return sendError(res, messages, 400);
      }
      if (error.message === 'Warehouse not found') {
        return sendError(res, error.message, 404);
      }
      logger.error('Error updating warehouse', { error: error.message });
      return sendError(res, 'Failed to update warehouse', 500);
    }
  }

  async deleteWarehouse(req: Request<{ id: string }>, res: Response) {
    try {
      await warehouseService.deleteWarehouse(req.params.id);
      return sendSuccess(res, null, 'Warehouse deleted successfully');
    } catch (error: any) {
      if (error.message === 'Warehouse not found') {
        return sendError(res, error.message, 404);
      }
      // Often fails due to relation constraints (e.g., locations still exist)
      logger.error('Error deleting warehouse', { error: error.message });
      return sendError(res, 'Failed to delete warehouse. Ensure all locations are removed first.', 400);
    }
  }

  // Locations
  async createLocation(req: Request<{ warehouseId: string }>, res: Response) {
    try {
      // Validate without warehouseId first, since we get it from params
      const shape = locationSchema.pick({ name: true, type: true });
      const validatedData = shape.parse(req.body);
      
      const location = await warehouseService.createLocation(req.params.warehouseId, validatedData);
      return sendSuccess(res, location, 'Location created successfully', 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');
        return sendError(res, messages, 400);
      }
      if (error.message === 'Warehouse not found') {
        return sendError(res, error.message, 404);
      }
      logger.error('Error creating location', { error: error.message });
      return sendError(res, 'Failed to create location', 500);
    }
  }

  async getLocations(req: Request<{ warehouseId: string }>, res: Response) {
    try {
      const locations = await warehouseService.getLocations(req.params.warehouseId);
      return sendSuccess(res, locations, 'Locations fetched successfully');
    } catch (error: any) {
      if (error.message === 'Warehouse not found') {
        return sendError(res, error.message, 404);
      }
      logger.error('Error fetching locations', { error: error.message });
      return sendError(res, 'Failed to fetch locations', 500);
    }
  }

  async deleteLocation(req: Request<{ id: string }>, res: Response) {
    try {
      await warehouseService.deleteLocation(req.params.id);
      return sendSuccess(res, null, 'Location deleted successfully');
    } catch (error: any) {
      logger.error('Error deleting location', { error: error.message });
      return sendError(res, 'Failed to delete location', 400);
    }
  }
}

export const warehouseController = new WarehouseController();
