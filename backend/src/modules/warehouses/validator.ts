import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
});

export const locationSchema = z.object({
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  type: z.string().min(2, 'Location type must be at least 2 characters'),
});

export type CreateWarehousePayload = z.infer<typeof warehouseSchema>;
export type CreateLocationPayload = z.infer<typeof locationSchema>;
