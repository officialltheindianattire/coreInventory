import { Request, Response } from 'express';
import { ProductService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';
import { z } from 'zod';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  // --- Categories ---
  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.service.getCategories();
      return sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching categories', { error: error.message });
      return sendError(res, 'Failed to retrieve categories', 500);
    }
  };

  createCategory = async (req: Request, res: Response) => {
    try {
      const category = await this.service.createCategory(req.body);
      return sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');
        return sendError(res, messages, 400);
      }
      if (error.message === 'Category with this name already exists') {
        return sendError(res, error.message, 400);
      }
      logger.error('Error creating category', { error: error.message });
      return sendError(res, 'Failed to create category', 500);
    }
  };

  updateCategory = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const category = await this.service.updateCategory(req.params.id, req.body);
      return sendSuccess(res, category, 'Category updated successfully');
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return sendError(res, error.message, 404);
      }
      if (error.message === 'Category with this name already exists') {
         return sendError(res, error.message, 400);
      }
      logger.error('Error updating category', { error: error.message });
      return sendError(res, 'Failed to update category', 500);
    }
  };

  deleteCategory = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.service.deleteCategory(req.params.id);
      return sendSuccess(res, null, 'Category deleted successfully');
    } catch (error: any) {
      if (error.message === 'Category not found') {
        return sendError(res, error.message, 404);
      }
      if (error.message === 'Cannot delete category because it contains products') {
         return sendError(res, error.message, 400);
      }
      logger.error('Error deleting category', { error: error.message });
      return sendError(res, 'Failed to delete category', 500);
    }
  };

  // --- Products ---
  getProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.service.getProducts();
      return sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching products', { error: error.message });
      return sendError(res, 'Failed to retrieve products', 500);
    }
  };

  getProductById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const product = await this.service.getProductById(req.params.id);
      return sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return sendError(res, error.message, 404);
      }
      logger.error('Error fetching product details', { error: error.message });
      return sendError(res, 'Failed to retrieve product details', 500);
    }
  };

  createProduct = async (req: Request, res: Response) => {
    try {
      const validatedData = z.object({
         name: z.string(),
         sku: z.string(),
         categoryId: z.string(),
         unitOfMeasure: z.string(),
         unitCost: z.number().optional(),
         initialQuantity: z.number().optional(),
         locationId: z.string().optional()
      }).parse(req.body);

      const product = await this.service.createProduct(validatedData);
      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error: any) {
       if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');
        return sendError(res, messages, 400);
      }
      if (error.message === 'Product with this SKU already exists' || error.message === 'Category not found' || error.message === 'Location not found') {
        return sendError(res, error.message, 400);
      }
      logger.error('Error creating product', { error: error.message });
      return sendError(res, 'Failed to create product', 500);
    }
  };

  updateProduct = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const product = await this.service.updateProduct(req.params.id, req.body);
      return sendSuccess(res, product, 'Product updated successfully');
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return sendError(res, error.message, 404);
      }
      if (error.message === 'Product with this SKU already exists' || error.message === 'Category not found') {
         return sendError(res, error.message, 400);
      }
      logger.error('Error updating product', { error: error.message });
      return sendError(res, 'Failed to update product', 500);
    }
  };

  deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.service.deleteProduct(req.params.id);
      return sendSuccess(res, null, 'Product deleted successfully');
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return sendError(res, error.message, 404);
      }
      logger.error('Error deleting product', { error: error.message });
      return sendError(res, 'Failed to delete product', 500);
    }
  };
}
