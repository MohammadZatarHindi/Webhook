import { z } from 'zod';

/* --------------------------
   Create Subscriber Schema
-------------------------- */
// Validates request body when creating a subscriber
export const createSubscriberSchema = z.object({
  url: z.string().url({ message: 'Invalid URL format' }), // Must be a valid URL
});
export type CreateSubscriberDTO = z.infer<typeof createSubscriberSchema>;

/* --------------------------
   Update Subscriber Schema
-------------------------- */
// All fields optional for updates
export const updateSubscriberSchema = createSubscriberSchema.partial();
export type UpdateSubscriberDTO = z.infer<typeof updateSubscriberSchema>;

/* --------------------------
   Route Params Schema
-------------------------- */
// Validates route params, e.g., :subscriber_id
export const subscriberParamsSchema = z.object({
  subscriber_id: z
    .coerce.number() // Coerce string -> number (common in Express)
    .int()           // Must be integer
    .min(1, { message: 'Subscriber ID must be positive' }), // Positive IDs only
});
export type SubscriberParams = z.infer<typeof subscriberParamsSchema>;