import { z } from 'zod';

/* --------------------------
   Create Subscription Schema
-------------------------- */
// Validates body when creating a subscription
export const createSubscriptionSchema = z.object({
  pipeline_id: z
    .coerce.number() // Coerces string -> number
    .int()
    .min(1, { message: 'Pipeline ID must be a positive number' }),
  subscriber_id: z
    .coerce.number()
    .int()
    .min(1, { message: 'Subscriber ID must be a positive number' }),
});
export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionSchema>;

/* --------------------------
   Update Subscription Schema
-------------------------- */
// Partial allows updating only some fields
export const updateSubscriptionSchema = createSubscriptionSchema.partial();
export type UpdateSubscriptionDTO = z.infer<typeof updateSubscriptionSchema>;

/* --------------------------
   Route Params Schema
-------------------------- */
// Validates :subscription_id route param
export const subscriptionParamsSchema = z.object({
  subscription_id: z
    .coerce.number()
    .int()
    .min(1, { message: 'Subscription ID must be a positive number' }),
});
export type SubscriptionParams = z.infer<typeof subscriptionParamsSchema>;