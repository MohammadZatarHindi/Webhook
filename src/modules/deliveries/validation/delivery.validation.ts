import { z } from 'zod';
import { DELIVERY_STATUSES } from '../types/delivery.type';

// ----------------------
// Create Delivery Schema
// ----------------------
export const createDeliverySchema = z.object({
  job_id: z.coerce.number().int().min(1, { message: 'Job ID must be positive' }),
  subscriber_id: z.coerce.number().int().min(1, { message: 'Subscriber ID must be positive' }),
  status: z.enum(DELIVERY_STATUSES),
  attempts: z.coerce.number().int().min(0).optional(),
  response_code: z.coerce.number().int().min(100).optional(),
  response_body: z.string().min(1).optional(),
});
export type CreateDeliveryDTO = z.infer<typeof createDeliverySchema>;

// ----------------------
// Update Delivery Schema
// ----------------------
export const updateDeliverySchema = createDeliverySchema.partial();
export type UpdateDeliveryDTO = z.infer<typeof updateDeliverySchema>;

// ----------------------
// Route Params Schema
// ----------------------
export const deliveryParamsSchema = z.object({
  delivery_id: z.coerce.number().int().min(1, { message: 'Delivery ID must be positive' }),
});
export type DeliveryParams = z.infer<typeof deliveryParamsSchema>;