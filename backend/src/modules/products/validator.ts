import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  categoryId: z.string().uuid('Invalid category ID format'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required').max(20),
  unitCost: z.number().min(0).optional(),
  initialQuantity: z.number().int().min(0).optional(),
  locationId: z.string().uuid().optional(),
});
