import { z } from 'zod';

/* --------------------------
   Create Subscription Schema
-------------------------- */
// Validates body when creating a subscription
export const createSubscribtionSchema = z.object({
  pipeline_id: z
    .coerce.number() // Coerces string -> number
    .int()
    .min(1, { message: 'Pipeline ID must be a positive number' }),
  subscriber_id: z
    .coerce.number()
    .int()
    .min(1, { message: 'Subscriber ID must be a positive number' }),
});
export type CreateSubscribtionDTO = z.infer<typeof createSubscribtionSchema>;

/* --------------------------
   Update Subscription Schema
-------------------------- */
// Partial allows updating only some fields
export const updateSubscribtionSchema = createSubscribtionSchema.partial();
export type UpdateSubscribtionDTO = z.infer<typeof updateSubscribtionSchema>;

/* --------------------------
   Route Params Schema
-------------------------- */
// Validates :subscribtion_id route param
export const subscribtionParamsSchema = z.object({
  subscribtion_id: z
    .coerce.number()
    .int()
    .min(1, { message: 'Subscribtion ID must be a positive number' }),
});
export type SubscribtionParams = z.infer<typeof subscribtionParamsSchema>;