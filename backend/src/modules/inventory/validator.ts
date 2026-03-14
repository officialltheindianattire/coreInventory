import { z } from 'zod';

export const receiptSchema = z.object({
  contact: z.string().optional(),
  supplierName: z.string().min(2, 'Supplier name must be at least 2 characters'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  toLocationId: z.string().uuid('Invalid location ID').optional(),
  scheduleDate: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val).toISOString() : undefined),
});

export const receiptItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const deliverySchema = z.object({
  contact: z.string().optional(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  fromLocationId: z.string().uuid('Invalid location ID').optional(),
  scheduleDate: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val).toISOString() : undefined),
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
