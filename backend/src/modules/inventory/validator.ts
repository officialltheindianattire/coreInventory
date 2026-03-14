import { z } from 'zod';

export const receiptSchema = z.object({
  supplierName: z.string().min(2, 'Supplier name must be at least 2 characters'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
});

export const receiptItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const deliverySchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
});

export const deliveryItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const transferSchema = z.object({
  fromLocationId: z.string().uuid('Invalid source location ID'),
  toLocationId: z.string().uuid('Invalid destination location ID'),
});

export const transferItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const adjustmentSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  locationId: z.string().uuid('Invalid location ID'),
  quantityChange: z.number().int().refine(v => v !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});
